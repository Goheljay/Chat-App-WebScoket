import { Router } from 'express';
import { AuthController } from '@/controller/auth.controller';
const authRouter = Router();

//create instance of controllers
const authController = new AuthController();

//define routes
authRouter.post('/login', authController.loginUser);

export default authRouter;