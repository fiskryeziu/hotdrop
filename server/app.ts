import express from 'express';
import { errorHandler } from './middleware/errorHandler.ts';
import { getUser } from './controller/product.controller.ts';
import routes from './routes/index.ts';

const app = express();

app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

export default app;
