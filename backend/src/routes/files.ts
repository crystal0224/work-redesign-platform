import { Router } from 'express';
import { getPrismaClient } from '@/config/database';
import ResponseUtil from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, requireSessionAccess } from '@/middleware';
import { fileUploadRateLimiter } from '@/middleware/aiRateLimit';
import logger from '@/utils/logger';

const router = Router();
const prisma = getPrismaClient();

/**
 * @swagger
 * /api/v1/files:
 *   get:
 *     summary: Get uploaded files
 *     description: Get list of uploaded files for a session
 *     tags: [Files]
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
 *         description: Files retrieved successfully
 */
router.get('/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { sessionId } = req.query;

    if (!sessionId) {
      return ResponseUtil.error(res, 'Session ID is required');
    }

    const files = await prisma.fileUpload.findMany({
      where: { sessionId: sessionId as string },
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return ResponseUtil.success(res, files);
  })
);

/**
 * @swagger
 * /api/v1/files/upload:
 *   post:
 *     summary: Upload file
 *     description: Upload a file for a session
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - file
 *             properties:
 *               sessionId:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */
router.post('/upload',
  fileUploadRateLimiter,
  authenticate,
  asyncHandler(async (req, res) => {
    // File upload handling would be done via multer middleware
    // This is a placeholder for the route structure

    const { sessionId } = req.body;

    if (!sessionId) {
      return ResponseUtil.error(res, 'Session ID is required');
    }

    // In production, file would be uploaded to S3 or similar
    // For now, return success response
    logger.info(`File upload initiated for session: ${sessionId} by ${req.user?.email}`);

    return ResponseUtil.created(res, { message: 'File upload endpoint ready' }, 'File upload endpoint configured');
  })
);

/**
 * @swagger
 * /api/v1/files/{id}:
 *   delete:
 *     summary: Delete file
 *     description: Delete an uploaded file
 *     tags: [Files]
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
 *         description: File deleted successfully
 */
router.delete('/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const file = await prisma.fileUpload.findUnique({
      where: { id: req.params.id },
    });

    if (!file) {
      return ResponseUtil.notFound(res, 'File not found');
    }

    await prisma.fileUpload.delete({
      where: { id: req.params.id },
    });

    logger.info(`File deleted: ${req.params.id} by ${req.user?.email}`);

    return ResponseUtil.success(res, null, 'File deleted successfully');
  })
);

export default router;
