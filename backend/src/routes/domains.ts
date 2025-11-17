import { Router } from 'express';
import { getPrismaClient } from '@/config/database';
import ResponseUtil from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate, requireSessionAccess } from '@/middleware';
import logger from '@/utils/logger';

const router = Router();
const prisma = getPrismaClient();

/**
 * @swagger
 * /api/v1/domains:
 *   get:
 *     summary: Get domains
 *     description: Get list of domains for a session
 *     tags: [Domains]
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
 *         description: Domains retrieved successfully
 */
router.get('/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { sessionId } = req.query;

    if (!sessionId) {
      return ResponseUtil.error(res, 'Session ID is required');
    }

    const domains = await prisma.domain.findMany({
      where: { sessionId: sessionId as string },
      orderBy: { position: 'asc' },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
        },
      },
    });

    return ResponseUtil.success(res, domains);
  })
);

/**
 * @swagger
 * /api/v1/domains:
 *   post:
 *     summary: Create domain
 *     description: Create a new domain for a session
 *     tags: [Domains]
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
 *               - name
 *             properties:
 *               sessionId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Domain created successfully
 */
router.post('/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { sessionId, name, description, position } = req.body;

    if (!sessionId || !name) {
      return ResponseUtil.error(res, 'Session ID and name are required');
    }

    const domain = await prisma.domain.create({
      data: {
        sessionId,
        name,
        description,
        position: position ?? 0,
      },
    });

    logger.info(`Domain created: ${domain.id} by ${req.user?.email}`);

    return ResponseUtil.created(res, domain, 'Domain created successfully');
  })
);

/**
 * @swagger
 * /api/v1/domains/{id}:
 *   put:
 *     summary: Update domain
 *     description: Update a domain
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Domain updated successfully
 */
router.put('/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { name, description, position } = req.body;

    const domain = await prisma.domain.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(position !== undefined && { position }),
      },
    });

    logger.info(`Domain updated: ${domain.id} by ${req.user?.email}`);

    return ResponseUtil.success(res, domain, 'Domain updated successfully');
  })
);

/**
 * @swagger
 * /api/v1/domains/{id}:
 *   delete:
 *     summary: Delete domain
 *     description: Delete a domain
 *     tags: [Domains]
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
 *         description: Domain deleted successfully
 */
router.delete('/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    await prisma.domain.delete({
      where: { id: req.params.id },
    });

    logger.info(`Domain deleted: ${req.params.id} by ${req.user?.email}`);

    return ResponseUtil.success(res, null, 'Domain deleted successfully');
  })
);

export default router;
