/**
 * Synthesizer Service — AI Agent Council
 * Produces the final unified answer from all agent responses
 * Uses confidence-weighted aggregation with Critic at 1.5x
 */

import {
  AgentId,
  AgentResponse,
  AgentTask,
  EventEmitter,
  OrchestratorEvent,
  OrchestratorEventType,
  SynthesizedAnswer
} from './orchestrator.types'
import { AGENT_CONFIGS, SYNTHESIS_PROMPT_TEMPLATE } from './agents.config'
import { agentWorker } from './agentWorker.service'
import { debateEngine } from './debateEngine.service'

class SynthesizerService {
  private static instance: SynthesizerService

  private constructor() {}

  public static getInstance(): SynthesizerService {
    if (!SynthesizerService.instance) {
      SynthesizerService.instance = new SynthesizerService()
    }
    return SynthesizerService.instance
  }

  /**
   * Synthesize final answer from all agent responses
   */
  async synthesize(
    sessionId: string,
    query: string,
    allResponses: AgentResponse[],
    eventEmitter?: EventEmitter
  ): Promise<SynthesizedAnswer> {
    const startTime = Date.now()
    console.log(`[Synthesizer] Starting synthesis for session ${sessionId}`)

    // Get the latest response from each agent
    const latestResponses = this.getLatestResponses(allResponses)

    // Calculate weighted contributions
    const weightedContributions = this.calculateWeightedContributions(latestResponses)

    // Build synthesis prompt
    const synthesisPrompt = this.buildSynthesisPrompt(query, latestResponses, weightedContributions)

    // Create synthesizer task
    const task: AgentTask = {
      agentId: AgentId.SYNTHESIZER,
      sessionId,
      query: synthesisPrompt,
      round: 0 // Special round for synthesis
    }

    // Execute synthesizer agent
    const synthesizerResponse = await agentWorker.executeAgentTask(task, eventEmitter)

    // Determine contributing agents (those with significant weight)
    const contributingAgents = this.identifyContributingAgents(weightedContributions)

    // Collect all sources
    const allSources = this.collectSources(latestResponses)

    // Build final answer
    const finalAnswer: SynthesizedAnswer = {
      text: this.formatFinalAnswer(synthesizerResponse.answer, latestResponses),
      confidence: this.calculateFinalConfidence(latestResponses),
      contributingAgents,
      sources: allSources,
      tokensUsed: synthesizerResponse.tokensUsed + this.sumTokens(latestResponses),
      latencyMs: Date.now() - startTime
    }

    // Emit final answer event
    if (eventEmitter) {
      eventEmitter({
        type: OrchestratorEventType.COUNCIL_ANSWER,
        sessionId,
        timestamp: new Date(),
        payload: {
          text: finalAnswer.text,
          confidence: finalAnswer.confidence,
          contributingAgents: finalAnswer.contributingAgents
        }
      })
    }

    return finalAnswer
  }

  /**
   * Get the latest response from each agent (prefer later rounds)
   */
  private getLatestResponses(allResponses: AgentResponse[]): AgentResponse[] {
    const latestMap = new Map<AgentId, AgentResponse>()

    allResponses.forEach(response => {
      const existing = latestMap.get(response.agentId)
      if (!existing || response.round > existing.round) {
        latestMap.set(response.agentId, response)
      }
    })

    return Array.from(latestMap.values())
  }

  /**
   * Calculate weighted contribution score for each agent
   * Critic gets 1.5x weight per spec
   */
  private calculateWeightedContributions(responses: AgentResponse[]): Map<AgentId, number> {
    const contributions = new Map<AgentId, number>()
    let totalWeight = 0

    responses.forEach(response => {
      const config = AGENT_CONFIGS[response.agentId]
      const baseWeight = config?.weight || 1.0
      const confidenceWeight = response.confidence * baseWeight

      // Boost weight if agent's critiques were accepted
      let finalWeight = confidenceWeight
      if (response.stance === 'critique' && response.confidence > 0.7) {
        finalWeight *= 1.2 // Extra boost for high-confidence critiques
      }

      contributions.set(response.agentId, finalWeight)
      totalWeight += finalWeight
    })

    // Normalize to percentages
    contributions.forEach((weight, agentId) => {
      contributions.set(agentId, weight / totalWeight)
    })

    return contributions
  }

  /**
   * Build the synthesis prompt with all agent responses
   */
  private buildSynthesisPrompt(
    query: string,
    responses: AgentResponse[],
    weights: Map<AgentId, number>
  ): string {
    const responsesText = responses
      .map(r => {
        const config = AGENT_CONFIGS[r.agentId]
        const weight = weights.get(r.agentId) || 0
        return `
--- ${config.name} (${config.role}) ---
Round: ${r.round}
Reasoning: ${r.reasoning}
Answer: ${r.answer}
Confidence: ${(r.confidence * 100).toFixed(0)}%
Stance: ${r.stance || 'initial'}
Weight: ${(weight * 100).toFixed(0)}%`
      })
      .join('\n')

    const weightsText = responses
      .map(r => {
        const config = AGENT_CONFIGS[r.agentId]
        const weight = weights.get(r.agentId) || 0
        return `${config.name}: ${(r.confidence * 100).toFixed(0)}% confidence × ${config.weight}x weight = ${(weight * 100).toFixed(0)}% contribution`
      })
      .join('\n')

    return SYNTHESIS_PROMPT_TEMPLATE
      .replace('{{query}}', query)
      .replace('{{allResponses}}', responsesText)
      .replace('{{confidenceWeights}}', weightsText)
  }

  /**
   * Identify agents that contributed significantly to the answer
   */
  private identifyContributingAgents(weights: Map<AgentId, number>): AgentId[] {
    const threshold = 0.1 // 10% contribution threshold
    const contributors: AgentId[] = []

    weights.forEach((weight, agentId) => {
      if (weight >= threshold && agentId !== AgentId.SYNTHESIZER) {
        contributors.push(agentId)
      }
    })

    // Sort by contribution weight (highest first)
    contributors.sort((a, b) => (weights.get(b) || 0) - (weights.get(a) || 0))

    return contributors
  }

  /**
   * Collect all unique sources from responses
   */
  private collectSources(responses: AgentResponse[]): string[] {
    const sources = new Set<string>()

    responses.forEach(response => {
      response.sources?.forEach(source => sources.add(source))
    })

    return Array.from(sources)
  }

  /**
   * Calculate final confidence score (weighted average)
   */
  private calculateFinalConfidence(responses: AgentResponse[]): number {
    const { consensusScore } = debateEngine.calculateConsensus(responses)
    return Math.round(consensusScore * 100) / 100
  }

  /**
   * Sum total tokens used across all responses
   */
  private sumTokens(responses: AgentResponse[]): number {
    return responses.reduce((sum, r) => sum + r.tokensUsed, 0)
  }

  /**
   * Format the final answer with proper structure
   */
  private formatFinalAnswer(synthesisAnswer: string, responses: AgentResponse[]): string {
    // Check if any critical issues were raised and not resolved
    const unresolvedCritiques = responses.filter(
      r => r.agentId === AgentId.CRITIC && r.stance === 'critique' && r.confidence > 0.7
    )

    let finalText = synthesisAnswer

    // Add caveat if critic raised unresolved high-confidence concerns
    if (unresolvedCritiques.length > 0) {
      const criticConcerns = unresolvedCritiques.map(r => r.reasoning).join(' ')
      finalText += `\n\n⚠️ Note: The Critic agent raised concerns that warrant consideration: ${criticConcerns}`
    }

    return finalText
  }

  /**
   * Quick synthesis without full debate (for simple queries)
   */
  async quickSynthesize(
    sessionId: string,
    query: string,
    round1Responses: AgentResponse[],
    eventEmitter?: EventEmitter
  ): Promise<SynthesizedAnswer> {
    // Skip debate and go straight to synthesis
    return this.synthesize(sessionId, query, round1Responses, eventEmitter)
  }
}

export const synthesizer = SynthesizerService.getInstance()
