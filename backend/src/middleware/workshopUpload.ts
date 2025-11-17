import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { Request, Response, NextFunction } from 'express';
import { DocumentProcessor } from '../services/documentProcessor';
import { createModuleLogger } from '../utils/logger';
import { config } from '../config';

const logger = createModuleLogger('WorkshopUpload');

// Ensure upload directory exists
const ensureUploadDir = async (dirPath: string): Promise<void> => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    logger.error('Failed to create upload directory:', error);
    throw error;
  }
};

// Generate safe filename with better Korean support
const generateSafeFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const ext = path.extname(originalName);

  // Better Korean filename handling
  const baseName = path.basename(originalName, ext)
    // Keep Korean characters, English letters, numbers, hyphens, underscores, spaces, parentheses
    .replace(/[^a-zA-Z0-9가-힣\-_\s\(\)]/g, '')
    // Replace spaces with underscores to avoid filesystem issues
    .replace(/\s+/g, '_')
    // Limit length but preserve Korean characters properly
    .substring(0, 50)
    // Remove trailing underscores
    .replace(/_+$/, '');

  // If baseName is empty after cleaning, use a default
  const safeName = baseName || 'file';

  return `${timestamp}_${randomString}_${safeName}${ext}`;
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = config.upload.uploadPath || path.join(process.cwd(), 'uploads', 'workshops');

    try {
      await ensureUploadDir(uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    try {
      const safeFilename = generateSafeFilename(file.originalname);
      logger.info(`📁 File upload: ${file.originalname} → ${safeFilename}`);
      cb(null, safeFilename);
    } catch (error) {
      cb(error as Error, '');
    }
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  logger.debug(`🔍 Validating file: ${file.originalname}, MIME: ${file.mimetype}`);

  // Check MIME type
  if (!DocumentProcessor.validateFileType(file.mimetype)) {
    const error = new Error(`지원하지 않는 파일 형식입니다: ${file.mimetype}`);
    logger.warn(`❌ File rejected: ${file.originalname} - ${error.message}`);
    cb(error);
    return;
  }

  // Check file extension
  if (!DocumentProcessor.isValidFileExtension(file.originalname)) {
    const error = new Error(`지원하지 않는 파일 확장자입니다: ${path.extname(file.originalname)}`);
    logger.warn(`❌ File rejected: ${file.originalname} - ${error.message}`);
    cb(error);
    return;
  }

  logger.info(`✅ File accepted: ${file.originalname}`);
  cb(null, true);
};

// Create multer instance for workshop uploads
export const workshopUpload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize || 50 * 1024 * 1024, // 50MB default
    files: config.upload.maxFiles || 10, // 10 files default
    fieldSize: 1024 * 1024, // 1MB field size
    fieldNameSize: 100, // 100 bytes field name size
    headerPairs: 2000 // Max header pairs
  },
  fileFilter: fileFilter
});

// Middleware to handle upload errors
export const handleUploadError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof multer.MulterError) {
    logger.error('Multer upload error:', error);

    let message = '파일 업로드 중 오류가 발생했습니다';
    let statusCode = 400;

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `파일 크기가 너무 큽니다. 최대 ${Math.round((config.upload.maxFileSize || 50 * 1024 * 1024) / (1024 * 1024))}MB까지 업로드 가능합니다`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = `파일 개수가 너무 많습니다. 최대 ${config.upload.maxFiles || 10}개까지 업로드 가능합니다`;
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = '예상하지 못한 파일 필드입니다';
        break;
      case 'LIMIT_PART_COUNT':
        message = '요청의 부분이 너무 많습니다';
        break;
      case 'LIMIT_FIELD_KEY':
        message = '필드명이 너무 깁니다';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = '필드 값이 너무 깁니다';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = '필드가 너무 많습니다';
        break;
      default:
        message = `업로드 오류: ${error.message}`;
        break;
    }

    res.status(statusCode).json({
      success: false,
      error: message,
      code: error.code
    });
    return;
  }

  if (error) {
    logger.error('Upload error:', error);
    res.status(400).json({
      success: false,
      error: error.message || '파일 업로드 중 오류가 발생했습니다'
    });
    return;
  }

  next();
};

// Middleware to validate uploaded files post-upload
export const validateUploadedFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: '업로드된 파일이 없습니다'
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    logger.info(`📋 Validating ${files.length} uploaded files`);

    // Additional validation for each file
    for (const file of files) {
      // Check if file actually exists
      try {
        await fs.access(file.path);
      } catch (error) {
        logger.error(`File not found after upload: ${file.path}`);
        res.status(500).json({
          success: false,
          error: '업로드된 파일을 찾을 수 없습니다'
        });
        return;
      }

      // Check if file is not empty
      const stats = await fs.stat(file.path);
      if (stats.size === 0) {
        logger.warn(`Empty file uploaded: ${file.originalname}`);
        res.status(400).json({
          success: false,
          error: `빈 파일은 업로드할 수 없습니다: ${file.originalname}`
        });
        return;
      }

      logger.debug(`✅ File validated: ${file.originalname} (${stats.size} bytes)`);
    }

    logger.info(`✅ All ${files.length} files validated successfully`);
    next();
  } catch (error) {
    logger.error('File validation error:', error);
    res.status(500).json({
      success: false,
      error: '파일 검증 중 오류가 발생했습니다'
    });
  }
};

// Helper function to clean up uploaded files in case of error
export const cleanupUploadedFiles = async (files: Express.Multer.File[]): Promise<void> => {
  if (!files || !Array.isArray(files)) return;

  for (const file of files) {
    try {
      await fs.unlink(file.path);
      logger.info(`🗑️ Cleaned up file: ${file.path}`);
    } catch (error) {
      logger.warn(`Failed to cleanup file ${file.path}:`, error);
    }
  }
};

// Middleware to log upload metrics
export const logUploadMetrics = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.files && Array.isArray(req.files)) {
    const files = req.files as Express.Multer.File[];
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const fileTypes = files.map(file => path.extname(file.originalname).toLowerCase());

    logger.info(`📊 Upload metrics: ${files.length} files, ${Math.round(totalSize / 1024)}KB total, types: ${fileTypes.join(', ')}`);
  }

  next();
};