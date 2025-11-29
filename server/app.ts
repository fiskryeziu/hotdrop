import express from 'express';
import { errorHandler } from './middleware/errorHandler.ts';
import routes from './routes/index.ts';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.ts';
import cors from 'cors';
import { createServer } from 'node:http';
import type { Socket } from 'socket.io';
import { Server } from 'socket.io';

const app = express();
export const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
);

io.on('connection', (socket: Socket) => {
  console.log('a user connected', socket.id);
});

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);
