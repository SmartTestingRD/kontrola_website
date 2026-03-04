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
        const sistemaId = (req.query.sistema_id as string) || '1';
        const userConsorcioId = decoded.consorcioId;
        const consorcioId = userConsorcioId === 1 ? (req.query.consorcio_id as string || null) : String(userConsorcioId);
        const loteriaId = (req.query.loteria_id as string) || null;

        if (!sorteoId) {
            return res.status(400).json({ message: 'sorteo_id is required' });
        }

        // --- total_premiado_por_sorteo ---
        let premiosFiltros = ' AND sp.sorteo_id = $1';
        const premiosValores: any[] = [sorteoId];
        if (consorcioId) {
            premiosFiltros += ' AND sp.consorcio_id = $' + (premiosValores.length + 1);
            premiosValores.push(consorcioId);
        }
        if (loteriaId) {
            premiosFiltros += ' AND sp.loteria_id = $' + (premiosValores.length + 1);
            premiosValores.push(loteriaId);
        }
        if (sistemaId) {
            premiosFiltros += ' AND sp.sistema_id = $' + (premiosValores.length + 1);
            premiosValores.push(sistemaId);
        }
        const premiosQuery = `
            SELECT 
                COALESCE(sum(sp.cantidad_premiado), 0) as cantidad_premiado, 
                COALESCE(sum(sp.monto_premiado), 0) as monto_premiado, 
                COALESCE(sum(sp.cantidad_tickets_premiado), 0) as cantidad_tickets_premiados
            FROM sumario_premio sp
            WHERE 1=1 ${premiosFiltros}
        `;
        const premiosResult = await pool.query(premiosQuery, premiosValores);

        // --- juegos_by_sorteo ---
        let juegosFiltros = ' AND sj.sorteo_id = $1';
        const juegosValores: any[] = [sorteoId];
        if (consorcioId) {
            juegosFiltros += ' AND sj.consorcio_id = $' + (juegosValores.length + 1);
            juegosValores.push(consorcioId);
        }
        if (loteriaId) {
            juegosFiltros += ' AND sj.loteria_id = $' + (juegosValores.length + 1);
            juegosValores.push(loteriaId);
        }
        if (sistemaId) {
            juegosFiltros += ' AND sj.sistema_id = $' + (juegosValores.length + 1);
            juegosValores.push(sistemaId);
        }
        const juegosQuery = `
            SELECT
                pr.premio_id,
                array_to_string(pr.premios, ' ') as numeros_ganadores,
                st.loteria_id,
                st.loteria_nombre,
                st.sorteo_id,
                st.sorteo_nombre,
                st.sorteo_numero,
                sj.juego_id,
                sj.juego_nombre,
                st.hora_cierre,
                st.fecha_sorteo,
                (date_trunc('day', st.fecha_sorteo) + st.hora_cierre::time) as fecha_cierre_sorteo,
                CASE WHEN NOW() - interval '4 hour' > (date_trunc('day', st.fecha_sorteo) + st.hora_cierre::time) THEN 1 ELSE 0 END as sorteo_cerrado,
                COALESCE(sum(st.cantidad_tickets - st.cantidad_tickets_anulado), 0) as cantidad_tickets,
                COALESCE(sum(st.cantidad_tickets + st.cantidad_tickets_post - st.cantidad_tickets_anulado), 0) as cantidad_tickets_post,
                COALESCE(sum(st.cantidad_tickets_anulado), 0) as cantidad_tickets_anulados,
                COALESCE(sum(st.cantidad_tickets_pagado), 0) as cantidad_tickets_pagados,
                COALESCE(sum(sj.cantidad_apuesta - sj.cantidad_anulado), 0) as total_apuestas,
                COALESCE(sum(sj.cantidad_apuesta + sj.cantidad_apuesta_post - sj.cantidad_anulado), 0) as total_apuestas_post,
                COALESCE(sum(sj.cantidad_anulado), 0) as total_apuestas_anuladas,
                COALESCE(sum(sj.cantidad_pagado), 0) as total_apuestas_pagadas,
                COALESCE(sum(sj.monto_apuesta - sj.monto_anulado), 0) as monto_apostado,
                COALESCE(sum(sj.monto_apuesta + sj.monto_apuesta_post - sj.monto_anulado), 0) as monto_apostado_post,
                COALESCE(sum(sj.monto_anulado), 0) as monto_anulado,
                COALESCE(sum(st.monto_pagado), 0) as monto_pagado
            FROM sumario_juego sj
            JOIN sumario_sorteo st ON sj.consorcio_id = st.consorcio_id AND sj.loteria_id = st.loteria_id AND sj.sorteo_id = st.sorteo_id
            LEFT JOIN premio pr ON st.sorteo_id = pr.sorteo_id
            WHERE 1=1 ${juegosFiltros}
            GROUP BY pr.premio_id, pr.premios, st.loteria_id, st.loteria_nombre, st.sorteo_id, st.sorteo_nombre, st.sorteo_numero,
                sj.juego_id, sj.juego_nombre, st.hora_cierre, st.fecha_sorteo
        `;
        const juegosResult = await pool.query(juegosQuery, juegosValores);
        const juegos = juegosResult.rows;

        // --- calculate_totales_tickets_by_juegos ---
        const premios = premiosResult.rows;
        let totalVendido = 0, totalPremiados = 0, totalAnulados = 0, totalGananciaPost = 0;
        let detalles: any = {};

        for (const p of premios) {
            detalles.cantidad_tickets_premiados = parseInt(p.cantidad_tickets_premiados) || 0;
            totalPremiados += parseFloat(p.monto_premiado) || 0;
        }

        if (juegos.length > 0) {
            const j = juegos[0];
            detalles.premio_id = j.premio_id;
            detalles.numeros_ganadores = j.numeros_ganadores;
            detalles.sorteo_nombre = j.sorteo_nombre;
            detalles.sorteo_numero = j.sorteo_numero;
            detalles.loteria_nombre = j.loteria_nombre;
            detalles.fecha_cierre_sorteo = j.fecha_cierre_sorteo;
            detalles.fecha_sorteo = j.fecha_sorteo;
            detalles.hora_cierre = j.hora_cierre;
            detalles.sorteo_cerrado = j.sorteo_cerrado;
            detalles.cantidad_tickets = parseInt(j.cantidad_tickets) || 0;
            detalles.cantidad_tickets_post = parseInt(j.cantidad_tickets_post) || 0;
            detalles.cantidad_tickets_anulados = parseInt(j.cantidad_tickets_anulados) || 0;
            detalles.cantidad_tickets_pagados = parseInt(j.cantidad_tickets_pagados) || 0;
            detalles.total_pagados = parseFloat(j.monto_pagado) || 0;
        }

        for (const j of juegos) {
            totalVendido += parseFloat(j.monto_apostado) || 0;
            totalGananciaPost += parseFloat(j.monto_apostado_post) || 0;
            totalAnulados += parseFloat(j.monto_anulado) || 0;
        }

        detalles.total_ganancia = totalVendido - totalPremiados;
        detalles.total_vendido = totalVendido;
        detalles.total_premiados = totalPremiados;
        detalles.total_anulados = totalAnulados;
        detalles.total_ganancia_post = totalGananciaPost;

        return res.status(200).json({ juegos, detalles });

    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        console.error('Sorteo Detail API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
