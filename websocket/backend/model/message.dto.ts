import { ObjectId } from "mongodb";

interface SendMessageReqDto {
    conversationId: string;
    message: string;
    userId: string;
    type: string;
    isBroadcast: boolean;
}

interface MessageDto {
    _id: ObjectId;
    conversationId: string;
    senderId: string;
    receiverId: string;
    message: string;
    messageType: string;
    isBroadcast: boolean;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}

interface SendMessageResponseDto {
    messageId: string;
    message: string;
    receiverId: string;
}

interface WebSocketRequest {
    conversationId: string;
    senderId: any;
    receiverId: any;
    message: string;
}

export type { MessageDto, SendMessageReqDto, SendMessageResponseDto, WebSocketRequest };