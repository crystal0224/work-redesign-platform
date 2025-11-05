import { Router } from 'express';
import { getPrismaClient } from '@/config/database';
import ResponseUtil from '@/utils/response';
import { validate, validateQuery, sessionSchemas, commonSchemas } from '@/utils/validation';
import { authenticate, requireSessionAccess } from '@/middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { CreateSessionRequest, SessionProgress } from '@/types';
import logger from '@/utils/logger';

const router = Router();
const prisma = getPrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     WorkshopSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PLANNING, IN_PROGRESS, COMPLETED, CANCELLED]
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         duration:
 *           type: integer
 *           description: Duration in minutes
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         startedAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *     CreateSessionRequest:
 *       type: object
 *       required:
 *         - title
 *         - domains
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *           maxLength: 1000
 *         domains:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           maxItems: 10
 */

/**
 * @swagger
 * /api/v1/sessions:
 *   get:
 *     summary: Get workshop sessions
 *     description: Get list of workshop sessions for the authenticated user
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PLANNING, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WorkshopSession'
 *                     pagination:
 *                       type: object
 */
router.get('/',
  authenticate,
  validateQuery(commonSchemas.pagination.extend({
    status: sessionSchemas.update.shape.status.optional(),
  })),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query as any;
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        { createdBy: req.user!.id },
        {
          participants: {
            some: { id: req.user!.id }
          }
        }
      ]
    };

    if (status) {
      where.status = status;
    }

    // Get sessions with count
    const [sessions, total] = await Promise.all([
      prisma.workshopSession.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          domains: {
            orderBy: { position: 'asc' },
          },
          _count: {
            select: {
              domains: true,
              fileUploads: true,
              projects: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.workshopSession.count({ where }),
    ]);

    return ResponseUtil.paginated(res, sessions, page, limit, total);
  })
);

/**
 * @swagger
 * /api/v1/sessions:
 *   post:
 *     summary: Create workshop session
 *     description: Create a new workshop session with domains
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionRequest'
 *     responses:
 *       201:
 *         description: Session created successfully
 *       400:
 *         description: Validation error
 */
router.post('/',
  authenticate,
  validate(sessionSchemas.create),
  asyncHandler(async (req, res) => {
    const { title, description, domains }: CreateSessionRequest = req.body;

    // Create session with domains in a transaction
    const session = await prisma.$transaction(async (tx) => {
      // Create the session
      const newSession = await tx.workshopSession.create({
        data: {
          title,
          description,
          createdBy: req.user!.id,
          participants: {
            connect: { id: req.user!.id }, // Creator is automatically a participant
          },
        },
      });

      // Create domains
      const domainData = domains.map((domain, index) => ({
        sessionId: newSession.id,
        name: domain,
        position: index,
      }));

      await tx.domain.createMany({
        data: domainData,
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          sessionId: newSession.id,
          userId: req.user!.id,
          action: 'SESSION_CREATED',
          entityType: 'session',
          entityId: newSession.id,
          metadata: {
            sessionTitle: title,
            domainsCount: domains.length,
          },
        },
      });

      return newSession;
    });

    // Fetch the complete session with relations
    const completeSession = await prisma.workshopSession.findUnique({
      where: { id: session.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        domains: {
          orderBy: { position: 'asc' },
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Workshop session created: ${session.id} by ${req.user!.email}`);

    return ResponseUtil.created(res, completeSession, 'Session created successfully');
  })
);

/**
 * @swagger
 * /api/v1/sessions/{id}:
 *   get:
 *     summary: Get workshop session
 *     description: Get a specific workshop session by ID
 *     tags: [Sessions]
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
 *         description: Session retrieved successfully
 *       404:
 *         description: Session not found
 *       403:
 *         description: Access denied
 */
router.get('/:id',
  authenticate,
  requireSessionAccess,
  asyncHandler(async (req, res) => {
    const session = await prisma.workshopSession.findUnique({
      where: { id: req.params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        domains: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        fileUploads: {
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
        },
        _count: {
          select: {
            domains: true,
            fileUploads: true,
            projects: true,
            aiAnalyses: true,
          },
        },
      },
    });

    if (!session) {
      return ResponseUtil.notFound(res, 'Session not found');
    }

    return ResponseUtil.success(res, session);
  })
);

/**
 * @swagger
 * /api/v1/sessions/{id}:
 *   put:
 *     summary: Update workshop session
 *     description: Update a workshop session
 *     tags: [Sessions]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PLANNING, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Session updated successfully
 *       404:
 *         description: Session not found
 *       403:
 *         description: Access denied
 */
router.put('/:id',
  authenticate,
  requireSessionAccess,
  validate(sessionSchemas.update),
  asyncHandler(async (req, res) => {
    const { title, description, status } = req.body;

    // Check if user is the creator or admin
    const existingSession = await prisma.workshopSession.findUnique({
      where: { id: req.params.id },
      select: { createdBy: true, status: true },
    });

    if (!existingSession) {
      return ResponseUtil.notFound(res, 'Session not found');
    }

    if (existingSession.createdBy !== req.user!.id && req.user!.role !== 'ADMIN') {
      return ResponseUtil.forbidden(res, 'Only session creator or admin can update session');
    }

    // Prepare update data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) {
      updateData.status = status;

      // Set timestamps based on status
      if (status === 'IN_PROGRESS' && existingSession.status !== 'IN_PROGRESS') {
        updateData.startedAt = new Date();
      } else if (status === 'COMPLETED' && existingSession.status !== 'COMPLETED') {
        updateData.completedAt = new Date();
        updateData.progress = 100;
      }
    }

    const updatedSession = await prisma.workshopSession.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        domains: {
          orderBy: { position: 'asc' },
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Session ${req.params.id} updated by ${req.user!.email}`);

    return ResponseUtil.success(res, updatedSession, 'Session updated successfully');
  })
);

/**
 * @swagger
 * /api/v1/sessions/{id}/participants:
 *   post:
 *     summary: Add participant to session
 *     description: Add a user as participant to the workshop session
 *     tags: [Sessions]
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
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Participant added successfully
 *       404:
 *         description: Session or user not found
 *       403:
 *         description: Access denied
 */
router.post('/:id/participants',
  authenticate,
  requireSessionAccess,
  asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      return ResponseUtil.error(res, 'User ID is required');
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return ResponseUtil.notFound(res, 'User not found');
    }

    // Add participant
    const updatedSession = await prisma.workshopSession.update({
      where: { id: req.params.id },
      data: {
        participants: {
          connect: { id: userId },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info(`User ${userId} added as participant to session ${req.params.id}`);

    return ResponseUtil.success(res, updatedSession.participants, 'Participant added successfully');
  })
);

/**
 * @swagger
 * /api/v1/sessions/{id}/progress:
 *   get:
 *     summary: Get session progress
 *     description: Get the current progress of the workshop session
 *     tags: [Sessions]
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
 *         description: Progress retrieved successfully
 */
router.get('/:id/progress',
  authenticate,
  requireSessionAccess,
  asyncHandler(async (req, res) => {
    const session = await prisma.workshopSession.findUnique({
      where: { id: req.params.id },
      include: {
        domains: true,
        fileUploads: true,
        projects: {
          include: {
            tasks: true,
          },
        },
        aiAnalyses: true,
      },
    });

    if (!session) {
      return ResponseUtil.notFound(res, 'Session not found');
    }

    // Calculate progress based on completion steps
    const steps = [
      { name: 'Domains defined', completed: session.domains.length > 0 },
      { name: 'Files uploaded', completed: session.fileUploads.length > 0 },
      { name: 'Tasks created', completed: session.projects.some(p => p.tasks.length > 0) },
      { name: 'AI analysis completed', completed: session.aiAnalyses.length > 0 },
    ];

    const completedSteps = steps.filter(step => step.completed).length;
    const totalSteps = steps.length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    // Estimate time remaining (rough calculation)
    const avgTimePerStep = 8; // 8 minutes per step (35 minutes / ~4.5 steps)
    const remainingSteps = totalSteps - completedSteps;
    const estimatedTimeRemaining = remainingSteps * avgTimePerStep;

    const progress: SessionProgress = {
      sessionId: session.id,
      currentStep: completedSteps + 1,
      totalSteps,
      progress: progressPercentage,
      estimatedTimeRemaining,
    };

    return ResponseUtil.success(res, {
      progress,
      steps,
      session: {
        id: session.id,
        title: session.title,
        status: session.status,
        startedAt: session.startedAt,
        duration: session.duration,
      },
    });
  })
);

export default router;