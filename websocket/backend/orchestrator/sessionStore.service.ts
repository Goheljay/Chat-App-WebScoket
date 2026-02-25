/**
 * Session Store Service — AI Agent Council
 * Manages council session state and persistence
 */

import {
  AgentId,
  AgentResponse,
  CouncilSession,
  EventEmitter,
  OrchestratorEvent,
  OrchestratorEventType,
  SessionState,
  SynthesizedAnswer
} from './orchestrator.types'

class SessionStoreService {
  private static instance: SessionStoreService
  private sessions: Map<string, CouncilSession> = new Map()
  private eventListeners: Map<string, EventEmitter[]> = new Map()

  private constructor() {}

  public static getInstance(): SessionStoreService {
    if (!SessionStoreService.instance) {
      SessionStoreService.instance = new SessionStoreService()
    }
    return SessionStoreService.instance
  }

  // Create a new session
  createSession(sessionId: string, userId: string, query: string, context?: string): CouncilSession {
    const session: CouncilSession = {
      sessionId,
      userId,
      query,
      context,
      state: SessionState.RECEIVED,
      createdAt: new Date(),
      updatedAt: new Date(),
      round1Results: new Map(),
      round2Results: new Map()
    }
    this.sessions.set(sessionId, session)
    this.emitStateChange(sessionId, SessionState.RECEIVED)
    return session
  }

  // Get session by ID
  getSession(sessionId: string): CouncilSession | undefined {
    return this.sessions.get(sessionId)
  }

  // Update session state with proper transitions
  updateState(sessionId: string, newState: SessionState): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    const validTransitions: Record<SessionState, SessionState[]> = {
      [SessionState.RECEIVED]: [SessionState.DISPATCHED, SessionState.ERROR],
      [SessionState.DISPATCHED]: [SessionState.DELIBERATING, SessionState.ERROR],
      [SessionState.DELIBERATING]: [SessionState.SYNTHESIZING, SessionState.ERROR],
      [SessionState.SYNTHESIZING]: [SessionState.COMPLETE, SessionState.ERROR],
      [SessionState.COMPLETE]: [],
      [SessionState.ERROR]: []
    }

    if (!validTransitions[session.state].includes(newState)) {
      console.warn(`Invalid state transition: ${session.state} → ${newState}`)
      return false
    }

    session.state = newState
    session.updatedAt = new Date()
    this.emitStateChange(sessionId, newState)
    return true
  }

  // Store Round 1 agent response
  storeRound1Result(sessionId: string, response: AgentResponse): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.round1Results.set(response.agentId, response)
    session.updatedAt = new Date()
  }

  // Store Round 2 agent response
  storeRound2Result(sessionId: string, response: AgentResponse): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.round2Results.set(response.agentId, response)
    session.updatedAt = new Date()
  }

  // Store final synthesized answer
  storeFinalAnswer(sessionId: string, answer: SynthesizedAnswer): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.finalAnswer = answer
    session.updatedAt = new Date()
  }

  // Store error
  storeError(sessionId: string, error: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    session.error = error
    session.state = SessionState.ERROR
    session.updatedAt = new Date()
    this.emitEvent(sessionId, {
      type: OrchestratorEventType.ERROR,
      sessionId,
      timestamp: new Date(),
      payload: { message: error }
    })
  }

  // Get all Round 1 results
  getRound1Results(sessionId: string): AgentResponse[] {
    const session = this.sessions.get(sessionId)
    if (!session) return []
    return Array.from(session.round1Results.values())
  }

  // Get all Round 2 results
  getRound2Results(sessionId: string): AgentResponse[] {
    const session = this.sessions.get(sessionId)
    if (!session) return []
    return Array.from(session.round2Results.values())
  }

  // Check if all debate agents have responded for a round
  isRoundComplete(sessionId: string, round: number, expectedAgents: AgentId[]): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    const results = round === 1 ? session.round1Results : session.round2Results
    return expectedAgents.every(agentId => results.has(agentId))
  }

  // Subscribe to session events
  subscribe(sessionId: string, listener: EventEmitter): void {
    const listeners = this.eventListeners.get(sessionId) || []
    listeners.push(listener)
    this.eventListeners.set(sessionId, listeners)
  }

  // Unsubscribe from session events
  unsubscribe(sessionId: string, listener: EventEmitter): void {
    const listeners = this.eventListeners.get(sessionId) || []
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  // Emit event to all subscribers
  emitEvent(sessionId: string, event: OrchestratorEvent): void {
    const listeners = this.eventListeners.get(sessionId) || []
    listeners.forEach(listener => {
      try {
        listener(event)
      } catch (err) {
        console.error('Error in event listener:', err)
      }
    })
  }

  // Emit state change event
  private emitStateChange(sessionId: string, state: SessionState): void {
    this.emitEvent(sessionId, {
      type: OrchestratorEventType.SESSION_STATE,
      sessionId,
      timestamp: new Date(),
      payload: { state }
    })
  }

  // Cleanup old sessions (call periodically)
  cleanup(maxAgeMs: number = 3600000): void {
    const now = Date.now()
    for (const [sessionId, session] of this.sessions) {
      if (now - session.updatedAt.getTime() > maxAgeMs) {
        this.sessions.delete(sessionId)
        this.eventListeners.delete(sessionId)
      }
    }
  }

  // Get session stats (for monitoring)
  getStats(): { total: number; byState: Record<SessionState, number> } {
    const byState: Record<SessionState, number> = {
      [SessionState.RECEIVED]: 0,
      [SessionState.DISPATCHED]: 0,
      [SessionState.DELIBERATING]: 0,
      [SessionState.SYNTHESIZING]: 0,
      [SessionState.COMPLETE]: 0,
      [SessionState.ERROR]: 0
    }
    for (const session of this.sessions.values()) {
      byState[session.state]++
    }
    return { total: this.sessions.size, byState }
  }
}

export const sessionStore = SessionStoreService.getInstance()
