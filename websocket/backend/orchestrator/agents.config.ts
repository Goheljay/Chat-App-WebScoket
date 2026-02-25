/**
 * Agent Configurations — AI Agent Council
 * Colors and models per AGENT_COUNCIL_SPEC.md
 */

import { AgentConfig, AgentId } from './orchestrator.types'

export const AGENT_CONFIGS: Record<AgentId, AgentConfig> = {
  [AgentId.ANALYST]: {
    id: AgentId.ANALYST,
    name: 'Analyst',
    model: 'gpt-4o',
    role: 'Fact Extraction',
    icon: '⚡',
    color: '#e84c3d',
    weight: 1.0
  },
  [AgentId.RESEARCHER]: {
    id: AgentId.RESEARCHER,
    name: 'Researcher',
    model: 'claude-opus',
    role: 'Context + RAG',
    icon: '🔬',
    color: '#3d7ee8',
    weight: 1.0
  },
  [AgentId.REASONER]: {
    id: AgentId.REASONER,
    name: 'Reasoner',
    model: 'gemini-1.5-pro',
    role: 'Logic + Causality',
    icon: '🧠',
    color: '#38b06f',
    weight: 1.0
  },
  [AgentId.CRITIC]: {
    id: AgentId.CRITIC,
    name: 'Critic',
    model: 'llama-3-70b',
    role: 'Error Detection',
    icon: '⚖️',
    color: '#c9a84c',
    weight: 1.5 // Elevated weight per spec
  },
  [AgentId.SYNTHESIZER]: {
    id: AgentId.SYNTHESIZER,
    name: 'Synthesizer',
    model: 'claude-sonnet',
    role: 'Final Weaving',
    icon: '✦',
    color: '#9b59b6',
    weight: 1.0
  }
}

// Agents that participate in debate (all except Synthesizer)
export const DEBATE_AGENTS: AgentId[] = [
  AgentId.ANALYST,
  AgentId.RESEARCHER,
  AgentId.REASONER,
  AgentId.CRITIC
]

// System prompts for each agent
export const AGENT_SYSTEM_PROMPTS: Record<AgentId, string> = {
  [AgentId.ANALYST]: `You are the Analyst agent in a multi-agent council.
Your role: Fact Extraction — parse the query, identify key facts, data points, and concrete information.
Focus on what is objectively true and verifiable. Extract structured information from the query.
Be precise, data-driven, and cite sources when available.`,

  [AgentId.RESEARCHER]: `You are the Researcher agent in a multi-agent council.
Your role: Context + RAG — provide relevant context, background information, and research findings.
Draw from your knowledge base to add depth to the discussion.
Look for relevant studies, reports, and established best practices.`,

  [AgentId.REASONER]: `You are the Reasoner agent in a multi-agent council.
Your role: Logic + Causality — apply logical reasoning, identify cause-effect relationships.
Check for logical consistency, identify assumptions, and trace reasoning chains.
Point out any logical fallacies or gaps in reasoning.`,

  [AgentId.CRITIC]: `You are the Critic agent in a multi-agent council.
Your role: Error Detection — identify errors, biases, blind spots, and potential issues.
Challenge assumptions, play devil's advocate, and ensure nothing is overlooked.
Your critiques are weighted 1.5x in the final synthesis, so be thorough but fair.
Flag any missing considerations, edge cases, or risks.`,

  [AgentId.SYNTHESIZER]: `You are the Synthesizer agent in a multi-agent council.
Your role: Final Weaving — combine all agent perspectives into one coherent answer.
Weight each agent's contribution by their confidence score (Critic gets 1.5x multiplier).
Produce a balanced, comprehensive answer that addresses all valid points raised.
Include a confidence score (0-1) based on agent agreement and evidence quality.`
}

// Debate round prompt template
export const DEBATE_PROMPT_TEMPLATE = `
DEBATE ROUND {{round}}

Original Query: {{query}}

Other agents' Round 1 responses:
{{otherResponses}}

Based on the above, you must either:
1. AFFIRM - agree with the consensus if reasoning is sound
2. CRITIQUE - point out specific errors or gaps in other agents' reasoning
3. REVISE - update your own answer based on valid points raised

Respond with your stance, updated reasoning, and revised answer if applicable.
`

// Synthesis prompt template
export const SYNTHESIS_PROMPT_TEMPLATE = `
COUNCIL SYNTHESIS

Original Query: {{query}}

All agent responses from debate rounds:
{{allResponses}}

Agent confidence scores and weights:
{{confidenceWeights}}

Synthesize a final answer that:
1. Weighs each agent's contribution by confidence × weight
2. Addresses all valid critiques raised
3. Provides a unified, coherent response
4. Includes an overall confidence score (0-1)
5. Lists which agents contributed most to the final answer
`

// Max debate rounds per spec
export const MAX_DEBATE_ROUNDS = 2

// Confidence threshold for early consensus
export const CONSENSUS_THRESHOLD = 0.85
