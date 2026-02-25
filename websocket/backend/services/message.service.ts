import { getCollection } from "@/config/db.config";
import { MessageDto, SendMessageReqDto, SendMessageResponseDto, WebSocketRequest } from "@/model/message.dto";
import { ObjectId } from "mongodb";
import { wsService } from "./websocket.service";
import { log } from "node:console";

export class MessageService {
    private static instance: MessageService;
    private constructor() {
        if (MessageService.instance) {
            return MessageService.instance;
        }
        MessageService.instance = this;
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new MessageService();
        }
        return this.instance;
    }


    sendMessage = async (sendMessageReq: SendMessageReqDto) =>  {
        try {
            const { conversationId, message, userId, type, isBroadcast } = sendMessageReq;
            const userCollection = await getCollection('users');
            const messageCollection = await getCollection('messages');
            const convertationCollection = await getCollection('conversations');
            let checkCOnvertationExists = await convertationCollection.findOne({ _id: new ObjectId(conversationId) });
            if(!checkCOnvertationExists) {
                throw new Error('Conversation not found');
            }

            const findReceiverId = checkCOnvertationExists.participants.find((participant: string) => participant !== userId);
            const senderDetails = await userCollection.findOne({ _id: new ObjectId(userId) });
            const receiverDetails = await userCollection.findOne({ _id: new ObjectId(findReceiverId) });
            const newMessage = await messageCollection.insertOne({
                conversationId: new ObjectId(conversationId),
                senderId: new ObjectId(userId),
                receiverId: new ObjectId(findReceiverId),
                message: message,
                messageType: type,
                isBroadcast: isBroadcast,
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false,
            });
            const webSocketRequest: WebSocketRequest = {
                conversationId: conversationId,
                senderId: senderDetails,
                receiverId: receiverDetails,
                message: message,
            }
            
            wsService.sendMessageToUser(findReceiverId, webSocketRequest);
            return webSocketRequest;
        } catch (error: any) {
            console.error('Error sending message', error);
            throw error;
        }
    }

    getMessagesByConversationId = async (conversationId: string, userId: string) => {
        try {
            const conversationCollection = await getCollection('conversations')
            const messageCollection = await getCollection('messages')
            const userCollection = await getCollection('users')
            const currentConversation = await conversationCollection.find({ participants: { $all: [userId, conversationId] } }).toArray()
            console.log(currentConversation)
            const getConvertationsId = currentConversation[0]._id.toString();
            let messages = await messageCollection.find({ conversationId: new ObjectId(getConvertationsId) }).toArray();
            let senderUsers = await userCollection.find({ _id: { $in: messages.map((message: any) => message.senderId) } }).toArray();
            let receiverUsers = await userCollection.find({ _id: { $in: messages.map((message: any) => message.receiverId) } }).toArray();
            let usersMap = new Map(senderUsers.map((user: any) => [user._id.toString(), user]));
            let receiverUsersMap = new Map(receiverUsers.map((user: any) => [user._id.toString(), user]));
            messages = messages.map((message: any) => {
                return {
                    ...message,
                    senderId: usersMap.get(message.senderId.toString()),
                    receiverId: receiverUsersMap.get(message.receiverId.toString()),
                }
            });
            return messages;
        } catch (error: any) {
            console.error('Error getting messages by conversation id', error);
            throw error;
        }
    }
}

export const messageService = MessageService.getInstance();