/**
 * Orchestrator Types — AI Agent Council
 * Based on AGENT_COUNCIL_SPEC.md
 */

// Session states per spec state machine
export enum SessionState {
  RECEIVED = 'RECEIVED',
  DISPATCHED = 'DISPATCHED',
  DELIBERATING = 'DELIBERATING',
  SYNTHESIZING = 'SYNTHESIZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

// Agent IDs and models per spec
export enum AgentId {
  ANALYST = 'analyst_gpt4o',
  RESEARCHER = 'researcher_claude',
  REASONER = 'reasoner_gemini',
  CRITIC = 'critic_llama',
  SYNTHESIZER = 'synthesizer_sonnet'
}

export interface AgentConfig {
  id: AgentId
  name: string
  model: string
  role: string
  icon: string
  color: string
  weight: number // Critic gets 1.5x per spec
}

// Agent response stance for debate rounds
export type Stance = 'affirm' | 'critique' | 'revise'

// Agent message contract per spec (Section 06)
export interface AgentResponse {
  agentId: AgentId
  round: number
  reasoning: string
  answer: string
  confidence: number // 0–1
  critiqueOf?: AgentId[] // Round 2 only
  stance?: Stance
  sources?: string[]
  tokensUsed: number
  latencyMs: number
}

// Session data stored during orchestration
export interface CouncilSession {
  sessionId: string
  userId: string
  query: string
  context?: string
  state: SessionState
  createdAt: Date
  updatedAt: Date
  round1Results: Map<AgentId, AgentResponse>
  round2Results: Map<AgentId, AgentResponse>
  finalAnswer?: SynthesizedAnswer
  error?: string
}

// Final synthesized answer
export interface SynthesizedAnswer {
  text: string
  confidence: number
  contributingAgents: AgentId[]
  sources: string[]
  tokensUsed: number
  latencyMs: number
}

// Request from API Gateway to Orchestrator
export interface OrchestratorRequest {
  sessionId: string
  userId: string
  query: string
  context?: string
}

// Events emitted by Orchestrator (to Gateway → Frontend)
export enum OrchestratorEventType {
  SESSION_STATE = 'session:state',
  AGENT_THINKING = 'agent:thinking',
  AGENT_DEBATE = 'agent:debate',
  COUNCIL_CONFIDENCE = 'council:confidence',
  COUNCIL_ANSWER = 'council:answer',
  ERROR = 'error'
}

export interface OrchestratorEvent {
  type: OrchestratorEventType
  sessionId: string
  timestamp: Date
  payload: SessionStatePayload | AgentThinkingPayload | AgentDebatePayload | CouncilConfidencePayload | CouncilAnswerPayload | ErrorPayload
}

export interface SessionStatePayload {
  state: SessionState
}

export interface AgentThinkingPayload {
  agentId: AgentId
  round: number
  reasoning: string
}

export interface AgentDebatePayload {
  agentId: AgentId
  stance: Stance
  critique?: string
  critiqueOf?: AgentId[]
}

export interface CouncilConfidencePayload {
  score: number
  agentsAligned: number
  totalAgents: number
}

export interface CouncilAnswerPayload {
  text: string
  confidence: number
  contributingAgents: AgentId[]
}

export interface ErrorPayload {
  message: string
  code?: string
}

// Debate context passed to agents in Round 2
export interface DebateContext {
  originalQuery: string
  round1Responses: AgentResponse[]
}

// LLM provider configuration
export interface LLMProviderConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'groq'
  model: string
  apiKey: string
  maxTokens?: number
  temperature?: number
}

// Agent task for parallel dispatch
export interface AgentTask {
  agentId: AgentId
  sessionId: string
  query: string
  context?: string
  round: number
  debateContext?: DebateContext
}

// Callback for event emission
export type EventEmitter = (event: OrchestratorEvent) => void
