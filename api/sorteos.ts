import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../src/data/db';
import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req: Request, res: Response) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Verify JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;

        const {
            initial_date,
            final_date,
            consorcio_id,
            loteria_id,
            sistema_id = '1',
            tipo = '1',
            numero_sorteo,
            incluir_express = 'off',
            incluir_ruleta = 'off'
        } = req.query as Record<string, string>;

        // Use consorcio from JWT if not superadmin (consorcio 1)
        const userConsorcioId = decoded.consorcioId;
        const effectiveConsorcioId = userConsorcioId === 1 ? (consorcio_id || null) : String(userConsorcioId);

        // Build dynamic filters
        let filtros = '';
        const valores: any[] = [];

        if (tipo === '2' && numero_sorteo) {
            filtros += ' AND ss.sorteo_numero = $' + (valores.length + 1);
            valores.push(numero_sorteo);
        } else {
            const today = new Date().toISOString().split('T')[0];
            const startDate = initial_date || today;
            const endDate = final_date || today;
            filtros += ' AND ss.fecha_sorteo >= $' + (valores.length + 1);
            valores.push(startDate + ' 00:00:00');
            filtros += ' AND ss.fecha_sorteo <= $' + (valores.length + 1);
            valores.push(endDate + ' 23:59:59');
        }

        if (effectiveConsorcioId) {
            filtros += ' AND ss.consorcio_id = $' + (valores.length + 1);
            valores.push(effectiveConsorcioId);
        }

        if (loteria_id) {
            filtros += ' AND ss.loteria_id = $' + (valores.length + 1);
            valores.push(loteria_id);
        }

        if (sistema_id && ['1', '2'].includes(sistema_id)) {
            filtros += ' AND ss.sistema_id = $' + (valores.length + 1);
            valores.push(sistema_id);
        }

        if (incluir_express === 'off') {
            filtros += ' AND ss.sorteo_nombre NOT LIKE $' + (valores.length + 1);
            valores.push('%CHANCE EXPRESS%');
        }

        if (incluir_ruleta === 'off') {
            filtros += ' AND ss.sorteo_nombre NOT LIKE $' + (valores.length + 1);
            valores.push('%RULETA EXPRESS%');
        }

        // Main query — tickets_summary
        const sorteosQuery = `
            SELECT
                pr.premio_id,
                ss.loteria_id,
                ss.loteria_nombre,
                ss.sorteo_id,
                ss.sorteo_nombre,
                ss.sorteo_numero,
                ss.fecha_sorteo,
                TO_CHAR(TO_TIMESTAMP(ss.hora_cierre, 'HH24:MI:SS')::time, 'HH:MI:SS AM') as hora_cierre,
                (date_trunc('day', ss.fecha_sorteo) + ss.hora_cierre::time) as fecha_cierre_sorteo,
                CASE WHEN NOW() - interval '4 hour' > (date_trunc('day', ss.fecha_sorteo) + ss.hora_cierre::time) THEN 'CERRADO' ELSE 'PENDIENTE' END as sorteo_cerrado,
                COALESCE(sum(ss.cantidad_tickets + ss.cantidad_tickets_post - ss.cantidad_tickets_anulado), 0) as cantidad_tickets,
                COALESCE(sum(ss.cantidad_tickets_post), 0) as cantidad_tickets_post,
                COALESCE(sum(ss.cantidad_tickets_anulado), 0) as cantidad_tickets_anulado,
                COALESCE(sum(ss.monto_apuesta + ss.monto_apuesta_post - ss.monto_anulado), 0) as monto_apuesta,
                COALESCE(sum(ss.monto_apuesta_post), 0) as monto_apostado_post,
                COALESCE(sum(sp.cantidad_tickets_premiado), 0) as cantidad_tickets_premiado,
                COALESCE(sum(sp.monto_premiado), 0) as monto_premiado,
                COALESCE(sum(ss.cantidad_tickets_pagado), 0) as cantidad_tickets_pagado,
                COALESCE(sum(ss.monto_pagado), 0) as monto_pagado
            FROM sumario_sorteo ss
            LEFT JOIN premio pr ON ss.sorteo_id = pr.sorteo_id
            LEFT JOIN sumario_premio sp ON ss.consorcio_id = sp.consorcio_id
                                       AND ss.loteria_id = sp.loteria_id
                                       AND ss.sorteo_id = sp.sorteo_id
            WHERE 1=1 ${filtros}
            GROUP BY pr.premio_id, ss.loteria_id,
            ss.loteria_nombre, ss.sorteo_id,
            ss.sorteo_nombre, ss.sorteo_numero, ss.fecha_sorteo, ss.hora_cierre
            ORDER BY ss.fecha_sorteo DESC
        `;

        const sorteosResult = await pool.query(sorteosQuery, valores);
        const sorteos = sorteosResult.rows;

        // Calculate totals
        let totalJugado = 0;
        let totalPremiado = 0;
        for (const s of sorteos) {
            totalJugado += parseFloat(s.monto_apuesta) || 0;
            totalPremiado += parseFloat(s.monto_premiado) || 0;
        }

        // Get consorcios catalog
        const consorciosResult = await pool.query(
            "SELECT consorcio_id, nombre FROM consorcio WHERE estado = 'AC' ORDER BY nombre"
        );

        // Get loterias catalog
        const loteriasResult = await pool.query(
            "SELECT loteria_id, nombre FROM loteria WHERE estado = 'AC' ORDER BY nombre"
        );

        return res.status(200).json({
            sorteos,
            detalles: {
                total_jugado: totalJugado,
                total_premiado: totalPremiado,
                total_ganancias: totalJugado - totalPremiado
            },
            consorcios: consorciosResult.rows,
            loterias: loteriasResult.rows
        });

    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        console.error('Sorteos API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
