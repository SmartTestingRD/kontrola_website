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
        jwt.verify(token, process.env.JWT_SECRET || 'secret');

        const serial = req.query.serial as string;
        const sistemaId = (req.query.sistema_id as string) || '1';

        if (!serial) {
            return res.status(400).json({ message: 'Serial is required' });
        }

        // --- 1. Buscar Ticket ---
        const ticketQuery = `
            SELECT
                ti.ticket_id, 
                ti.serialkey as serial,
                to_char(ti.fecha_ticket, 'YYYY-MM-DD') as fecha_ticket,
                ti.hora_ticket,
                ti.cantidad_jugadas,
                ti.monto_total,
                coalesce(con.consorcio_id, ti.consorcio_id) || '-' || coalesce(con.nombre, ti.nombre_consorcio) as consorcio,
                ti.banca_id || '-' || ti.nombre_banca as banca,
                ti.codigo_agencia || '-' || ti.nombre_agencia as agencia,
                ti.codigo_terminal || '-' || ti.nombre_terminal as terminal,
                ti.zona_id || '-' || ti.nombre_zona as zona,
                ti.ciudad_id || '-' || ti.nombre_ciudad as ciudad,
                ti.username || '-' || ti.nombre_usuario as operador,
                to_char(ti.fecha_creacion, 'YYYY-MM-DD HH24:MI:SS') as fecha_creacion,
                coalesce(sor.sorteo_numero, ti.sorteo_numero) as numero_sorteo,
                coalesce(sor.sorteo_nombre, ti.sorteo_nombre) as nombre_sorteo,
                coalesce(lot.loteria_id, ti.loteria_id) || '-' || coalesce(lot.nombre, ti.nombre_loteria) as loteria,
                to_char(sor.fecha_sorteo::date, 'YYYY-MM-DD') as fecha_sorteo,
                sor.hora_cierre,
                to_char(ti.fecha_anulacion::date, 'YYYY-MM-DD') as fecha_anulacion,
                ti.hora_anulacion,
                ti.username_anulacion as usuario_anulacion,
                CASE WHEN ti.anulado = 1 THEN 'Si' ELSE 'No' END as anulado,
                to_char(ti.fecha_pago::date, 'YYYY-MM-DD') as fecha_pago,
                ti.hora_pago,
                ti.monto_pagar,
                ti.username_pago as usuario_pago,
                CASE WHEN ti.pagado = 1 THEN 'Si' ELSE 'No' END as pagado
            FROM ticket ti
            JOIN consorcio con ON con.consorcio_id = ti.consorcio_id 
            LEFT JOIN sorteo sor ON sor.sistema_id = ti.sistema_id AND sor.sorteo_id = ti.sorteo_id 
            LEFT JOIN loteria lot ON lot.loteria_id = sor.loteria_id
            WHERE ti.sistema_id = $1 AND ti.serialkey = $2
        `;

        const ticketResult = await pool.query(ticketQuery, [sistemaId, serial]);

        if (ticketResult.rows.length === 0) {
            return res.status(404).json({ message: `No se encontró ticket con serial ${serial}` });
        }

        const ticket = ticketResult.rows[0];

        // --- 2. Buscar Jugadas del Ticket ---
        const jugadasQuery = `
            SELECT 
                ju.jugada_id,
                ARRAY(SELECT x::int FROM unnest(ju.numero) AS x) as numero_jugada,
                ju.apuesta as cantidad_apuesta,
                ju.monto as monto_apuesta,
                coalesce(jue.juego_id, ju.juego_id) || '-' || coalesce(jue.juego_nombre, ju.juego_nombre) as producto,
                CASE 
                    WHEN ju.premiado = 1 THEN 'Si'
                    WHEN ju.premiado = 0 THEN 'No'
                    ELSE null
                END as premiado,
                coalesce(ju.monto_premiado, 0) as monto_premiado,
                CASE WHEN ju.anulado = 1 THEN 'Si' ELSE 'No' END as anulado
            FROM jugada ju
            LEFT JOIN juego jue ON jue.juego_id = ju.juego_id 
            WHERE ju.sistema_id = $1 AND ju.ticket_id = $2
            ORDER BY cast(split_part(ju.jugada_id, '-', 2) as numeric)
                `;

        const jugadasResult = await pool.query(jugadasQuery, [sistemaId, ticket.ticket_id]);

        return res.status(200).json({
            ticket,
            jugadas: jugadasResult.rows
        });

    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        console.error('Ticket API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
