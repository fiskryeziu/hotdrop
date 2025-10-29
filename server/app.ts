import express from 'express';
import { errorHandler } from './middleware/errorHandler.ts';
import routes from './routes/index.ts';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.ts';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
);

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

export default app;
