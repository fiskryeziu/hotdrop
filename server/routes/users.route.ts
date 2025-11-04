import { Router } from 'express';
import {
  getUserSession,
  signInUser,
  signUpUser,
} from '../controller/auth.controller.ts';

const router = Router();

router.get('/me', getUserSession);
router.post('/login', signInUser);
router.post('/signup', signUpUser);

export default router;
