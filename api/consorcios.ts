import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../src/data/db';
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

        const query = `
            SELECT consorcio_id, nombre, estado 
            FROM consorcio 
            ORDER BY consorcio_id ASC
        `;

        const result = await pool.query(query);

        return res.status(200).json({ consorcios: result.rows });

    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        console.error('Consorcios API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
