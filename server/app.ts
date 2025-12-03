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
export const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
);

export const latestDriverLocation = new Map<
  string,
  { lat: number; lng: number }
>();

io.on('connection', (socket: Socket) => {
  console.log('a user connected', socket.id);

  // Client (User) joins order room to track driver
  socket.on('joinOrderRoom', ({ orderId }: { orderId: string }) => {
    const room = `order-${orderId}`;
    socket.join(room);

    // If we already have a location for this order, send it immediately
    const loc = latestDriverLocation.get(orderId);
    if (loc) {
      socket.emit('driverLocation', { orderId, ...loc });
    }
  });

  // Driver sends location update via Socket
  socket.on(
    'driverLocation',
    ({ orderId, lat, lng }: { orderId: string; lat: number; lng: number }) => {
      if (!orderId || typeof lat !== 'number' || typeof lng !== 'number') {
        console.warn('Invalid driver location payload', { orderId, lat, lng });
        return;
      }

      // Keep only the latest point (no history)
      latestDriverLocation.set(orderId, { lat, lng });

      // Broadcast to every client that is watching this order
      const room = `order-${orderId}`;
      io.to(room).emit('driverLocation', { orderId, lat, lng });
    },
  );
});

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);
