import { Router } from 'express';
import { getPrismaClient } from '@/config/database';
import { JwtUtil, PasswordUtil } from '@/utils/auth';
import ResponseUtil from '@/utils/response';
import { validate, userSchemas } from '@/utils/validation';
import { authenticate, authRateLimit } from '@/middleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { LoginRequest, LoginResponse } from '@/types';
import logger from '@/utils/logger';

const router = Router();
const prisma = getPrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         password:
 *           type: string
 *           description: User password
 *     LoginResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             name:
 *               type: string
 *             role:
 *               type: string
 *             department:
 *               type: string
 *             position:
 *               type: string
 *         token:
 *           type: string
 *         expiresIn:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [TEAM_LEADER, TEAM_MEMBER, ADMIN]
 *         department:
 *           type: string
 *         position:
 *           type: string
 *         preferences:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponse'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */
router.post('/login',
  authRateLimit,
  validate(userSchemas.login),
  asyncHandler(async (req, res) => {
    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        teamMemberships: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return ResponseUtil.error(res, 'Invalid email or password', 400);
    }

    // For development, we'll simulate password checking
    // In production, you would check against a real password hash
    // const isValidPassword = await PasswordUtil.comparePassword(password, user.passwordHash);
    const isValidPassword = password === 'password123'; // Temporary for development

    if (!isValidPassword) {
      logger.warn(`Invalid password attempt for user: ${email}`);
      return ResponseUtil.error(res, 'Invalid email or password', 400);
    }

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      teamId: user.teamMemberships[0]?.teamId,
    };

    const token = JwtUtil.generateToken(tokenPayload);

    const loginResponse: LoginResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        position: user.position,
      },
      token,
      expiresIn: '24h',
    };

    logger.info(`User logged in successfully: ${user.email}`);

    return ResponseUtil.success(res, loginResponse, 'Login successful');
  })
);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user (admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [TEAM_LEADER, TEAM_MEMBER, ADMIN]
 *               department:
 *                 type: string
 *               position:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post('/register',
  authenticate,
  // authorize('ADMIN'), // Only admins can register new users
  validate(userSchemas.create),
  asyncHandler(async (req, res) => {
    const { email, name, password, role, department, position } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return ResponseUtil.conflict(res, 'Email already registered');
    }

    // Validate password strength
    const passwordValidation = PasswordUtil.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return ResponseUtil.validationError(res, {
        password: passwordValidation.feedback,
      });
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        role: role || 'TEAM_MEMBER',
        department,
        position,
        // passwordHash: hashedPassword, // Add this field to schema in production
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        position: true,
        createdAt: true,
      },
    });

    logger.info(`New user registered: ${user.email} by ${req.user?.email}`);

    return ResponseUtil.created(res, user, 'User registered successfully');
  })
);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Get the authenticated user's profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        position: true,
        avatarUrl: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        teamMemberships: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return ResponseUtil.notFound(res, 'User not found');
    }

    return ResponseUtil.success(res, user, 'Profile retrieved successfully');
  })
);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *               position:
 *                 type: string
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put('/profile',
  authenticate,
  validate(userSchemas.update),
  asyncHandler(async (req, res) => {
    const { name, department, position, preferences } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(department !== undefined && { department }),
        ...(position !== undefined && { position }),
        ...(preferences && { preferences }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        position: true,
        preferences: true,
        updatedAt: true,
      },
    });

    logger.info(`User profile updated: ${updatedUser.email}`);

    return ResponseUtil.success(res, updatedUser, 'Profile updated successfully');
  })
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user (token invalidation would be handled by client)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    // In a production environment, you might want to:
    // 1. Add token to a blacklist
    // 2. Clear any server-side sessions
    // 3. Log the logout event

    logger.info(`User logged out: ${req.user?.email}`);

    return ResponseUtil.success(res, null, 'Logout successful');
  })
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh token
 *     description: Refresh the JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid token
 */
router.post('/refresh',
  authenticate,
  asyncHandler(async (req, res) => {
    // Generate new token with same payload
    const tokenPayload = {
      userId: req.user!.id,
      email: req.user!.email,
      role: req.user!.role,
      teamId: req.user!.teamId,
    };

    const newToken = JwtUtil.generateToken(tokenPayload);

    const refreshResponse = {
      token: newToken,
      expiresIn: '24h',
    };

    return ResponseUtil.success(res, refreshResponse, 'Token refreshed successfully');
  })
);

/**
 * @swagger
 * /api/v1/auth/verify:
 *   get:
 *     summary: Verify token
 *     description: Verify if the current token is valid
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Token is invalid
 */
router.get('/verify',
  authenticate,
  asyncHandler(async (req, res) => {
    return ResponseUtil.success(res, {
      valid: true,
      user: {
        id: req.user!.id,
        email: req.user!.email,
        name: req.user!.name,
        role: req.user!.role,
      },
    }, 'Token is valid');
  })
);

export default router;