import { Router } from 'express';
import { UserController } from '@/controller/user.controller';
import { messageController } from '@/controller/message.controller';
const chatRouter = Router();

//create instance of controllers
const userController = new UserController();

//define routes
chatRouter.get('/users-by-conversation', userController.getUsersListByOnGoingConversation);
chatRouter.post('/send-message', messageController.sendMessage);
chatRouter.get('/messages', messageController.getMessages);

export default chatRouter;