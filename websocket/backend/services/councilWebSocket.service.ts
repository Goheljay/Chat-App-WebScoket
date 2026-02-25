/**
 * Council WebSocket Service — AI Agent Council
 * Manages WebSocket connections for real-time council event streaming
 */

import { WebSocket } from 'ws'
import { OrchestratorEvent, EventEmitter } from '@/orchestrator'

interface CouncilConnection {
  ws: WebSocket
  userId: string
  sessionId: string
  connectedAt: Date
}

class CouncilWebSocketService {
  private static instance: CouncilWebSocketService
  
  // Map: sessionId → Set of WebSocket connections
  private sessionConnections: Map<string, Set<WebSocket>> = new Map()
  
  // Map: WebSocket → connection info
  private connectionInfo: Map<WebSocket, CouncilConnection> = new Map()
  
  // Map: userId → Set of sessionIds they're subscribed to
  private userSessions: Map<string, Set<string>> = new Map()

  private constructor() {}

  public static getInstance(): CouncilWebSocketService {
    if (!CouncilWebSocketService.instance) {
      CouncilWebSocketService.instance = new CouncilWebSocketService()
    }
    return CouncilWebSocketService.instance
  }

  /**
   * Handle new council WebSocket connection
   */
  handleConnection(ws: WebSocket, userId: string): void {
    console.log(`[CouncilWS] User ${userId} connected`)

    // Listen for messages from client
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        this.handleMessage(ws, userId, message)
      } catch (error) {
        console.error('[CouncilWS] Error parsing message:', error)
        this.sendError(ws, 'Invalid message format')
      }
    })

    ws.on('close', () => {
      this.handleDisconnect(ws)
    })

    ws.on('error', (error) => {
      console.error(`[CouncilWS] WebSocket error for user ${userId}:`, error)
      this.handleDisconnect(ws)
    })

    // Send connection acknowledgment
    this.sendToConnection(ws, {
      type: 'connection:ack',
      payload: { userId, message: 'Connected to Council WebSocket' }
    })
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(ws: WebSocket, userId: string, message: any): void {
    const { action, sessionId } = message

    switch (action) {
      case 'subscribe':
        if (sessionId) {
          this.subscribeToSession(ws, userId, sessionId)
        } else {
          this.sendError(ws, 'sessionId required for subscribe')
        }
        break

      case 'unsubscribe':
        if (sessionId) {
          this.unsubscribeFromSession(ws, sessionId)
        }
        break

      case 'ping':
        this.sendToConnection(ws, { type: 'pong', payload: { timestamp: Date.now() } })
        break

      default:
        this.sendError(ws, `Unknown action: ${action}`)
    }
  }

  /**
   * Subscribe a WebSocket to a session's events
   */
  subscribeToSession(ws: WebSocket, userId: string, sessionId: string): void {
    console.log(`[CouncilWS] User ${userId} subscribing to session ${sessionId}`)

    // Add to session connections
    let connections = this.sessionConnections.get(sessionId)
    if (!connections) {
      connections = new Set()
      this.sessionConnections.set(sessionId, connections)
    }
    connections.add(ws)

    // Store connection info
    this.connectionInfo.set(ws, {
      ws,
      userId,
      sessionId,
      connectedAt: new Date()
    })

    // Track user's sessions
    let userSessionSet = this.userSessions.get(userId)
    if (!userSessionSet) {
      userSessionSet = new Set()
      this.userSessions.set(userId, userSessionSet)
    }
    userSessionSet.add(sessionId)

    // Confirm subscription
    this.sendToConnection(ws, {
      type: 'subscription:ack',
      payload: { sessionId, message: 'Subscribed to session events' }
    })
  }

  /**
   * Unsubscribe a WebSocket from a session
   */
  unsubscribeFromSession(ws: WebSocket, sessionId: string): void {
    const connections = this.sessionConnections.get(sessionId)
    if (connections) {
      connections.delete(ws)
      if (connections.size === 0) {
        this.sessionConnections.delete(sessionId)
      }
    }

    const info = this.connectionInfo.get(ws)
    if (info) {
      const userSessions = this.userSessions.get(info.userId)
      if (userSessions) {
        userSessions.delete(sessionId)
      }
    }

    this.connectionInfo.delete(ws)
  }

  /**
   * Handle WebSocket disconnect
   */
  private handleDisconnect(ws: WebSocket): void {
    const info = this.connectionInfo.get(ws)
    if (info) {
      console.log(`[CouncilWS] User ${info.userId} disconnected from session ${info.sessionId}`)
      this.unsubscribeFromSession(ws, info.sessionId)
    }
  }

  /**
   * Create an eventEmitter for a session
   * This is called by the council service and passed to the orchestrator
   */
  createEventEmitter(sessionId: string): EventEmitter {
    return (event: OrchestratorEvent) => {
      this.broadcastToSession(sessionId, event)
    }
  }

  /**
   * Broadcast an event to all connections subscribed to a session
   */
  broadcastToSession(sessionId: string, event: OrchestratorEvent): void {
    const connections = this.sessionConnections.get(sessionId)
    if (!connections || connections.size === 0) {
      console.log(`[CouncilWS] No connections for session ${sessionId}`)
      return
    }

    const message = JSON.stringify(event)
    let sentCount = 0

    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
        sentCount++
      }
    })

    console.log(`[CouncilWS] Broadcast event ${event.type} to ${sentCount} connections for session ${sessionId}`)
  }

  /**
   * Send a message to a specific connection
   */
  private sendToConnection(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  /**
   * Send an error message to a connection
   */
  private sendError(ws: WebSocket, message: string): void {
    this.sendToConnection(ws, {
      type: 'error',
      payload: { message }
    })
  }

  /**
   * Get stats for monitoring
   */
  getStats(): { totalSessions: number; totalConnections: number; sessionsWithConnections: string[] } {
    return {
      totalSessions: this.sessionConnections.size,
      totalConnections: this.connectionInfo.size,
      sessionsWithConnections: Array.from(this.sessionConnections.keys())
    }
  }

  /**
   * Cleanup old sessions (call periodically)
   */
  cleanup(maxAgeMs: number = 3600000): void {
    const now = Date.now()
    this.connectionInfo.forEach((info, ws) => {
      if (now - info.connectedAt.getTime() > maxAgeMs) {
        ws.close()
        this.handleDisconnect(ws)
      }
    })
  }
}

export const councilWsService = CouncilWebSocketService.getInstance()
