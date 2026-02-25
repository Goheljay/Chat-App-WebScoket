/**
 * AI Agent Council — Orchestrator Module
 * 
 * The brain of the council system that manages:
 * - Session lifecycle (RECEIVED → DISPATCHED → DELIBERATING → SYNTHESIZING → COMPLETE)
 * - Parallel agent dispatch
 * - Debate rounds (max 2)
 * - Final synthesis with confidence-weighted voting
 * 
 * Usage:
 * ```typescript
 * import { orchestrator, OrchestratorRequest } from './orchestrator'
 * 
 * const request: OrchestratorRequest = {
 *   sessionId: 'uuid',
 *   userId: 'user-id',
 *   query: 'What is the best investment strategy?'
 * }
 * 
 * // Subscribe to real-time events (for WebSocket streaming)
 * orchestrator.subscribeToSession(sessionId, (event) => {
 *   ws.send(JSON.stringify(event))
 * })
 * 
 * // Process the query
 * const answer = await orchestrator.processQuery(request, eventEmitter)
 * ```
 */

// Main orchestrator service
export { orchestrator } from './orchestrator.service'

// Types
export {
  AgentId,
  AgentConfig,
  AgentResponse,
  AgentTask,
  CouncilSession,
  DebateContext,
  EventEmitter,
  OrchestratorEvent,
  OrchestratorEventType,
  OrchestratorRequest,
  SessionState,
  Stance,
  SynthesizedAnswer
} from './orchestrator.types'

// Agent configurations
export { AGENT_CONFIGS, DEBATE_AGENTS, MAX_DEBATE_ROUNDS } from './agents.config'

// Sub-services (for advanced usage)
export { sessionStore } from './sessionStore.service'
export { agentWorker } from './agentWorker.service'
export { debateEngine } from './debateEngine.service'
export { synthesizer } from './synthesizer.service'
