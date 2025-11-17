import { Workshop, WorkshopFile, Task, GeneratedTemplate } from '../types/workshop';
import { DocumentProcessor } from './documentProcessor';
import { AIAnalysisService } from './aiAnalysisService';
import { TemplateGenerator } from './templateGenerator';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('WorkshopService');

// In-memory storage (추후 데이터베이스로 교체)
const workshopsDB = new Map<string, Workshop>();
const filesDB = new Map<string, WorkshopFile>();

export class WorkshopService {
  private aiService: AIAnalysisService;
  private templateGenerator: TemplateGenerator;

  constructor() {
    this.aiService = new AIAnalysisService();
    this.templateGenerator = new TemplateGenerator();
  }

  // Workshop 생성
  createWorkshop(data: {
    name: string;
    domains: string[];
    participantCount?: number;
  }): Workshop {
    const workshop: Workshop = {
      id: this.generateWorkshopId(),
      name: data.name,
      domains: data.domains,
      participantCount: data.participantCount || 1,
      status: 'domain_defined',
      createdAt: new Date(),
      tasks: [],
      files: [],
      fileIds: []
    };

    workshopsDB.set(workshop.id, workshop);
    logger.info(`✅ Workshop created: ${workshop.id}`);

    return workshop;
  }

  // Workshop 조회
  getWorkshop(id: string): Workshop | null {
    return workshopsDB.get(id) || null;
  }

  // 파일 저장
  saveFile(fileData: {
    originalName: string;
    filename: string;
    mimetype: string;
    size: number;
    path: string;
    workshopId: string;
  }): WorkshopFile {
    const file: WorkshopFile = {
      id: this.generateFileId(),
      originalName: fileData.originalName,
      filename: fileData.filename,
      mimetype: fileData.mimetype,
      size: fileData.size,
      path: fileData.path,
      workshopId: fileData.workshopId,
      uploadedAt: new Date(),
      status: 'uploaded'
    };

    filesDB.set(file.id, file);
    logger.info(`✅ File saved: ${file.id} (${file.originalName})`);

    return file;
  }

  // 파일 조회
  getFile(id: string): WorkshopFile | null {
    return filesDB.get(id) || null;
  }

  // Workshop에 파일 ID 추가
  addFileToWorkshop(workshopId: string, fileIds: string[]): void {
    const workshop = this.getWorkshop(workshopId);
    if (!workshop) {
      throw new Error('Workshop not found');
    }

    workshop.fileIds = [...workshop.fileIds, ...fileIds];
    workshop.status = 'files_uploaded';
    workshop.updatedAt = new Date();

    logger.info(`📎 Files added to workshop ${workshopId}: ${fileIds.length} files`);
  }

  // AI 분석 수행
  async analyzeWorkshop(
    workshopId: string,
    onProgress?: (percent: number, message: string) => void,
    onTaskFound?: (task: Task) => void,
    onFileStart?: (fileId: string, filename: string) => void,
    onFileComplete?: (fileId: string, filename: string, taskCount: number) => void
  ): Promise<void> {
    const workshop = this.getWorkshop(workshopId);
    if (!workshop) {
      throw new Error('Workshop not found');
    }

    workshop.status = 'analyzing';
    workshop.updatedAt = new Date();

    let totalTasks = 0;
    const totalFiles = workshop.fileIds.length;

    onProgress?.(0, '분석 시작...');

    try {
      // 각 파일 처리
      for (let i = 0; i < workshop.fileIds.length; i++) {
        const fileId = workshop.fileIds[i];
        const fileRecord = this.getFile(fileId);

        if (!fileRecord) {
          logger.error(`File not found: ${fileId}`);
          continue;
        }

        // 진행률 업데이트
        const progress = ((i / totalFiles) * 100);
        onProgress?.(progress, `${i + 1}/${totalFiles} 파일 분석 중...`);

        // 파일 분석 시작 알림
        onFileStart?.(fileId, fileRecord.originalName);

        // 1단계: 문서 파싱
        logger.info(`📄 Parsing document: ${fileRecord.originalName}`);
        const documentText = await DocumentProcessor.parseDocument(
          fileRecord.path,
          fileRecord.mimetype
        );

        fileRecord.content = documentText;
        fileRecord.status = 'parsed';

        // 2단계: AI 분석
        logger.info(`🤖 Analyzing tasks from: ${fileRecord.originalName}`);
        const tasks = await this.aiService.analyzeTasks(documentText, workshop.domains);

        // 각 태스크 처리
        for (const taskData of tasks) {
          const task: Task = {
            ...taskData,
            id: this.generateTaskId(),
            sourceFileId: fileId,
            sourceFilename: fileRecord.originalName,
            workshopId: workshopId,
            createdAt: new Date()
          };

          workshop.tasks.push(task);
          onTaskFound?.(task);
          totalTasks++;
        }

        fileRecord.status = 'analyzed';

        // 파일 분석 완료 알림
        onFileComplete?.(fileId, fileRecord.originalName, tasks.length);
      }

      // 분석 완료
      workshop.status = 'analyzed';
      workshop.analyzedAt = new Date();

      onProgress?.(100, '분석 완료!');
      logger.info(`🎉 Analysis completed: ${totalTasks} tasks found`);

    } catch (error) {
      workshop.status = 'error';
      logger.error('Analysis error:', error);
      throw error;
    }
  }

  // 템플릿 생성
  async generateTemplates(workshopId: string, selectedTasks: Task[]): Promise<{
    templates: GeneratedTemplate[];
    downloadUrl: string;
  }> {
    const workshop = this.getWorkshop(workshopId);
    if (!workshop) {
      throw new Error('Workshop not found');
    }

    logger.info(`🔧 Generating templates for ${selectedTasks.length} tasks`);

    try {
      // 템플릿 생성
      const templates = await this.templateGenerator.generateAllTemplates(selectedTasks);

      // ZIP 파일 생성
      const zipFilename = await this.templateGenerator.createToolkitZip(
        workshopId,
        selectedTasks,
        templates
      );

      workshop.status = 'tools_generated';
      workshop.updatedAt = new Date();

      const downloadUrl = `/download/${zipFilename}`;

      logger.info(`✅ Templates generated: ${templates.length} templates, ZIP: ${zipFilename}`);

      return {
        templates,
        downloadUrl
      };

    } catch (error) {
      workshop.status = 'error';
      logger.error('Template generation error:', error);
      throw error;
    }
  }

  // Workshop 완료 처리
  completeWorkshop(workshopId: string): void {
    const workshop = this.getWorkshop(workshopId);
    if (!workshop) {
      throw new Error('Workshop not found');
    }

    workshop.status = 'completed';
    workshop.updatedAt = new Date();

    logger.info(`🎊 Workshop completed: ${workshopId}`);
  }

  // ID 생성 헬퍼 메서드들
  private generateWorkshopId(): string {
    return `WS_${Date.now()}_${this.generateRandomString(8)}`;
  }

  private generateFileId(): string {
    return `FILE_${Date.now()}_${this.generateRandomString(12)}`;
  }

  private generateTaskId(): string {
    return `TASK_${Date.now()}_${this.generateRandomString(8)}`;
  }

  private generateRandomString(length: number): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  // 디버그용 메서드들
  getAllWorkshops(): Workshop[] {
    return Array.from(workshopsDB.values());
  }

  getAllFiles(): WorkshopFile[] {
    return Array.from(filesDB.values());
  }

  // 정리용 메서드 (메모리 관리)
  cleanup(workshopId: string): void {
    const workshop = this.getWorkshop(workshopId);
    if (workshop) {
      // 관련 파일들 삭제
      workshop.fileIds.forEach(fileId => {
        filesDB.delete(fileId);
      });

      // 워크샵 삭제
      workshopsDB.delete(workshopId);

      logger.info(`🧹 Cleaned up workshop: ${workshopId}`);
    }
  }
}