import { WebSocket } from "ws";
import { MessageDto, WebSocketRequest } from "@/model/message.dto";

interface WebSocketMessage {
    type: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    message: string;
}

class WebSocketService {
    private static instance: WebSocketService;
    private connections: Map<string, WebSocket> = new Map();
    private constructor() {
        if (WebSocketService.instance) {
            return WebSocketService.instance;
        }
        WebSocketService.instance = this;
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new WebSocketService();
        }
        return this.instance;
    }

    handleConnection =(ws: WebSocket, userId: string) => {
        this.connections.set(userId, ws);

        console.log('connections', this.connections.size);
        

        ws.on('close', () => {
            console.log(`User ${userId} disconnected`)
            this.connections.delete(userId)
        })
      
        ws.on('error', (error) => {
            console.error(`WebSocket error for user ${userId}`, error)
            this.connections.delete(userId)
        })
    }

    // // Method to send message to a specific user via WebSocket
    sendMessageToUser(receiverId: string, message: WebSocketRequest) {
        const connection = this.connections.get(receiverId)
        console.log('connection', connection);
        console.log('message', message);
        
        if (connection && connection.readyState === WebSocket.OPEN) {
          const wsMessage: WebSocketMessage = {
            type: 'message',
            conversationId: message.conversationId,
            senderId: message.senderId,
            receiverId: message.receiverId,
            message: message.message
          }
          this.sendMessage(connection, wsMessage)
          console.log(`Message sent to user ${receiverId} via WebSocket`)
          return true
        } else {
          console.log(`User ${receiverId} is not connected to WebSocket`)
          return false
        }
    }

    private sendMessage(ws: WebSocket, message: WebSocketMessage) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message))
        }
      }

    // authenticateConnection(url: string): string | null {
    //     try {
    //       const tokenMatch = url.match(/[?&]token=([^&]+)/)
    //       if (!tokenMatch) {
    //         return null
    //       }
    //       const token = tokenMatch[1]
    //       const decoded = verifyToken(token) as jwt.JwtPayload
    //       return decoded?.id || null
    //     } catch (error) {
    //       console.error('WebSocket authentication error', error)
    //       return null
    //     }
    //   }
}

export const wsService = WebSocketService.getInstance();