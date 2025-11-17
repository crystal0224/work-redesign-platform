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
 * /api/v1/tasks:
 *   get:
 *     summary: Get tasks
 *     description: Get list of tasks for a session or project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: domainId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 */
router.get('/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { sessionId, projectId, domainId } = req.query;

    const where: any = {};

    if (domainId) {
      where.domainId = domainId;
    } else if (projectId) {
      where.projectId = projectId;
    } else if (sessionId) {
      where.project = { sessionId: sessionId as string };
    } else {
      return ResponseUtil.error(res, 'Session ID, project ID, or domain ID is required');
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { position: 'asc' },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        domain: true,
      },
    });

    return ResponseUtil.success(res, tasks);
  })
);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create task
 *     description: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [BACKLOG, IN_PROGRESS, REVIEW, COMPLETED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               projectId:
 *                 type: string
 *               domainId:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post('/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { title, description, status, priority, projectId, domainId, assigneeId, position } = req.body;

    if (!title) {
      return ResponseUtil.error(res, 'Title is required');
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'BACKLOG',
        priority: priority || 'MEDIUM',
        projectId,
        domainId,
        assigneeId,
        position: position ?? 0,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        domain: true,
      },
    });

    logger.info(`Task created: ${task.id} by ${req.user?.email}`);

    return ResponseUtil.created(res, task, 'Task created successfully');
  })
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get task
 *     description: Get a specific task by ID
 *     tags: [Tasks]
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
 *         description: Task retrieved successfully
 */
router.get('/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        domain: true,
        project: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!task) {
      return ResponseUtil.notFound(res, 'Task not found');
    }

    return ResponseUtil.success(res, task);
  })
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update task
 *     description: Update a task
 *     tags: [Tasks]
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
 *               priority:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task updated successfully
 */
router.put('/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { title, description, status, priority, assigneeId, position } = req.body;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(position !== undefined && { position }),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        domain: true,
      },
    });

    logger.info(`Task updated: ${task.id} by ${req.user?.email}`);

    return ResponseUtil.success(res, task, 'Task updated successfully');
  })
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     description: Delete a task
 *     tags: [Tasks]
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
 *         description: Task deleted successfully
 */
router.delete('/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    await prisma.task.delete({
      where: { id: req.params.id },
    });

    logger.info(`Task deleted: ${req.params.id} by ${req.user?.email}`);

    return ResponseUtil.success(res, null, 'Task deleted successfully');
  })
);

export default router;
