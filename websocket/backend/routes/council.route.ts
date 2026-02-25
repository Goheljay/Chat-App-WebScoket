/**
 * Council Routes — AI Agent Council API Gateway
 * 
 * Endpoints:
 * POST /council/query       - Start async query (returns sessionId, stream via WebSocket)
 * POST /council/query/sync  - Sync query (blocking, returns full answer)
 * GET  /council/session/:id - Get session status/result
 * GET  /council/stats       - Get monitoring stats
 */

import { Router } from 'express'
import { councilController } from '@/controller/council.controller'

const router = Router()

// Start a new council query (async - use WebSocket for events)
router.post('/query', councilController.startQuery)

// Synchronous query (blocking - waits for full answer)
router.post('/query/sync', councilController.processQuerySync)

// Get session status and results
router.get('/session/:sessionId', councilController.getSession)

// Get council statistics (monitoring)
router.get('/stats', councilController.getStats)

export default router
