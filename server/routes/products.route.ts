import { Router } from 'express';
import { getUser } from '../controller/product.controller.ts';

const router = Router();

router.get('/', getUser);

export default router;
