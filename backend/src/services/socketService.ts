import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { WorkshopService } from './workshopService';
import {
  StartAnalysisPayload,
  AnalysisProgressEvent,
  FileAnalysisStartEvent,
  FileAnalysisCompleteEvent,
  AnalysisCompleteEvent,
  AnalysisErrorEvent,
  Task
} from '../types/workshop';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('SocketService');

export class SocketService {
  private io: SocketIOServer;
  private workshopService: WorkshopService;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"]
      }
    });

    this.workshopService = new WorkshopService();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`🔌 Client connected: ${socket.id}`);

      // AI 분석 시작 이벤트
      socket.on('start-analysis', async (data: StartAnalysisPayload) => {
        const { workshopId, fileIds, domains } = data;

        logger.info(`🚀 Starting analysis for workshop: ${workshopId}, files: ${fileIds.length}`);

        try {
          const workshop = this.workshopService.getWorkshop(workshopId);
          if (!workshop) {
            const errorEvent: AnalysisErrorEvent = {
              message: '워크샵을 찾을 수 없습니다'
            };
            socket.emit('analysis-error', errorEvent);
            return;
          }

          // 분석 시작
          await this.workshopService.analyzeWorkshop(
            workshopId,
            // 진행률 콜백
            (percent: number, message: string) => {
              const progressEvent: AnalysisProgressEvent = { percent, message };
              socket.emit('analysis-progress', progressEvent);
            },
            // 태스크 발견 콜백
            (task: Task) => {
              socket.emit('task-analyzed', task);
            },
            // 파일 분석 시작 콜백
            (fileId: string, filename: string) => {
              const startEvent: FileAnalysisStartEvent = { fileId, filename };
              socket.emit('file-analysis-start', startEvent);
            },
            // 파일 분석 완료 콜백
            (fileId: string, filename: string, taskCount: number) => {
              const completeEvent: FileAnalysisCompleteEvent = {
                fileId,
                filename,
                taskCount
              };
              socket.emit('file-analysis-complete', completeEvent);
            }
          );

          // 분석 완료 알림
          const completeEvent: AnalysisCompleteEvent = {
            workshopId,
            totalTasks: workshop.tasks.length,
            totalFiles: workshop.fileIds.length
          };
          socket.emit('analysis-complete', completeEvent);

          logger.info(`✅ Analysis completed for workshop: ${workshopId}`);

        } catch (error) {
          logger.error('Analysis error:', error);

          const errorEvent: AnalysisErrorEvent = {
            message: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다',
            error: error
          };
          socket.emit('analysis-error', errorEvent);
        }
      });

      // 연결 해제 이벤트
      socket.on('disconnect', (reason) => {
        logger.info(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`);
      });

      // 에러 핸들링
      socket.on('error', (error) => {
        logger.error(`Socket error for ${socket.id}:`, error);
      });
    });

    // 서버 레벨 에러 핸들링
    this.io.on('error', (error) => {
      logger.error('Socket.IO server error:', error);
    });
  }

  // 특정 클라이언트에게 메시지 전송
  public emitToClient(socketId: string, event: string, data: any): void {
    this.io.to(socketId).emit(event, data);
  }

  // 모든 클라이언트에게 메시지 전송
  public emitToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  // 특정 룸에 메시지 전송
  public emitToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }

  // 연결된 클라이언트 수 조회
  public getConnectedClientsCount(): number {
    return this.io.sockets.sockets.size;
  }

  // Socket.IO 서버 종료
  public close(): void {
    this.io.close();
    logger.info('🔌 Socket.IO server closed');
  }
}