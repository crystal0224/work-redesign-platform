import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { DocumentProcessor } from '../services/documentProcessor';

// 업로드 디렉토리 설정
const uploadDir = path.join(process.cwd(), 'uploads');

// Multer storage 설정
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // 업로드 디렉토리 생성 (없으면)
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    // 안전한 파일명 생성
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const ext = path.extname(file.originalname);
    const safeName = `${timestamp}_${randomString}${ext}`;
    cb(null, safeName);
  }
});

// 파일 필터 설정
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // MIME 타입 검증
  if (DocumentProcessor.validateFileType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`지원하지 않는 파일 형식: ${file.mimetype}`));
  }
};

// Multer 설정
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // 최대 10개 파일
  },
  fileFilter: fileFilter
});

// 파일 업로드 에러 핸들러
export const handleUploadError = (
  error: any,
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: '파일 크기는 50MB를 초과할 수 없습니다'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: '최대 10개 파일까지 업로드 가능합니다'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: '예상하지 못한 파일 필드입니다'
      });
    }
  }

  if (error.message.includes('지원하지 않는 파일 형식')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  // 기타 에러
  return res.status(500).json({
    success: false,
    error: '파일 업로드 중 오류가 발생했습니다'
  });
};