import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '@/utils/auth';
import { getPrismaClient } from '@/config/database';
import ResponseUtil from '@/utils/response';
import logger from '@/utils/logger';
import { AuthTokenPayload } from '@/types';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload & {
        id: string;
        email: string;
        name: string;
        role: string;
        teamId?: string;
      };
    }
  }
}

/**
 * Authentication middleware
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseUtil.unauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = JwtUtil.verifyToken(token);

    // Get user from database to ensure they still exist and are active
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        teamMemberships: {
          select: {
            teamId: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      ResponseUtil.unauthorized(res, 'User not found');
      return;
    }

    // Attach user to request
    req.user = {
      ...payload,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.teamMemberships[0]?.teamId,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    ResponseUtil.unauthorized(res, 'Invalid token');
  }
};

/**
 * Authorization middleware factory
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    if (!roles.includes(req.user.role)) {
      ResponseUtil.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

/**
 * Team access middleware
 */
export const requireTeamAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    const teamId = req.params.teamId || req.body.teamId || req.query.teamId;

    if (!teamId) {
      ResponseUtil.error(res, 'Team ID required');
      return;
    }

    const prisma = getPrismaClient();
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: teamId as string,
          userId: req.user.id,
        },
      },
    });

    if (!teamMember && req.user.role !== 'ADMIN') {
      ResponseUtil.forbidden(res, 'Access denied to this team');
      return;
    }

    next();
  } catch (error) {
    logger.error('Team access check error:', error);
    ResponseUtil.internalError(res);
  }
};

/**
 * Project access middleware
 */
export const requireProjectAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    const projectId = req.params.projectId || req.body.projectId || req.query.projectId;

    if (!projectId) {
      ResponseUtil.error(res, 'Project ID required');
      return;
    }

    const prisma = getPrismaClient();
    const project = await prisma.project.findUnique({
      where: { id: projectId as string },
      include: {
        team: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!project) {
      ResponseUtil.notFound(res, 'Project not found');
      return;
    }

    // Check if user is admin, project creator, or team member
    const hasAccess =
      req.user.role === 'ADMIN' ||
      project.createdBy === req.user.id ||
      (project.team &&
       project.team.members.some(member => member.userId === req.user.id));

    if (!hasAccess) {
      ResponseUtil.forbidden(res, 'Access denied to this project');
      return;
    }

    next();
  } catch (error) {
    logger.error('Project access check error:', error);
    ResponseUtil.internalError(res);
  }
};

/**
 * Session access middleware
 */
export const requireSessionAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    const sessionId = req.params.sessionId || req.body.sessionId || req.query.sessionId;

    if (!sessionId) {
      ResponseUtil.error(res, 'Session ID required');
      return;
    }

    const prisma = getPrismaClient();
    const session = await prisma.workshopSession.findUnique({
      where: { id: sessionId as string },
      include: {
        participants: {
          select: { id: true },
        },
      },
    });

    if (!session) {
      ResponseUtil.notFound(res, 'Session not found');
      return;
    }

    // Check if user is admin, session creator, or participant
    const hasAccess =
      req.user.role === 'ADMIN' ||
      session.createdBy === req.user.id ||
      session.participants.some(participant => participant.id === req.user.id);

    if (!hasAccess) {
      ResponseUtil.forbidden(res, 'Access denied to this session');
      return;
    }

    next();
  } catch (error) {
    logger.error('Session access check error:', error);
    ResponseUtil.internalError(res);
  }
};

/**
 * Optional authentication middleware (for public endpoints that can benefit from user context)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const payload = JwtUtil.verifyToken(token);
        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        });

        if (user) {
          req.user = {
            ...payload,
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }
      } catch (error) {
        // Token is invalid, but we continue without user context
        logger.debug('Optional auth token invalid:', error);
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    next(); // Continue even if there's an error
  }
};

// Export authenticate as authMiddleware for backwards compatibility
export const authMiddleware = authenticate;
export default authenticate;