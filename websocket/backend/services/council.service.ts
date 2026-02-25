/**
 * Council Service — AI Agent Council
 * Business logic layer between Controller and Orchestrator
 * Integrates WebSocket event streaming
 */

import {
  orchestrator,
  OrchestratorRequest,
  SynthesizedAnswer,
  CouncilSession,
  SessionState
} from '@/orchestrator'
import { councilWsService } from './councilWebSocket.service'

class CouncilService {
  private static instance: CouncilService

  private constructor() {}

  public static getInstance(): CouncilService {
    if (!CouncilService.instance) {
      CouncilService.instance = new CouncilService()
    }
    return CouncilService.instance
  }

  /**
   * Process query asynchronously with WebSocket streaming
   * This is the primary method - events are streamed via WebSocket
   */
  async processQueryAsync(
    sessionId: string,
    userId: string,
    query: string,
    context?: string
  ): Promise<SynthesizedAnswer> {
    console.log(`[CouncilService] Starting async processing for session ${sessionId}`)

    // Create eventEmitter that broadcasts to WebSocket subscribers
    const eventEmitter = councilWsService.createEventEmitter(sessionId)

    const request: OrchestratorRequest = {
      sessionId,
      userId,
      query,
      context
    }

    try {
      // Process with event streaming
      const answer = await orchestrator.processQuery(request, eventEmitter)
      console.log(`[CouncilService] Session ${sessionId} completed with confidence ${answer.confidence}`)
      return answer
    } catch (error) {
      console.error(`[CouncilService] Error in session ${sessionId}:`, error)
      
      // Broadcast error event
      eventEmitter({
        type: 'error' as any,
        sessionId,
        timestamp: new Date(),
        payload: {
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      
      throw error
    }
  }

  /**
   * Process query synchronously (blocking, no streaming)
   * Use for simple integrations or testing
   */
  async processQuerySync(
    sessionId: string,
    userId: string,
    query: string,
    context?: string
  ): Promise<SynthesizedAnswer> {
    console.log(`[CouncilService] Starting sync processing for session ${sessionId}`)

    const request: OrchestratorRequest = {
      sessionId,
      userId,
      query,
      context
    }

    // Process without event streaming
    const answer = await orchestrator.processQuery(request)
    return answer
  }

  /**
   * Process quick query (skip debate rounds)
   * Use for simpler questions that don't need full deliberation
   */
  async processQuickQuery(
    sessionId: string,
    userId: string,
    query: string,
    context?: string
  ): Promise<SynthesizedAnswer> {
    console.log(`[CouncilService] Starting quick processing for session ${sessionId}`)

    const eventEmitter = councilWsService.createEventEmitter(sessionId)

    const request: OrchestratorRequest = {
      sessionId,
      userId,
      query,
      context
    }

    const answer = await orchestrator.processQuickQuery(request, eventEmitter)
    return answer
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): CouncilSession | undefined {
    return orchestrator.getSessionState(sessionId) 
      ? this.getFullSession(sessionId)
      : undefined
  }

  /**
   * Get full session data (internal helper)
   */
  private getFullSession(sessionId: string): CouncilSession | undefined {
    // Access session store through orchestrator
    const state = orchestrator.getSessionState(sessionId)
    if (!state) return undefined

    // Return minimal session info
    return {
      sessionId,
      state,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any
  }

  /**
   * Get session state
   */
  getSessionState(sessionId: string): SessionState | undefined {
    return orchestrator.getSessionState(sessionId)
  }

  /**
   * Get statistics for monitoring
   */
  getStats(): {
    orchestrator: ReturnType<typeof orchestrator.getStats>
    websocket: ReturnType<typeof councilWsService.getStats>
  } {
    return {
      orchestrator: orchestrator.getStats(),
      websocket: councilWsService.getStats()
    }
  }

  /**
   * Subscribe to session events programmatically
   * (Alternative to WebSocket for server-side integrations)
   */
  subscribeToSession(sessionId: string, callback: (event: any) => void): void {
    orchestrator.subscribeToSession(sessionId, callback)
  }

  /**
   * Unsubscribe from session events
   */
  unsubscribeFromSession(sessionId: string, callback: (event: any) => void): void {
    orchestrator.unsubscribeFromSession(sessionId, callback)
  }

  /**
   * Cleanup old sessions
   */
  cleanup(maxAgeMs?: number): void {
    orchestrator.cleanup(maxAgeMs)
    councilWsService.cleanup(maxAgeMs)
  }
}

export const councilService = CouncilService.getInstance()
