import express, { NextFunction, Request, Response } from 'express';
import router from '@/routes/index';
import { connectDb } from '@/config/db.config';
import cors from 'cors';
import { Authenticate } from '@/middleware/autheticate';
import { WebSocketServer } from 'ws';
import { wsService } from './services/websocket.service';
import { verifyToken } from './utils/jwt.utils';
import { councilWsService } from './services/councilWebSocket.service';
// import { updateName } from '@/scripts/update_names';
const app = express();
const port = 9001;

const wss = new WebSocketServer({ port: 9002 })

app.use(express.json());

app.use(cors());


app.use((req: Request, res: Response, next: NextFunction) => {
    Authenticate.getInstance()?.authenticateUser(req, res, next);
});

app.disable('etag');

//connect to database
connectDb()
.then(() => {
    console.log('Database connected');

    //Scripts running on startup
    // updateName();

    // Configure routes
    app.use('', router)

    const server =app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });

    server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use!`);
        } else {
            console.error('Server error:', error);
        }
    });
})
.then(() => {
    wss.on('connection', (ws, req) => {
        console.log("WebSocket connection established", req.headers);

        console.log('req.url', req);

        const isAuthenticated = Authenticate.getInstance()?.authenticateWebSocket(req);
        if (!isAuthenticated) {
          console.log('WebSocket authentication failed')
          ws.close(4001, 'Authentication failed')
            return;
        }

      const userId = (req as any).userId as string
      console.log(`WebSocket authenticated for user: ${userId}`)

      // Parse URL to determine channel (chat vs council)
      const url = new URL(req.url || '', `http://${req.headers.host}`)
      const channel = url.searchParams.get('channel') || 'chat'

      if (channel === 'council') {
        // Council WebSocket - for agent council real-time events
        console.log(`[WebSocket] User ${userId} connected to council channel`)
        councilWsService.handleConnection(ws, userId)
      } else {
        // Chat WebSocket - existing chat functionality
        console.log(`[WebSocket] User ${userId} connected to chat channel`)
        wsService.handleConnection(ws, userId)
      }
    })

    console.log('WebSocket handlers configured')
  })
  .catch((error: any) => {
    console.error('Error connecting to database', error)
  })

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  wss.close(() => {
    console.log('WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...')
  wss.close(() => {
    console.log('WebSocket server closed')
    process.exit(0)
  })
})
