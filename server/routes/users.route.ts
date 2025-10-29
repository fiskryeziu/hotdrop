import { Router } from 'express';
import { getUserSession } from '../controller/auth.controller.ts';

const router = Router();

router.get('/me', getUserSession);

export default router;
