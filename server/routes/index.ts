import { Router } from 'express';
import productRoutes from './products.route.ts';
import userRoutes from './users.route.ts';

const routes = Router();

routes.use('/products', productRoutes);
routes.use('/users', userRoutes);

export default routes;
