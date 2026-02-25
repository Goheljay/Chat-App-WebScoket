import { CreateUserDto, ResponseUserDto, User } from "@/dto/user.request-dto";
import { getCollection } from "@/config/db.config";
import { WithId } from "mongodb";
import { Document, ObjectId } from "bson";
import { log } from "node:console";
import { ConversationDto } from "@/dto/conversation.dto";
export class UserService {
    // constructor(private readonly userRepository: UserRepository) {}

    async createUser(createUserDto: CreateUserDto) {
        try {
            const user = await getCollection('users');
            console.debug(user);
            const existingUser: WithId<Document> | null= await user.findOne({ email: createUserDto.email });
            const responseUser: ResponseUserDto = {
                _id: existingUser?._id as ObjectId,
                email: existingUser?.email as string,
                name: existingUser?.name as string,
                createdAt: existingUser?.createdAt as Date,
            }
            if(!existingUser) {
                const newUser = await user.insertOne(createUserDto);
                return newUser;
            }
            return responseUser;
        } catch (error: any) {
            console.error('Error creating user', error);
            throw error;
        }
    }

    async getUsers() {
        try {
            const userCollection = await getCollection('users');
            const users:WithId<Document>[] = await userCollection.find({ isDeleted: false }).toArray();
            const responseUsers: ResponseUserDto[] = users.map((user) => ({
                _id: user._id as ObjectId,
                email: user.email as string,
                name: user.name as string,
                createdAt: user.createdAt as Date,
            }));
            return responseUsers;
        } catch (error: any) {
            console.error('Error fetching users', error);
            throw error;
        }
    }

    async findUserByEmialId(email: string) {
        try {
            const userCollection = await getCollection('users');
            const user = await userCollection.findOne({ email: email });
            console.debug(user);
            const responseUser: ResponseUserDto = {
                _id: user?._id as ObjectId,
                email: user?.email as string,
                name: user?.name as string,
                createdAt: user?.createdAt as Date,
            }
            if(!user) {
                throw new Error('User not found');
            }
            return responseUser;
        } catch (error: any) {
            console.error('Error finding user by email', error);
            throw error;
        }
    }

    async createConversation(requestUserId: string, userId: string) {
        try {
            const conversationCollection = await getCollection('conversations');
            const conversation = await conversationCollection.findOne({ participants: { $all: [userId, requestUserId] } });
            
            if(conversation) {
                throw new Error('Conversation already exists');
            }

            const conversationDto: ConversationDto = {
                participants: [userId, requestUserId],
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
            }
            const newConversation = await conversationCollection.insertOne(conversationDto);
            return newConversation;
        } catch (error: any) {
            console.error('Error creating conversation', error);
            throw error;
        }
    }

    async getConversationsUsersList(userId: string) {
        try {
            const conversationCollection = await getCollection('conversations');
            const usersCollection = await getCollection('users');
            const conversations = await conversationCollection.find({ participants: { $in: [userId] } }).toArray();
            const responseConversations: any[] = await Promise.all(conversations.flatMap(async (conversation) => {
                const users: ResponseUserDto[] = await Promise.all(conversation.participants.flatMap(async (participant: ObjectId) => {
                    if(participant.toString() !== userId) {
                        const user = await usersCollection.findOne({ _id: new ObjectId(participant.toString()) });
                        return user as ResponseUserDto;
                    }
                    return null;
                }));
                return users;
            }));
            const responseConversationsFiltered: ResponseUserDto[] = responseConversations.flat().filter((user): user is ResponseUserDto => user !== null);
            return responseConversationsFiltered;
        } catch (error: any) {
            console.error('Error getting conversations', error);
            throw error;
        }
    }

    async getCurrentUserConversation(userId: string) {
        try {
            const conversationCollection = await getCollection('conversations');
            const conversation = await conversationCollection.findOne({ participants: { $in: [userId] } });
            return conversation;
        } catch (error: any) {
            console.error('Error getting current user conversation', error);
            throw error;
        }
    }

    async getUserDetailsFromUserId(reqUserId: string, currentUserId: string): Promise<ResponseUserDto> {
        try {
            const userCollection = await getCollection('users');
            const conversationCollection = await getCollection('conversations');
            const user = await userCollection.findOne({ _id: new ObjectId(reqUserId) });
            const conversation = await conversationCollection.findOne({ participants: { $all: [currentUserId, reqUserId] } });
            const responseUser: any = {
                _id: user?._id as ObjectId,
                email: user?.email as string,
                name: user?.name as string,
                createdAt: user?.createdAt as Date,
                conversationId: conversation?._id?.toString() as string,
            }
            return responseUser;
        } catch (error: any) {
            console.error('Error getting user details from user id', error);
            throw error;
        }
    }
}