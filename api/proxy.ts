import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// JWT Verification Middleware extracted for Vercel
const verifyToken = (req: Request): boolean => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, process.env.JWT_SECRET || 'secret');
        return true;
    } catch {
        return false;
    }
};

export default async function handler(req: Request, res: Response) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // This is the proxy request to Unipago
        const unipagoUrl = process.env.UNIPAGO_API_URL || 'https://api.unipago.example.com';
        const endpoint = req.query.endpoint as string || '';

        // Mocking the response for the baseline without making an actual fetch right now
        // In production: fetch(`${unipagoUrl}${endpoint}`, { method: req.method, body: ... })

        return res.status(200).json({
            message: 'Proxied successfully',
            data: {
                mockedUnipagoData: true,
                requestedEndpoint: endpoint
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Proxy Error' });
    }
}
