import { Router } from 'express';
import productRoutes from './products.route.ts';

const routes = Router();

routes.use('/products', productRoutes);

export default routes;
