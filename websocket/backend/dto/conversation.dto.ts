import { ObjectId } from "mongodb";
import { ResponseUserDto, User } from "./user.request-dto";

export interface ConversationDto {
    participants: string[];
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}
