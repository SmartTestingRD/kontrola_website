import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../src/data/db.js';
import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req: Request, res: Response) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;

        const sorteoId = req.query.sorteo_id as string;
        const juegoId = req.query.juego_id as string;
        const sistemaId = (req.query.sistema_id as string) || '1';
        const userConsorcioId = decoded.consorcioId;
        const consorcioId = userConsorcioId === 1 ? (req.query.consorcio_id as string || null) : String(userConsorcioId);
        const page = parseInt(req.query.page as string) || 1;
        const limit = 25;
        const offset = (page - 1) * limit;

        if (!sorteoId || !juegoId) {
            return res.status(400).json({ message: 'sorteo_id and juego_id are required' });
        }

        // --- jugadas_by_sorteo ---
        let filtros = ' AND ss.sorteo_id = $1 AND sn.juego_id = $2';
        const valores: any[] = [sorteoId, juegoId];

        if (consorcioId) {
            filtros += ' AND ss.consorcio_id = $' + (valores.length + 1);
            valores.push(consorcioId);
        }
        if (sistemaId) {
            filtros += ' AND ss.sistema_id = $' + (valores.length + 1);
            valores.push(sistemaId);
        }

        const baseQuery = `
            SELECT
                pr.premio_id,
                ss.loteria_id,
                ss.loteria_nombre,
                ss.sorteo_id,
                ss.sorteo_nombre,
                ss.sorteo_numero,
                sn.juego_id,
                jug.juego_nombre,
                ss.hora_cierre,
                ss.fecha_sorteo as fecha_sorteo,
                array_to_string(sn.numero_apuesta, ' ') as numero_apuesta,
                (date_trunc('day', ss.fecha_sorteo) + ss.hora_cierre::time) as fecha_cierre_sorteo,
                CASE WHEN NOW() - interval '4 hour' > (date_trunc('day', ss.fecha_sorteo) + ss.hora_cierre::time) THEN 1 ELSE 0 END as sorteo_cerrado,
                COALESCE(sum(sn.cantidad_apuesta - sn.cantidad_anulado), 0) as cantidad_apuesta,
                COALESCE(sum(sn.monto_apuesta - sn.monto_anulado), 0) as monto_apuesta,
                COALESCE(sum(sn.cantidad_apuesta + sn.cantidad_apuesta_post - sn.cantidad_anulado), 0) as cantidad_apuesta_post,
                COALESCE(sum(sn.monto_apuesta + sn.monto_apuesta_post - sn.monto_anulado), 0) as monto_apuesta_post
            FROM sumario_sorteo ss
            LEFT JOIN sumario_numero sn ON sn.consorcio_id = ss.consorcio_id and sn.loteria_id = ss.loteria_id and sn.sorteo_id = ss.sorteo_id
            LEFT JOIN juego jug ON sn.juego_id = jug.juego_id
            LEFT JOIN premio pr ON ss.sorteo_id = pr.sorteo_id
            WHERE 1=1 ${filtros}
            GROUP BY pr.premio_id,
                     ss.loteria_id,
                     ss.loteria_nombre,
                     ss.sorteo_id,
                     ss.sorteo_nombre,
                     ss.sorteo_numero,
                     sn.juego_id,
                     jug.juego_nombre,
                     ss.hora_cierre,
                     ss.fecha_sorteo,
                     sn.numero_apuesta
        `;

        // 1. Get Count for Pagination
        const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) as count_query`;
        const countResult = await pool.query(countQuery, valores);
        const totalCount = parseInt(countResult.rows[0].count);
        const totalPages = Math.max(1, Math.ceil(totalCount / limit));

        // 2. Get Paginated Jugadas
        const paginatedQuery = `${baseQuery} ORDER BY sn.numero_apuesta ASC LIMIT ${limit} OFFSET ${offset}`;
        const jugadasResult = await pool.query(paginatedQuery, valores);
        const jugadas = jugadasResult.rows;

        // --- calculate_detalles_tickets_by_juegos & total_ganancias ---
        let total_vendido = 0;
        let detalles: any = {};

        if (jugadas.length > 0) {
            const j = jugadas[0];
            detalles.sorteo_nombre = j.sorteo_nombre;
            detalles.sorteo_numero = j.sorteo_numero;
            detalles.loteria_nombre = j.loteria_nombre;
            detalles.juego_nombre = j.juego_nombre || '';
            detalles.fecha_hora_sorteo = j.fecha_cierre_sorteo;
            detalles.fecha_sorteo = j.fecha_sorteo;
            detalles.hora_cierre = j.hora_cierre;
            detalles.sorteo_cerrado = j.sorteo_cerrado;
        }

        // --- total de ganancias global para este juego/sorteo_id ---
        let gananciasFiltros = ' AND sn.sorteo_id = $1 AND sn.juego_id = $2';
        const gananciasValores: any[] = [sorteoId, juegoId];

        if (consorcioId) {
            gananciasFiltros += ' AND sn.consorcio_id = $' + (gananciasValores.length + 1);
            gananciasValores.push(consorcioId);
        }
        if (sistemaId) {
            gananciasFiltros += ' AND sn.sistema_id = $' + (gananciasValores.length + 1);
            gananciasValores.push(sistemaId);
        }

        const gananciasQuery = `
            SELECT COALESCE(sum((sn.monto_apuesta + sn.monto_apuesta_post) - sn.monto_anulado), 0) as total_vendido
            FROM sumario_numero sn
            WHERE 1=1 ${gananciasFiltros}
        `;
        const gananciasResult = await pool.query(gananciasQuery, gananciasValores);

        total_vendido = parseFloat(gananciasResult.rows[0].total_vendido) || 0;
        detalles.total_vendido = total_vendido;

        return res.status(200).json({
            jugadas,
            detalles,
            total_ganancias: total_vendido,
            total_pages: totalPages,
            current_page: page
        });

    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        console.error('Juego Detail API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
