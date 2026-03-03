import { pool } from './src/data/db';

async function main() {
    const res = await pool.query("SELECT email FROM kontrola_kontrolauser WHERE is_staff = true LIMIT 1;");
    if (res.rows.length > 0) {
        console.log("Admin email:", res.rows[0].email);
    } else {
        console.log("No admins found!");
    }
    process.exit(0);
}
main().catch(console.error);
