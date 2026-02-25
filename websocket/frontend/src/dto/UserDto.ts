interface AuthRequestDto {
    email: string;
    password: string;
}

interface ConversationDto {
    reqUserId: string;
}

interface UserDetailsDto {
    userId: string;
    name: string;
    email: string;
    createdAt: Date;
}

interface SendMessageReqDto {
    conversationId: string;
    message: string;
    type: string;
    isBroadcast: boolean;
  }

export type { AuthRequestDto, ConversationDto, UserDetailsDto, SendMessageReqDto };