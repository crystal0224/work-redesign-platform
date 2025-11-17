import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

const router = Router();

// GET /download/:filename - 파일 다운로드
router.get('/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;

  // 파일명 검증 (보안)
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({
      success: false,
      error: '잘못된 파일명입니다'
    });
  }

  const filepath = path.join(process.cwd(), 'generated_templates', filename);

  // 파일 존재 확인
  if (!fs.existsSync(filepath)) {
    logger.warn(`Download attempt for non-existent file: ${filename}`);
    return res.status(404).json({
      success: false,
      error: '파일을 찾을 수 없습니다'
    });
  }

  // 파일 정보 조회
  const stat = fs.statSync(filepath);

  // 파일 다운로드 헤더 설정
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Length', stat.size);

  // 파일 스트림 전송
  const fileStream = fs.createReadStream(filepath);

  fileStream.on('error', (error) => {
    logger.error('File stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: '파일 다운로드 중 오류가 발생했습니다'
      });
    }
  });

  fileStream.on('end', () => {
    logger.info(`✅ File downloaded: ${filename} (${stat.size} bytes)`);
  });

  fileStream.pipe(res);
});

// GET /download - 다운로드 가능한 파일 목록 조회
router.get('/', (req: Request, res: Response) => {
  try {
    const templatesDir = path.join(process.cwd(), 'generated_templates');

    if (!fs.existsSync(templatesDir)) {
      return res.json({
        success: true,
        files: [],
        count: 0
      });
    }

    const files = fs.readdirSync(templatesDir)
      .filter(file => file.endsWith('.zip'))
      .map(file => {
        const filepath = path.join(templatesDir, file);
        const stat = fs.statSync(filepath);

        return {
          filename: file,
          size: stat.size,
          createdAt: stat.birthtime,
          modifiedAt: stat.mtime
        };
      })
      .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime()); // 최신순

    res.json({
      success: true,
      files,
      count: files.length
    });

  } catch (error) {
    logger.error('Get files list error:', error);
    res.status(500).json({
      success: false,
      error: '파일 목록 조회 중 오류가 발생했습니다'
    });
  }
});

export default router;