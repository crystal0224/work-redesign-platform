import { Router, Request, Response } from 'express';
import { getPrismaClient } from '@/config/database';
import ResponseUtil from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, requireSessionAccess } from '@/middleware';
import { fileUploadRateLimiter } from '@/middleware/aiRateLimit';
import logger from '@/utils/logger';
import { 
  workshopUpload, 
  handleUploadError, 
  validateUploadedFiles, 
  logUploadMetrics, 
  cleanupUploadedFiles 
} from '../middleware/workshopUpload';

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

router.post(
  '/upload',
  authenticate,
  workshopUpload.array('files'),
  handleUploadError,
  validateUploadedFiles,
  logUploadMetrics,
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { workshopId } = req.body;
      const user = (req as any).user;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: '업로드된 파일이 없습니다'
        });
      }

      logger.info(`📥 Processing ${files.length} uploaded files for workshop ${workshopId}`);

      const fileIds: string[] = [];

      // Save file metadata to database
      for (const file of files) {
        const fileUpload = await prisma.fileUpload.create({
          data: {
            filename: file.filename, // This should be mapped to fileName in schema? No, schema has fileName
            fileName: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            s3Url: `file://${file.path}`, // Store local path in s3Url
            sessionId: workshopId || null,
            uploadedBy: user ? user.id : 'demo-user', // Fallback for demo
          }
        });
        fileIds.push(fileUpload.id);
        logger.info(`💾 Saved file metadata: ${fileUpload.id}`);
      }

      res.status(200).json({
        success: true,
        message: `${files.length}개 파일 업로드 성공`,
        fileIds: fileIds
      });

    } catch (error) {
      logger.error('File upload processing error:', error);
      
      // Cleanup files if DB save fails
      if (req.files) {
        await cleanupUploadedFiles(req.files as Express.Multer.File[]);
      }

      res.status(500).json({
        success: false,
        error: '파일 처리 중 오류가 발생했습니다'
      });
    }
  }
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
