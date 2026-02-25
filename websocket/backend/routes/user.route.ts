import { Router } from 'express';
import { UserController } from '@/controller/user.controller';
const userRouter = Router();

//create instance of controllers
const userController = new UserController();

//define routes
userRouter.get('/', userController.getUsers);
userRouter.get('/find-by-email', userController.getEmailFromUser);
userRouter.post('/add-user', userController.addUser);
userRouter.post('/create-conversation', userController.createConversation);
userRouter.get('/users-list-by-ongoing-conversation', userController.getUsersListByOnGoingConversation);
userRouter.get('/user-details', userController.getUserDetailsFromUserId);

export default userRouter;