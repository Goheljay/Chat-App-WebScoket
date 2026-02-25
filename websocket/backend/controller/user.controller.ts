import { CreateUserDto, User } from '@/dto/user.request-dto';
import { UserService } from '@/services/user.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/types/express';
export class UserController {

    constructor(private readonly userService: UserService = new UserService()) { }

    getUsers = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const getUser = await this.userService.getUsers();
            return res.status(200).json({ message: 'Users fetched successfully', data: getUser })
        } catch (error: any) {
            console.error('Error getting users', error);
            return res.status(500).json({ message: 'Error getting users', data: error, status: 500 })
        }
    }

    addUser = async (req: AuthenticatedRequest, res: Response) => {
        const createUserDto: CreateUserDto = req.body;

        try {
            const result = await this.userService.createUser(new User(createUserDto));
            return res.status(200).json({ message: "User created successfully", data: result })
        } catch (error: any) {
            console.error('Error creating user', error);
            return res.status(500).json({ message: 'Error creating user', data: error, status: 500 })
        }
    }

    getUserDetailsFromUserId = async (req: AuthenticatedRequest, res: Response) => {

        const reqUserId = req.query.userId as string;
        const currentUserId = req.userId as string;
        try {
            const result = await this.userService.getUserDetailsFromUserId(reqUserId, currentUserId);
            return res.status(200).json({ message: 'User details fetched successfully', data: result })
        } catch (error: any) {
            console.log('Error getting user details', error);
            return res.status(500).json({ message: 'Error getting user details', data: error, status: 500 })
        }
    }
    getEmailFromUser = async (req: AuthenticatedRequest, res: Response) => {
        const email: string = req.query.email as string;
        try {
            const result = await this.userService.findUserByEmialId(email);
            return res.status(200).json({ message: 'Email fetched successfully', data: result })
        } catch (error: any) {
            console.log('Error getting email from user', error);
            return res.status(500).json({ message: 'Error getting email from user', data: error, status: 500 })
        }
    }

    createConversation = async (req: AuthenticatedRequest, res: Response) => {
        const { reqUserId } = req.body;
        const userId = req.userId as string;
        try {
            const result = await this.userService.createConversation(reqUserId, userId);
            return res.status(200).json({ message: 'Conversation created successfully', data: result })
        } catch (error: any) {
            console.log('Error creating conversation', error);
            return res.status(500).json({ message: 'Error creating conversation', data: error, status: 500 })
        }
    }

    getUsersListByOnGoingConversation = async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.userId as string;
        try {
            const result = await this.userService.getConversationsUsersList(userId);
            return res.status(200).json({ message: 'Conversations fetched successfully', data: result })
        } catch (error: any) {
            console.log('Error getting conversations', error);
            return res.status(500).json({ message: 'Error getting conversations', data: error, status: 500 })
        }
    }
}
