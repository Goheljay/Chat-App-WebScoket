/**
 * Debate Engine Service — AI Agent Council
 * Assembles debate context and runs debate rounds
 * Max 2 debate rounds per spec
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
import { AGENT_CONFIGS, CONSENSUS_THRESHOLD, DEBATE_AGENTS, MAX_DEBATE_ROUNDS } from './agents.config'
import { agentWorker } from './agentWorker.service'
import { sessionStore } from './sessionStore.service'

export interface DebateResult {
  round: number
  responses: AgentResponse[]
  consensusReached: boolean
  consensusScore: number
  agentsAligned: number
}

class DebateEngineService {
  private static instance: DebateEngineService

  private constructor() {}

  public static getInstance(): DebateEngineService {
    if (!DebateEngineService.instance) {
      DebateEngineService.instance = new DebateEngineService()
    }
    return DebateEngineService.instance
  }

  /**
   * Run a debate round
   * Agents read each other's responses and can affirm, critique, or revise
   */
  async runDebateRound(
    sessionId: string,
    round: number,
    query: string,
    previousResponses: AgentResponse[],
    eventEmitter?: EventEmitter
  ): Promise<DebateResult> {
    console.log(`[DebateEngine] Starting round ${round} for session ${sessionId}`)

    // Build debate context from previous round
    const debateContext: DebateContext = {
      originalQuery: query,
      round1Responses: previousResponses
    }

    // Create tasks for all debate agents
    const tasks: AgentTask[] = DEBATE_AGENTS.map(agentId => ({
      agentId,
      sessionId,
      query,
      round,
      debateContext
    }))

    // Dispatch to all agents in parallel
    const responses = await agentWorker.dispatchParallel(tasks, eventEmitter)

    // Store results
    responses.forEach(response => {
      if (round === 2) {
        sessionStore.storeRound2Result(sessionId, response)
      }
    })

    // Emit debate events
    if (eventEmitter) {
      responses.forEach(response => {
        if (response.stance) {
          eventEmitter({
            type: OrchestratorEventType.AGENT_DEBATE,
            sessionId,
            timestamp: new Date(),
            payload: {
              agentId: response.agentId,
              stance: response.stance,
              critique: response.stance === 'critique' ? response.reasoning : undefined,
              critiqueOf: response.critiqueOf
            }
          })
        }
      })
    }

    // Calculate consensus
    const { consensusReached, consensusScore, agentsAligned } = this.calculateConsensus(responses)

    // Emit confidence event
    if (eventEmitter) {
      eventEmitter({
        type: OrchestratorEventType.COUNCIL_CONFIDENCE,
        sessionId,
        timestamp: new Date(),
        payload: {
          score: consensusScore,
          agentsAligned,
          totalAgents: DEBATE_AGENTS.length
        }
      })
    }

    return {
      round,
      responses,
      consensusReached,
      consensusScore,
      agentsAligned
    }
  }

  /**
   * Run full debate (up to MAX_DEBATE_ROUNDS)
   * Stops early if consensus is reached
   */
  async runFullDebate(
    sessionId: string,
    query: string,
    round1Responses: AgentResponse[],
    eventEmitter?: EventEmitter
  ): Promise<{
    allResponses: AgentResponse[]
    finalConsensusScore: number
    roundsCompleted: number
  }> {
    let currentResponses = round1Responses
    let allResponses = [...round1Responses]
    let roundsCompleted = 1
    let finalConsensusScore = this.calculateConsensus(round1Responses).consensusScore

    // Run debate rounds
    for (let round = 2; round <= MAX_DEBATE_ROUNDS + 1; round++) {
      // Check if we already have consensus
      const { consensusReached, consensusScore } = this.calculateConsensus(currentResponses)
      
      if (consensusReached) {
        console.log(`[DebateEngine] Early consensus reached at round ${round - 1} with score ${consensusScore}`)
        finalConsensusScore = consensusScore
        break
      }

      // Run the debate round
      const result = await this.runDebateRound(
        sessionId,
        round,
        query,
        currentResponses,
        eventEmitter
      )

      currentResponses = result.responses
      allResponses = [...allResponses, ...result.responses]
      roundsCompleted = round
      finalConsensusScore = result.consensusScore

      // Check for consensus after this round
      if (result.consensusReached) {
        console.log(`[DebateEngine] Consensus reached at round ${round}`)
        break
      }
    }

    return {
      allResponses,
      finalConsensusScore,
      roundsCompleted
    }
  }

  /**
   * Calculate consensus among agents
   * Uses confidence-weighted voting with Critic at 1.5x
   */
  calculateConsensus(responses: AgentResponse[]): {
    consensusReached: boolean
    consensusScore: number
    agentsAligned: number
  } {
    if (responses.length === 0) {
      return { consensusReached: false, consensusScore: 0, agentsAligned: 0 }
    }

    // Calculate weighted confidence scores
    let totalWeight = 0
    let weightedConfidenceSum = 0
    let affirmedCount = 0

    responses.forEach(response => {
      const config = AGENT_CONFIGS[response.agentId]
      const weight = config?.weight || 1.0
      totalWeight += weight
      weightedConfidenceSum += response.confidence * weight

      // Count agents that affirm or have high confidence
      if (response.stance === 'affirm' || response.confidence >= 0.7) {
        affirmedCount++
      }
    })

    const consensusScore = weightedConfidenceSum / totalWeight
    const agentsAligned = affirmedCount
    const consensusReached = consensusScore >= CONSENSUS_THRESHOLD

    return { consensusReached, consensusScore, agentsAligned }
  }

  /**
   * Identify which agents had critiques that were accepted
   * Used for synthesis to weight their contributions higher
   */
  identifyAcceptedCritiques(
    round1Responses: AgentResponse[],
    round2Responses: AgentResponse[]
  ): Map<AgentId, AgentId[]> {
    const acceptedCritiques = new Map<AgentId, AgentId[]>()

    // Find critiques in round 2
    round2Responses.forEach(r2Response => {
      if (r2Response.stance === 'revise' && r2Response.critiqueOf) {
        // This agent revised based on critiques
        r2Response.critiqueOf.forEach(criticId => {
          const critiques = acceptedCritiques.get(criticId) || []
          critiques.push(r2Response.agentId)
          acceptedCritiques.set(criticId, critiques)
        })
      }
    })

    return acceptedCritiques
  }

  /**
   * Get the final response from each agent (latest round)
   */
  getFinalResponses(
    round1Responses: AgentResponse[],
    round2Responses: AgentResponse[]
  ): AgentResponse[] {
    const finalMap = new Map<AgentId, AgentResponse>()

    // Start with round 1
    round1Responses.forEach(r => finalMap.set(r.agentId, r))

    // Override with round 2 if available
    round2Responses.forEach(r => finalMap.set(r.agentId, r))

    return Array.from(finalMap.values())
  }

  /**
   * Analyze debate dynamics for synthesis
   */
  analyzeDebate(
    round1Responses: AgentResponse[],
    round2Responses: AgentResponse[]
  ): {
    majorCritiques: string[]
    resolvedIssues: string[]
    unresolvedDisagreements: string[]
  } {
    const majorCritiques: string[] = []
    const resolvedIssues: string[] = []
    const unresolvedDisagreements: string[] = []

    // Find critiques from round 2
    round2Responses.forEach(response => {
      if (response.stance === 'critique') {
        const config = AGENT_CONFIGS[response.agentId]
        majorCritiques.push(`${config.name}: ${response.reasoning}`)
      }
    })

    // Find revisions (resolved issues)
    round2Responses.forEach(response => {
      if (response.stance === 'revise') {
        const config = AGENT_CONFIGS[response.agentId]
        resolvedIssues.push(`${config.name} revised: ${response.reasoning}`)
      }
    })

    // Find persistent disagreements
    const criticAgents = round2Responses.filter(r => r.stance === 'critique')
    criticAgents.forEach(critic => {
      const config = AGENT_CONFIGS[critic.agentId]
      if (critic.confidence < 0.6) {
        unresolvedDisagreements.push(`${config.name} remains unconvinced: ${critic.reasoning}`)
      }
    })

    return { majorCritiques, resolvedIssues, unresolvedDisagreements }
  }
}

export const debateEngine = DebateEngineService.getInstance()
