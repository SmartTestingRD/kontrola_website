import { pool } from '../db.js';
import { User } from '../../domain/index.js';

export class UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        const query = `
            SELECT 
                u.id, 
                u.email, 
                u.first_name, 
                u.last_name, 
                u.password, 
                u.is_staff,
                p.consorcio_id, 
                p.force_password_change
            FROM kontrola_kontrolauser u
            JOIN perfil p ON u.id = p.user_id
            WHERE u.email = $1 AND u.is_active = true
        `;
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) return null;

        const row = result.rows[0];

        return {
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            passwordHash: row.password,
            isStaff: row.is_staff,
            consorcioId: row.consorcio_id,
            forcePasswordChange: row.force_password_change
        };
    }
}
