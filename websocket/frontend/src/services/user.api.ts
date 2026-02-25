import { type AxiosResponse} from 'axios';
import { axiosInstance } from '../config/axios.config';
import { AuthRequestDto, ConversationDto, SendMessageReqDto } from '../dto/UserDto';


export const getUsers = async (): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance.get('/user');
    return response.data;
}

export const loginUser = async (authDto: AuthRequestDto): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance({
        url: '/auth/login',
        data: authDto,
        method: 'POST'
    });
    return response.data;
}

export const createConversation = async (conversationDto: ConversationDto): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance({
        url: '/user/create-conversation',
        data: conversationDto,
        method: 'POST'
    });
    return response.data;
}

export const geAllUsersByConversation = async (): Promise<AxiosResponse<any>> => {

    const response = await axiosInstance({
        url: '/chat/users-by-conversation',
        method: 'GET'
    });
    return response.data;
}


export const getUsersByConversation = async (conversationId: string): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance({
        url: '/chat/users-by-conversation',
        params: { conversationId },
        method: 'GET'
    });
    return response.data;
}

export const getUserDetails = async (userId: string): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance({
        url: '/user/user-details',
        params: { userId },
        method: 'GET'
    });
    return response.data;
}


export const getMessagesByConversationId = async (conversationId: string): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance({
        url: '/chat/messages',
        params: { conversationId },
        method: 'GET'
    });
    return response.data;
}

export const sendMessage = async (data: SendMessageReqDto): Promise<AxiosResponse<any>> => {
    const response = await axiosInstance({
        url: '/chat/send-message',
        data: data,
        method: 'POST'
    });
    return response.data;
}