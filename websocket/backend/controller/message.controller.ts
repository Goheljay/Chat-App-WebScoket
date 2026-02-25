import { SendMessageReqDto } from "@/model/message.dto";
import { MessageService, messageService } from "@/services/message.service";
import { AuthenticatedRequest } from "@/types/express";
import { Response } from "express";

class MessageController {
    constructor(private readonly msgService: MessageService = messageService) { }

    sendMessage = async (req: AuthenticatedRequest, res: Response) => {
        const { conversationId, message, type, isBroadcast } = req.body;
        const userId = req.userId as string;
        try {
            const result = await this.msgService.sendMessage({conversationId, message, userId, type, isBroadcast} as SendMessageReqDto);
            return res.status(200).json({ message: 'Message sent successfully', data: result });
        } catch (error: any) {
            console.log('Error sending message', error);
            return res.status(500).json({ message: 'Error sending message', data: error, status: 500 });
        }
    }
    
    getMessages = async (req: AuthenticatedRequest, res: Response) => {
        const { conversationId } = req.query;
        const userId = req.userId as string;
        try {
            const result = await this.msgService.getMessagesByConversationId(conversationId as string, userId as string);
            return res.status(200).json({ message: 'Messages fetched successfully', data: result });
        } catch (error: any) {
            console.log('Error getting messages', error);
            return res.status(500).json({ message: 'Error getting messages', data: error, status: 500 });
        }
    }
}

export const messageController = new MessageController();