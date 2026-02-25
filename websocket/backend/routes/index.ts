import { Router } from 'express';
import userRouter from '@/routes/user.route';
import authRouter from './auth.route';
import chatRouter from './chat.route';
import councilRouter from './council.route';
//create router
const router = Router();

//define routers
router.use('/user', userRouter);
router.use('/auth', authRouter);
router.use('/chat', chatRouter);
router.use('/council', councilRouter);

export default router;