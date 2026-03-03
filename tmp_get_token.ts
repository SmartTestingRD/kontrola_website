import jwt from 'jsonwebtoken';
import { pool } from './src/data/db';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const res = await pool.query("SELECT id, email, first_name, last_name FROM kontrola_kontrolauser WHERE email = 'kontrola@kontrola.com.do' LIMIT 1;");
    if (res.rows.length > 0) {
        const user = res.rows[0];
        const payload = {
            id: user.id,
            email: user.email,
            consorcioId: null,
            isStaff: true
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

        const userData = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            consorcioId: null,
            forcePasswordChange: false,
            isStaff: true
        };

        console.log("TOKEN:");
        console.log(token);
        console.log("USER:");
        console.log(JSON.stringify(userData));
    }
    process.exit(0);
}
main().catch(console.error);
