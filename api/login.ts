import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../src/data/repositories/UserRepository';
import { verifyDjangoPassword } from '../src/utils/crypto';
import dotenv from 'dotenv';
dotenv.config();

const userRepository = new UserRepository();

export default async function handler(req: Request, res: Response) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Missing credentials' });
        }

        // Query the DB
        const user = await userRepository.findByEmail(username);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify Django hash 
        const isValid = verifyDjangoPassword(password, user.passwordHash);

        if (isValid) {
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    consorcioId: user.consorcioId,
                    isStaff: user.isStaff
                },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    consorcioId: user.consorcioId,
                    forcePasswordChange: user.forcePasswordChange,
                    isStaff: user.isStaff
                }
            });
        }

        return res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
