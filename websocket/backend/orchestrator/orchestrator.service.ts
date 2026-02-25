/**
 * Orchestrator Service — AI Agent Council
 * The brain that manages the full council lifecycle:
 * Dispatch → Deliberate → Synthesize
 */

import {
  AgentId,
  AgentResponse,
  AgentTask,
  EventEmitter,
  OrchestratorEvent,
  OrchestratorEventType,
  OrchestratorRequest,
  SessionState,
  SynthesizedAnswer
} from './orchestrator.types'
import { DEBATE_AGENTS } from './agents.config'
import { sessionStore } from './sessionStore.service'
import { agentWorker } from './agentWorker.service'
import { debateEngine } from './debateEngine.service'
import { synthesizer } from './synthesizer.service'

class OrchestratorService {
  private static instance: OrchestratorService

  private constructor() {}

  public static getInstance(): OrchestratorService {
    if (!OrchestratorService.instance) {
      OrchestratorService.instance = new OrchestratorService()
    }
    return OrchestratorService.instance
  }

  /**
   * Process a council query through the full lifecycle
   * This is the main entry point called by the API Gateway
   */
  async processQuery(
    request: OrchestratorRequest,
    eventEmitter?: EventEmitter
  ): Promise<SynthesizedAnswer> {
    const { sessionId, userId, query, context } = request
    console.log(`[Orchestrator] Processing query for session ${sessionId}`)

    try {
      // Step 1: Create/validate session (RECEIVED state)
      let session = sessionStore.getSession(sessionId)
      if (!session) {
        session = sessionStore.createSession(sessionId, userId, query, context)
      }

      // Step 2: Dispatch to all agents in parallel (DISPATCHED state)
      sessionStore.updateState(sessionId, SessionState.DISPATCHED)
      const round1Responses = await this.dispatchRound1(sessionId, query, context, eventEmitter)

      // Store Round 1 results
      round1Responses.forEach(response => {
        sessionStore.storeRound1Result(sessionId, response)
      })

      // Step 3: Run debate rounds (DELIBERATING state)
      sessionStore.updateState(sessionId, SessionState.DELIBERATING)
      const debateResult = await debateEngine.runFullDebate(
        sessionId,
        query,
        round1Responses,
        eventEmitter
      )

      // Step 4: Synthesize final answer (SYNTHESIZING state)
      sessionStore.updateState(sessionId, SessionState.SYNTHESIZING)
      const finalAnswer = await synthesizer.synthesize(
        sessionId,
        query,
        debateResult.allResponses,
        eventEmitter
      )

      // Step 5: Complete (COMPLETE state)
      sessionStore.storeFinalAnswer(sessionId, finalAnswer)
      sessionStore.updateState(sessionId, SessionState.COMPLETE)

      console.log(`[Orchestrator] Session ${sessionId} complete with confidence ${finalAnswer.confidence}`)
      return finalAnswer

    } catch (error) {
      console.error(`[Orchestrator] Error processing session ${sessionId}:`, error)
      sessionStore.storeError(sessionId, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Dispatch Round 1: All agents analyze query in parallel
   */
  private async dispatchRound1(
    sessionId: string,
    query: string,
    context?: string,
    eventEmitter?: EventEmitter
  ): Promise<AgentResponse[]> {
    console.log(`[Orchestrator] Dispatching Round 1 to ${DEBATE_AGENTS.length} agents`)

    // Create tasks for all debate agents (Synthesizer not included in debate)
    const tasks: AgentTask[] = DEBATE_AGENTS.map(agentId => ({
      agentId,
      sessionId,
      query,
      context,
      round: 1
    }))

    // Dispatch all in parallel and wait for completion
    const responses = await agentWorker.dispatchParallel(tasks, eventEmitter)

    console.log(`[Orchestrator] Round 1 complete: ${responses.length} responses received`)
    return responses
  }

  /**
   * Quick process: Skip debate for simple queries (optional optimization)
   */
  async processQuickQuery(
    request: OrchestratorRequest,
    eventEmitter?: EventEmitter
  ): Promise<SynthesizedAnswer> {
    const { sessionId, userId, query, context } = request
    console.log(`[Orchestrator] Quick processing query for session ${sessionId}`)

    try {
      // Create session
      sessionStore.createSession(sessionId, userId, query, context)

      // Dispatch Round 1 only
      sessionStore.updateState(sessionId, SessionState.DISPATCHED)
      const round1Responses = await this.dispatchRound1(sessionId, query, context, eventEmitter)

      // Skip debate, go straight to synthesis
      sessionStore.updateState(sessionId, SessionState.SYNTHESIZING)
      const finalAnswer = await synthesizer.quickSynthesize(
        sessionId,
        query,
        round1Responses,
        eventEmitter
      )

      sessionStore.storeFinalAnswer(sessionId, finalAnswer)
      sessionStore.updateState(sessionId, SessionState.COMPLETE)

      return finalAnswer

    } catch (error) {
      console.error(`[Orchestrator] Error in quick processing:`, error)
      sessionStore.storeError(sessionId, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Subscribe to session events (called by API Gateway for WebSocket streaming)
   */
  subscribeToSession(sessionId: string, listener: EventEmitter): void {
    sessionStore.subscribe(sessionId, listener)
  }

  /**
   * Unsubscribe from session events
   */
  unsubscribeFromSession(sessionId: string, listener: EventEmitter): void {
    sessionStore.unsubscribe(sessionId, listener)
  }

  /**
   * Get session state (for status checks)
   */
  getSessionState(sessionId: string): SessionState | undefined {
    return sessionStore.getSession(sessionId)?.state
  }

  /**
   * Get session statistics (for monitoring)
   */
  getStats() {
    return sessionStore.getStats()
  }

  /**
   * Cleanup old sessions
   */
  cleanup(maxAgeMs?: number): void {
    sessionStore.cleanup(maxAgeMs)
  }
}

export const orchestrator = OrchestratorService.getInstance()

// Export for API Gateway integration
export { OrchestratorRequest, OrchestratorEvent, SessionState } from './orchestrator.types'
