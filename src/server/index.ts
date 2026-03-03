import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import loginHandler from '../../api/login';
import proxyHandler from '../../api/proxy';
import sorteosHandler from '../../api/sorteos';
import sorteoDetailHandler from '../../api/sorteo-detail';
import juegoDetailHandler from '../../api/juego-detail';
import ticketHandler from '../../api/ticket';
import consorciosHandler from '../../api/consorcios';
import usersIndexHandler from '../../api/admin/users/index';
import userDetailHandler from '../../api/admin/users/[id]';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Register API Routes
app.post('/api/login', loginHandler);
app.get('/api/sorteos', sorteosHandler);
app.get('/api/sorteo-detail', sorteoDetailHandler);
app.get('/api/juego-detail', juegoDetailHandler);
app.get('/api/ticket', ticketHandler);
app.get('/api/consorcios', consorciosHandler);
app.all('/api/admin/users', usersIndexHandler);
app.all('/api/admin/users/:id', userDetailHandler);
app.all('/api/proxy', proxyHandler);

app.listen(PORT, () => {
    console.log(`Express Dev Server is running on http://localhost:${PORT}`);
});
