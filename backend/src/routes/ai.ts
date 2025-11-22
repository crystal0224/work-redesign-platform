import { Router } from 'express';
import { getPrismaClient } from '@/config/database';
import ResponseUtil from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, requireSessionAccess } from '@/middleware';
import { aiRateLimiter, createUserAIRateLimiter, aiCostTracker } from '@/middleware/aiRateLimit';
import logger from '@/utils/logger';

const router = Router();
const prisma = getPrismaClient();

// Apply AI-specific rate limiting and cost tracking to all AI routes
router.use(aiRateLimiter);
router.use(createUserAIRateLimiter());
router.use(aiCostTracker);

/**
 * @swagger
 * /api/v1/ai/analyze:
 *   post:
 *     summary: Start AI analysis
 *     description: Start AI analysis for uploaded files
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - fileIds
 *             properties:
 *               sessionId:
 *                 type: string
 *               fileIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Analysis started successfully
 */
router.post('/analyze',
  authenticate,
  asyncHandler(async (req, res) => {
    const { sessionId, fileIds } = req.body;

    if (!sessionId || !fileIds || !Array.isArray(fileIds)) {
      return ResponseUtil.error(res, 'Session ID and file IDs are required');
    }

    // Create AI analysis record
    const analysis = await prisma.aiAnalysis.create({
      data: {
        sessionId,
        status: 'PENDING',
        startedAt: new Date(),
        metadata: {
          fileIds,
          userId: req.user?.id,
        },
      },
    });

    logger.info(`AI analysis started: ${analysis.id} for session ${sessionId} by ${req.user?.email}`);

    // In production, this would trigger actual AI analysis
    // For now, return the analysis record
    return ResponseUtil.success(res, analysis, 'AI analysis started');
  })
);

/**
 * @swagger
 * /api/v1/ai/analysis/{id}:
 *   get:
 *     summary: Get AI analysis result
 *     description: Get the result of an AI analysis
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analysis result retrieved successfully
 */
router.get('/analysis/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const analysis = await prisma.aiAnalysis.findUnique({
      where: { id: req.params.id },
    });

    if (!analysis) {
      return ResponseUtil.notFound(res, 'Analysis not found');
    }

    return ResponseUtil.success(res, analysis);
  })
);

/**
 * @swagger
 * /api/v1/ai/analyses:
 *   get:
 *     summary: Get AI analyses
 *     description: Get list of AI analyses for a session
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analyses retrieved successfully
 */
router.get('/analyses',
  authenticate,
  asyncHandler(async (req, res) => {
    const { sessionId } = req.query;

    if (!sessionId) {
      return ResponseUtil.error(res, 'Session ID is required');
    }

    const analyses = await prisma.aiAnalysis.findMany({
      where: { sessionId: sessionId as string },
      orderBy: { createdAt: 'desc' },
    });

    return ResponseUtil.success(res, analyses);
  })
);

export default router;
