import { Request, Response } from 'express';
import { WorkshopService } from '../services/workshopService';
import { DocumentProcessor } from '../services/documentProcessor';
import { cleanupUploadedFiles } from '../middleware/workshopUpload';
import {
  CreateWorkshopRequest,
  CreateWorkshopResponse,
  UploadFilesResponse,
  GenerateTemplatesRequest,
  GenerateTemplatesResponse
} from '../types/workshop';
import { logger } from '../utils/logger';

export class WorkshopController {
  private workshopService: WorkshopService;

  constructor() {
    this.workshopService = new WorkshopService();
  }

  // POST /api/workshops - 워크샵 생성
  createWorkshop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, domains, participantCount }: CreateWorkshopRequest = req.body;

      // 입력 검증
      if (!domains || domains.length !== 3) {
        res.status(400).json({
          success: false,
          error: '3개의 도메인이 필요합니다'
        });
        return;
      }

      const workshop = this.workshopService.createWorkshop({
        name,
        domains,
        participantCount: participantCount || 1
      });

      const response: CreateWorkshopResponse = {
        success: true,
        id: workshop.id,
        message: '워크샵이 생성되었습니다'
      };

      res.status(201).json(response);

    } catch (error) {
      logger.error('Workshop creation error:', error);
      res.status(500).json({
        success: false,
        error: '서버 오류가 발생했습니다'
      });
    }
  };

  // POST /api/upload - 파일 업로드
  uploadFiles = async (req: Request, res: Response): Promise<void> => {
    try {
      const workshopId = req.body.workshopId;

      if (!workshopId) {
        res.status(400).json({
          success: false,
          error: 'workshopId가 필요합니다'
        });
        return;
      }

      // Workshop 존재 확인
      const workshop = this.workshopService.getWorkshop(workshopId);
      if (!workshop) {
        res.status(404).json({
          success: false,
          error: '워크샵을 찾을 수 없습니다'
        });
        return;
      }

      // 파일 확인
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          success: false,
          error: '업로드된 파일이 없습니다'
        });
        return;
      }

      const uploadedFileIds: string[] = [];

      // 각 파일 처리
      for (const file of req.files as Express.Multer.File[]) {
        const fileRecord = this.workshopService.saveFile({
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          workshopId: workshopId
        });

        uploadedFileIds.push(fileRecord.id);
      }

      // Workshop에 파일 ID 추가
      this.workshopService.addFileToWorkshop(workshopId, uploadedFileIds);

      const response: UploadFilesResponse = {
        success: true,
        fileIds: uploadedFileIds,
        count: req.files.length,
        message: `${req.files.length}개 파일 업로드 완료`
      };

      res.json(response);

    } catch (error) {
      logger.error('File upload error:', error);

      // Clean up uploaded files in case of error
      if (req.files && Array.isArray(req.files)) {
        await cleanupUploadedFiles(req.files as Express.Multer.File[]);
      }

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다'
      });
    }
  };

  // POST /api/generate-templates - 템플릿 생성
  generateTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workshopId, tasks }: GenerateTemplatesRequest = req.body;

      if (!workshopId || !tasks || tasks.length === 0) {
        res.status(400).json({
          success: false,
          error: '워크샵 ID와 태스크 목록이 필요합니다'
        });
        return;
      }

      const workshop = this.workshopService.getWorkshop(workshopId);
      if (!workshop) {
        res.status(404).json({
          success: false,
          error: '워크샵을 찾을 수 없습니다'
        });
        return;
      }

      logger.info(`🔧 Starting template generation for workshop ${workshopId}`);

      const result = await this.workshopService.generateTemplates(workshopId, tasks);

      const response: GenerateTemplatesResponse = {
        success: true,
        templates: result.templates.map(t => ({
          id: t.id,
          type: t.type,
          name: t.name,
          taskId: t.taskId
        })),
        downloadUrl: result.downloadUrl,
        message: `${result.templates.length}개 도구 생성 완료`
      };

      res.json(response);

    } catch (error) {
      logger.error('Template generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '도구 생성 중 오류가 발생했습니다'
      });
    }
  };

  // GET /api/workshops/:id - 워크샵 조회
  getWorkshop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const workshop = this.workshopService.getWorkshop(id);
      if (!workshop) {
        res.status(404).json({
          success: false,
          error: '워크샵을 찾을 수 없습니다'
        });
        return;
      }

      res.json({
        success: true,
        workshop
      });

    } catch (error) {
      logger.error('Get workshop error:', error);
      res.status(500).json({
        success: false,
        error: '서버 오류가 발생했습니다'
      });
    }
  };

  // DELETE /api/workshops/:id - 워크샵 삭제
  deleteWorkshop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const workshop = this.workshopService.getWorkshop(id);
      if (!workshop) {
        res.status(404).json({
          success: false,
          error: '워크샵을 찾을 수 없습니다'
        });
        return;
      }

      this.workshopService.cleanup(id);

      res.json({
        success: true,
        message: '워크샵이 삭제되었습니다'
      });

    } catch (error) {
      logger.error('Delete workshop error:', error);
      res.status(500).json({
        success: false,
        error: '서버 오류가 발생했습니다'
      });
    }
  };

  // GET /api/workshops - 모든 워크샵 조회 (디버그용)
  getAllWorkshops = async (req: Request, res: Response): Promise<void> => {
    try {
      const workshops = this.workshopService.getAllWorkshops();

      res.json({
        success: true,
        workshops,
        count: workshops.length
      });

    } catch (error) {
      logger.error('Get all workshops error:', error);
      res.status(500).json({
        success: false,
        error: '서버 오류가 발생했습니다'
      });
    }
  };
}