/**
 * Council Controller — AI Agent Council API Gateway
 * Handles HTTP endpoints for council queries
 */

import { councilService } from '@/services/council.service'
import { AuthenticatedRequest } from '@/types/express'
import { Response } from 'express'
import crypto from 'crypto'

class CouncilController {
  /**
   * POST /council/query
   * Start a new council query - returns sessionId immediately
   * Client should connect via WebSocket to receive real-time events
   */
  async startQuery(req: AuthenticatedRequest, res: Response) {
    try {
      const { query, context } = req.body
      const userId = req.userId

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Query is required and must be a string'
        })
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        })
      }

      // Generate unique session ID
      const sessionId = crypto.randomUUID()

      // Return sessionId immediately (non-blocking)
      res.status(202).json({
        success: true,
        message: 'Query accepted. Connect via WebSocket to receive events.',
        data: {
          sessionId,
          wsUrl: `/council?sessionId=${sessionId}`,
          instructions: 'Connect to WebSocket and send: { action: "subscribe", sessionId: "..." }'
        }
      })

      // Start processing in background (don't await)
      councilService.processQueryAsync(sessionId, userId, query, context)
        .catch(error => {
          console.error(`[CouncilController] Background processing error for session ${sessionId}:`, error)
        })

    } catch (error: any) {
      console.error('[CouncilController] Error starting query:', error)
      return res.status(500).json({
        success: false,
        message: 'Error starting query',
        error: error.message
      })
    }
  }

  /**
   * POST /council/query/sync
   * Synchronous query - waits for full answer (no streaming)
   * Use this for simple integrations that don't need real-time updates
   */
  async processQuerySync(req: AuthenticatedRequest, res: Response) {
    try {
      const { query, context } = req.body
      const userId = req.userId

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Query is required and must be a string'
        })
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        })
      }

      const sessionId = crypto.randomUUID()

      // Process synchronously (blocking)
      const answer = await councilService.processQuerySync(sessionId, userId, query, context)

      return res.status(200).json({
        success: true,
        message: 'Query processed successfully',
        data: {
          sessionId,
          answer
        }
      })

    } catch (error: any) {
      console.error('[CouncilController] Error processing sync query:', error)
      return res.status(500).json({
        success: false,
        message: 'Error processing query',
        error: error.message
      })
    }
  }

  /**
   * GET /council/session/:sessionId
   * Get session status and results
   */
  async getSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'sessionId is required'
        })
      }

      const session = councilService.getSession(sessionId)

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: {
          sessionId: session.sessionId,
          state: session.state,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          finalAnswer: session.finalAnswer,
          error: session.error
        }
      })

    } catch (error: any) {
      console.error('[CouncilController] Error getting session:', error)
      return res.status(500).json({
        success: false,
        message: 'Error getting session',
        error: error.message
      })
    }
  }

  /**
   * GET /council/stats
   * Get council statistics (for monitoring)
   */
  async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = councilService.getStats()
      return res.status(200).json({
        success: true,
        data: stats
      })
    } catch (error: any) {
      console.error('[CouncilController] Error getting stats:', error)
      return res.status(500).json({
        success: false,
        message: 'Error getting stats',
        error: error.message
      })
    }
  }
}

export const councilController = new CouncilController()
