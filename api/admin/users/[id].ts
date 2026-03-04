import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../../../src/data/db.js';
import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;

        if (!decoded.isStaff) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const id = req.query.id as string || req.params?.id as string;
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        if (req.method === 'PUT') {
            const { firstName, lastName, isStaff, isActive, consorcioId, forcePasswordChange } = req.body;

            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // update kontrola_kontrolauser
                await client.query(`
                    UPDATE kontrola_kontrolauser 
                    SET first_name = $1, last_name = $2, is_active = $3, is_staff = $4
                    WHERE id = $5
                `, [firstName || '', lastName || '', isActive ? true : false, isStaff ? true : false, id]);

                // update perfil
                const perfilExists = await client.query('SELECT user_id FROM perfil WHERE user_id = $1', [id]);

                if (perfilExists.rows.length > 0) {
                    await client.query(`
                        UPDATE perfil 
                        SET consorcio_id = $1, force_password_change = $2
                        WHERE user_id = $3
                    `, [consorcioId || null, forcePasswordChange ? true : false, id]);
                } else if (consorcioId) {
                    await client.query(`
                        INSERT INTO perfil (id, user_id, consorcio_id, force_password_change)
                        VALUES (COALESCE((SELECT MAX(id) FROM perfil), 0) + 1, $1, $2, $3)
                    `, [id, consorcioId, forcePasswordChange ? true : false]);
                }

                await client.query('COMMIT');
                return res.status(200).json({ message: 'User updated successfully' });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }

        return res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        console.error('User Detail API error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
