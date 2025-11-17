const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const analysisStorage = new Map();

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { domains = [], documents = '', userContext } = req.body;

    if (!documents.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Documents content is required',
        message: 'Please provide documents to analyze'
      });
    }

    const analysisId = 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    analysisStorage.set(analysisId, {
      id: analysisId,
      status: 'in_progress',
      progress: 0,
      startedAt: new Date().toISOString(),
      domains,
      userContext,
      documents
    });

    setTimeout(async () => {
      try {
        const mockTasks = [
          {
            id: 'task-' + Date.now() + '-1',
            title: '데이터 분석 및 보고서 작성',
            description: '매주 업무 데이터를 수집하고 분석하여 경영진 보고서 작성',
            weeklyHours: 4,
            frequency: 'weekly',
            automation: 'high',
            automationMethod: 'Python 스크립트 + 자동 보고서 생성',
            category: '데이터 분석',
            confidence: 0.85,
            timeSpent: 4
          },
          {
            id: 'task-' + Date.now() + '-2',
            title: '고객 문의 응답 관리',
            description: '일일 고객 문의 사항 검토 및 표준 응답 작성',
            weeklyHours: 6,
            frequency: 'daily',
            automation: 'medium',
            automationMethod: 'AI 챗봇 + 템플릿 자동화',
            category: '고객 서비스',
            confidence: 0.75,
            timeSpent: 6
          },
          {
            id: 'task-' + Date.now() + '-3',
            title: '회의 일정 조율 및 준비',
            description: '주간 팀 회의 일정 조율 및 아젠다 준비',
            weeklyHours: 2,
            frequency: 'weekly',
            automation: 'low',
            automationMethod: '캘린더 자동화 툴',
            category: '일정 관리',
            confidence: 0.60,
            timeSpent: 2
          }
        ];

        const priorities = mockTasks.map((task, index) => ({
          taskId: task.id,
          priority: task.automation === 'high' ? 'HIGH' : task.automation === 'medium' ? 'MEDIUM' : 'LOW',
          automationPotential: task.automation,
          confidence: task.confidence,
          recommendedTools: [task.automationMethod]
        }));

        analysisStorage.set(analysisId, {
          id: analysisId,
          status: 'completed',
          progress: 100,
          startedAt: analysisStorage.get(analysisId)?.startedAt,
          completedAt: new Date().toISOString(),
          domains,
          userContext,
          tasks: mockTasks,
          priorities,
          summary: {
            totalTasks: mockTasks.length,
            totalWeeklyHours: mockTasks.reduce((sum, task) => sum + task.weeklyHours, 0),
            averageComplexity: 6.5,
            unclearTasks: 0
          }
        });

        console.log(`✅ Analysis ${analysisId} completed successfully`);
      } catch (error) {
        console.error(`❌ Analysis ${analysisId} failed:`, error);
        analysisStorage.set(analysisId, {
          id: analysisId,
          status: 'failed',
          progress: 0,
          startedAt: analysisStorage.get(analysisId)?.startedAt,
          failedAt: new Date().toISOString(),
          error: error.message,
          domains,
          userContext
        });
      }
    }, 1000 + Math.random() * 2000); // 1-3초 랜덤 지연

    res.status(201).json({
      success: true,
      data: {
        analysisId,
        status: 'started'
      },
      message: 'AI analysis started successfully'
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to start AI analysis'
    });
  }
});

app.get('/api/ai/analysis/:id', async (req, res) => {
  try {
    const analysisId = req.params.id;
    const result = analysisStorage.get(analysisId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
        message: 'The requested analysis was not found'
      });
    }

    res.json({
      success: true,
      data: result,
      message: 'Analysis status retrieved successfully'
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get analysis status'
    });
  }
});

// 자동 정리 - 1시간 후 분석 결과 삭제
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [id, analysis] of analysisStorage) {
    const startTime = new Date(analysis.startedAt).getTime();
    if (startTime < oneHourAgo) {
      analysisStorage.delete(id);
      console.log(`🗑️ Cleaned up old analysis: ${id}`);
    }
  }
}, 30 * 60 * 1000); // 30분마다 정리

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

// 예외 처리
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Stable Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100} MB`);
});

module.exports = app;