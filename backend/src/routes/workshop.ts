import { Router } from 'express';
import { WorkshopController } from '../controllers/workshopController';
import {
  workshopUpload,
  handleUploadError,
  validateUploadedFiles,
  logUploadMetrics
} from '../middleware/workshopUpload';

const router = Router();
const workshopController = new WorkshopController();

// 워크샵 생성
router.post('/workshops', workshopController.createWorkshop);

// 파일 업로드
router.post('/upload',
  workshopUpload.array('files', 10),
  handleUploadError,
  validateUploadedFiles,
  logUploadMetrics,
  workshopController.uploadFiles
);

// 템플릿 생성
router.post('/generate-templates', workshopController.generateTemplates);

// 워크샵 조회
router.get('/workshops/:id', workshopController.getWorkshop);

// 워크샵 삭제
router.delete('/workshops/:id', workshopController.deleteWorkshop);

// 모든 워크샵 조회 (디버그용)
router.get('/workshops', workshopController.getAllWorkshops);

export default router;