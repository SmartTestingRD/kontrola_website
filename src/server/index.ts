import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import loginHandler from '../../api/login';
import proxyHandler from '../../api/proxy';
import sorteosHandler from '../../api/sorteos';
import sorteoDetailHandler from '../../api/sorteo-detail';
import juegoDetailHandler from '../../api/juego-detail';
import ticketHandler from '../../api/ticket';

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
app.all('/api/proxy', proxyHandler);

app.listen(PORT, () => {
    console.log(`Express Dev Server is running on http://localhost:${PORT}`);
});
