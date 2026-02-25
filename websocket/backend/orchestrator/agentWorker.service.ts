/**
 * Agent Worker Service — AI Agent Council
 * Handles parallel dispatch to LLM agents
 * 
 * NOTE: This uses mock implementations. Replace with actual LLM SDK calls:
 * - OpenAI: openai.chat.completions.create()
 * - Anthropic: anthropic.messages.create()
 * - Google: google.generativeai
 * - Groq: groq.chat.completions.create()
 */

import {
  AgentId,
  AgentResponse,
  AgentTask,
  DebateContext,
  EventEmitter,
  OrchestratorEvent,
  OrchestratorEventType,
  Stance
} from './orchestrator.types'
import { AGENT_CONFIGS, AGENT_SYSTEM_PROMPTS, DEBATE_PROMPT_TEMPLATE } from './agents.config'

class AgentWorkerService {
  private static instance: AgentWorkerService

  private constructor() {}

  public static getInstance(): AgentWorkerService {
    if (!AgentWorkerService.instance) {
      AgentWorkerService.instance = new AgentWorkerService()
    }
    return AgentWorkerService.instance
  }

  /**
   * Dispatch tasks to multiple agents in parallel
   * Returns when all agents complete (Promise.all)
   */
  async dispatchParallel(
    tasks: AgentTask[],
    onAgentThinking?: EventEmitter
  ): Promise<AgentResponse[]> {
    const promises = tasks.map(task => this.executeAgentTask(task, onAgentThinking))
    return Promise.all(promises)
  }

  /**
   * Execute a single agent task
   */
  async executeAgentTask(
    task: AgentTask,
    onAgentThinking?: EventEmitter
  ): Promise<AgentResponse> {
    const startTime = Date.now()
    const config = AGENT_CONFIGS[task.agentId]
    const systemPrompt = AGENT_SYSTEM_PROMPTS[task.agentId]

    try {
      // Build the prompt
      const prompt = this.buildPrompt(task, systemPrompt)

      // Emit thinking event
      if (onAgentThinking) {
        onAgentThinking({
          type: OrchestratorEventType.AGENT_THINKING,
          sessionId: task.sessionId,
          timestamp: new Date(),
          payload: {
            agentId: task.agentId,
            round: task.round,
            reasoning: `${config.name} is analyzing the query...`
          }
        })
      }

      // Call the LLM (mock for now, replace with actual SDK calls)
      const llmResponse = await this.callLLM(task.agentId, prompt, task)

      // Parse structured response
      const response: AgentResponse = {
        agentId: task.agentId,
        round: task.round,
        reasoning: llmResponse.reasoning,
        answer: llmResponse.answer,
        confidence: llmResponse.confidence,
        stance: llmResponse.stance,
        critiqueOf: llmResponse.critiqueOf,
        sources: llmResponse.sources,
        tokensUsed: llmResponse.tokensUsed,
        latencyMs: Date.now() - startTime
      }

      // Emit updated thinking with actual reasoning
      if (onAgentThinking) {
        onAgentThinking({
          type: OrchestratorEventType.AGENT_THINKING,
          sessionId: task.sessionId,
          timestamp: new Date(),
          payload: {
            agentId: task.agentId,
            round: task.round,
            reasoning: response.reasoning
          }
        })
      }

      return response
    } catch (error) {
      console.error(`Agent ${task.agentId} failed:`, error)
      return {
        agentId: task.agentId,
        round: task.round,
        reasoning: 'Error processing request',
        answer: 'Unable to provide response due to error',
        confidence: 0,
        tokensUsed: 0,
        latencyMs: Date.now() - startTime
      }
    }
  }

  /**
   * Build prompt for agent based on task type
   */
  private buildPrompt(task: AgentTask, systemPrompt: string): string {
    if (task.round === 1) {
      // Round 1: Simple query analysis
      return `${systemPrompt}

USER QUERY: ${task.query}
${task.context ? `\nCONTEXT: ${task.context}` : ''}

Analyze this query and provide:
1. Your reasoning (chain of thought)
2. Your proposed answer
3. Confidence score (0-1)
4. Any sources you're drawing from

Respond in a structured format.`
    } else {
      // Round 2: Debate with other agents' responses
      const debatePrompt = this.buildDebatePrompt(task)
      return `${systemPrompt}

${debatePrompt}`
    }
  }

  /**
   * Build debate prompt with other agents' responses
   */
  private buildDebatePrompt(task: AgentTask): string {
    if (!task.debateContext) return ''

    const otherResponses = task.debateContext.round1Responses
      .filter(r => r.agentId !== task.agentId)
      .map(r => {
        const config = AGENT_CONFIGS[r.agentId]
        return `
--- ${config.name} (${config.role}) ---
Reasoning: ${r.reasoning}
Answer: ${r.answer}
Confidence: ${(r.confidence * 100).toFixed(0)}%`
      })
      .join('\n')

    return DEBATE_PROMPT_TEMPLATE
      .replace('{{round}}', task.round.toString())
      .replace('{{query}}', task.debateContext.originalQuery)
      .replace('{{otherResponses}}', otherResponses)
  }

  /**
   * Call LLM API (MOCK implementation)
   * Replace with actual SDK calls for production
   */
  private async callLLM(
    agentId: AgentId,
    prompt: string,
    task: AgentTask
  ): Promise<{
    reasoning: string
    answer: string
    confidence: number
    stance?: Stance
    critiqueOf?: AgentId[]
    sources?: string[]
    tokensUsed: number
  }> {
    // Simulate LLM latency (1-3 seconds)
    await this.delay(1000 + Math.random() * 2000)

    // Mock responses based on agent role
    const mockResponses = this.getMockResponse(agentId, task)
    
    return {
      ...mockResponses,
      tokensUsed: Math.floor(200 + Math.random() * 600)
    }
  }

  /**
   * Mock response generator (replace with actual LLM calls)
   */
  private getMockResponse(agentId: AgentId, task: AgentTask): {
    reasoning: string
    answer: string
    confidence: number
    stance?: Stance
    critiqueOf?: AgentId[]
    sources?: string[]
  } {
    const config = AGENT_CONFIGS[agentId]
    const isDebateRound = task.round > 1

    // Base mock responses by agent type
    const responses: Record<AgentId, { reasoning: string; answer: string; confidence: number }> = {
      [AgentId.ANALYST]: {
        reasoning: `Analyzing the key facts in the query. Extracting data points and verifiable information. The query asks about "${task.query.substring(0, 50)}..."`,
        answer: `Based on factual analysis, the key considerations are: data-driven approach, evidence-based recommendations, and quantifiable metrics.`,
        confidence: 0.82
      },
      [AgentId.RESEARCHER]: {
        reasoning: `Researching relevant context and background. Found related studies and best practices applicable to this query.`,
        answer: `Research indicates multiple approaches are valid. Key findings from industry studies support a balanced methodology.`,
        confidence: 0.78
      },
      [AgentId.REASONER]: {
        reasoning: `Applying logical reasoning to the query. Checking for consistency and identifying cause-effect relationships.`,
        answer: `Logically, the optimal approach follows these steps: first assess, then plan, finally execute with validation.`,
        confidence: 0.85
      },
      [AgentId.CRITIC]: {
        reasoning: `Critically examining all assumptions. Identifying potential blind spots and risks that others may have missed.`,
        answer: `Important caveats: ensure prerequisites are met, consider edge cases, and validate assumptions before proceeding.`,
        confidence: 0.75
      },
      [AgentId.SYNTHESIZER]: {
        reasoning: `Synthesizing all agent perspectives. Weighing contributions by confidence and applying critic's 1.5x weight.`,
        answer: `Council synthesis complete. The unified recommendation balances all perspectives.`,
        confidence: 0.88
      }
    }

    const base = responses[agentId]

    if (isDebateRound) {
      // Add debate-specific fields
      const stances: Stance[] = ['affirm', 'critique', 'revise']
      const stance = stances[Math.floor(Math.random() * 3)]
      
      return {
        ...base,
        reasoning: `[Round ${task.round}] ${stance === 'critique' ? 'Challenging previous assumptions.' : stance === 'revise' ? 'Updating based on valid points.' : 'Affirming consensus.'} ${base.reasoning}`,
        stance,
        critiqueOf: stance === 'critique' ? [this.getRandomOtherAgent(agentId)] : undefined,
        confidence: Math.min(0.95, base.confidence + (stance === 'affirm' ? 0.1 : -0.05))
      }
    }

    return {
      ...base,
      sources: [`${config.name} knowledge base`, 'Domain expertise']
    }
  }

  /**
   * Get a random other agent ID for mock critiques
   */
  private getRandomOtherAgent(excludeId: AgentId): AgentId {
    const others = Object.values(AgentId).filter(id => id !== excludeId && id !== AgentId.SYNTHESIZER)
    return others[Math.floor(Math.random() * others.length)]
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const agentWorker = AgentWorkerService.getInstance()
