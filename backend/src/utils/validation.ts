import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@/types';

// Common validation schemas
export const commonSchemas = {
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
  }),
};

// User validation schemas
export const userSchemas = {
  create: z.object({
    email: commonSchemas.email,
    name: commonSchemas.name,
    password: z.string().min(8).max(128),
    role: z.enum(['TEAM_LEADER', 'TEAM_MEMBER', 'ADMIN']).default('TEAM_MEMBER'),
    department: z.string().max(100).optional(),
    position: z.string().max(100).optional(),
  }),

  update: z.object({
    name: commonSchemas.name.optional(),
    department: z.string().max(100).optional(),
    position: z.string().max(100).optional(),
    preferences: z.record(z.any()).optional(),
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1),
  }),
};

// Session validation schemas
export const sessionSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    description: commonSchemas.description,
    domains: z.array(z.string().min(1).max(100)).min(1).max(10),
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: commonSchemas.description,
    status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  }),
};

// Task validation schemas
export const taskSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    description: commonSchemas.description,
    projectId: commonSchemas.id.optional(),
    domainId: commonSchemas.id.optional(),
    assigneeId: commonSchemas.id.optional(),
    priority: commonSchemas.priority.default('MEDIUM'),
    estimatedHours: z.number().int().min(1).max(1000).optional(),
    dueDate: z.string().datetime().optional(),
    labels: z.array(z.string()).default([]),
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: commonSchemas.description,
    assigneeId: commonSchemas.id.optional(),
    status: commonSchemas.status.optional(),
    priority: commonSchemas.priority.optional(),
    estimatedHours: z.number().int().min(1).max(1000).optional(),
    actualHours: z.number().int().min(0).max(1000).optional(),
    dueDate: z.string().datetime().optional(),
    labels: z.array(z.string()).optional(),
  }),

  move: z.object({
    taskId: commonSchemas.id,
    toColumnId: z.string().min(1),
    position: z.number().int().min(0),
  }),
};

// Project validation schemas
export const projectSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    description: commonSchemas.description,
    teamId: commonSchemas.id.optional(),
    sessionId: commonSchemas.id.optional(),
    priority: commonSchemas.priority.default('MEDIUM'),
    startDate: z.string().datetime().optional(),
    dueDate: z.string().datetime().optional(),
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: commonSchemas.description,
    status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
    priority: commonSchemas.priority.optional(),
    startDate: z.string().datetime().optional(),
    dueDate: z.string().datetime().optional(),
    progress: z.number().int().min(0).max(100).optional(),
  }),
};

// AI Analysis validation schemas
export const aiSchemas = {
  analyze: z.object({
    type: z.enum(['WORKFLOW_OPTIMIZATION', 'RISK_ASSESSMENT', 'RESOURCE_ALLOCATION', 'TIMELINE_PREDICTION', 'TASK_ANALYSIS']),
    projectId: commonSchemas.id.optional(),
    sessionId: commonSchemas.id.optional(),
    inputData: z.record(z.any()),
  }),

  chat: z.object({
    message: z.string().min(1).max(2000),
    sessionId: commonSchemas.id.optional(),
    context: z.record(z.any()).optional(),
  }),
};

// File upload validation schemas
export const fileSchemas = {
  upload: z.object({
    sessionId: commonSchemas.id.optional(),
    taskId: commonSchemas.id.optional(),
  }),
};

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };
};

// Query parameter validation middleware
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input,
        }));

        res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: validationErrors,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };
};

// Parameter validation middleware
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input,
        }));

        res.status(400).json({
          success: false,
          error: 'Parameter validation failed',
          details: validationErrors,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(error);
      }
    }
  };
};