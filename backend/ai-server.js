const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const analysisStorage = new Map();

// AI 분석 서비스
class AIAnalysisService {
  constructor() {
    this.hasApiKey = !!process.env.ANTHROPIC_API_KEY;
    if (this.hasApiKey) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      console.log('✅ Claude AI 서비스 연결됨');
    } else {
      console.log('⚠️  Anthropic API key not configured, using mock analysis');
    }
  }

  async analyzeTasks(documentText, domains = []) {
    if (!this.hasApiKey) {
      console.log('🔄 Using mock AI analysis (API key not configured)');
      return this.generateMockAnalysis(documentText);
    }

    console.log('🤖 Starting Claude AI analysis');

    const systemPrompt = `당신은 업무 재설계 전문가입니다.
제공된 문서를 분석하여 반복적인 업무를 추출하고 자동화 방안을 제시하세요.

업무 영역: ${domains.join(', ')}

문서에서 다음과 같은 패턴을 찾아 업무를 추출하세요:
- 정기적으로 반복되는 업무
- 시간이 많이 걸리는 업무
- 자동화가 가능한 업무
- 데이터 처리나 보고서 작성 업무

각 업무에 대해 다음 JSON 형식으로 응답하세요:
{
  "tasks": [
    {
      "id": "task-1",
      "title": "업무 제목",
      "description": "상세 설명",
      "category": "해당 업무 영역 또는 새로운 영역",
      "weeklyHours": 시간(숫자),
      "frequency": "daily/weekly/monthly",
      "automation": "high/medium/low",
      "automationMethod": "구체적인 자동화 방안",
      "confidence": 0.85
    }
  ],
  "suggestedDomains": ["기존 영역을 보완하거나 새로운 영역"],
  "summary": {
    "totalTasks": 3,
    "totalWeeklyHours": 12,
    "highAutomationTasks": 2
  }
}

업무가 명확하지 않으면 가능한 해석으로 추출하되 confidence를 낮게 설정하세요.`;

    const userPrompt = `다음 문서를 분석해서 업무를 추출해주세요:

${documentText}

기존 업무 영역: ${domains.join(', ')}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });

      const responseText = message.content[0].text;
      console.log('🎯 Claude AI 원본 응답:', responseText.substring(0, 200) + '...');

      // JSON 추출
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        console.log(`✅ Claude AI 분석 완료: ${analysisData.tasks?.length}개 업무 추출`);
        return analysisData.tasks || [];
      } else {
        console.log('⚠️ Claude 응답에서 JSON을 찾을 수 없음, 폴백 사용');
        return this.generateMockAnalysis(documentText);
      }
    } catch (error) {
      console.error('❌ Claude AI 분석 실패:', error);
      return this.generateMockAnalysis(documentText);
    }
  }

  generateMockAnalysis(documentText) {
    console.log('🎭 Mock 분석 생성 중...');

    const mockTasks = [
      {
        id: 'mock-task-1',
        title: '데이터 분석 및 보고서 작성',
        description: '업로드된 문서를 기반으로 한 정기 업무 - 주간 데이터 수집 및 분석 후 경영진 보고서 작성',
        category: '데이터 분석',
        weeklyHours: 4,
        frequency: 'weekly',
        automation: 'high',
        automationMethod: 'Python 스크립트 + 자동 보고서 생성',
        confidence: 0.85,
        timeSpent: 4
      },
      {
        id: 'mock-task-2',
        title: '문서 검토 및 승인 프로세스',
        description: '업로드된 문서에서 추출된 업무 - 각종 문서 검토 및 승인 절차 관리',
        category: '문서 관리',
        weeklyHours: 6,
        frequency: 'daily',
        automation: 'medium',
        automationMethod: '워크플로우 자동화 시스템',
        confidence: 0.75,
        timeSpent: 6
      }
    ];

    // 문서 내용 기반으로 추가 업무 생성
    if (documentText && documentText.length > 100) {
      const textLines = documentText.split('\n').filter(line => line.trim().length > 10);
      textLines.slice(0, 3).forEach((line, index) => {
        if (line.length > 20) {
          mockTasks.push({
            id: `content-task-${index}`,
            title: line.substring(0, 50) + (line.length > 50 ? '...' : ''),
            description: `문서에서 추출된 업무: ${line}`,
            category: '추출된 업무',
            weeklyHours: 2,
            frequency: 'weekly',
            automation: 'medium',
            automationMethod: 'AI 어시스턴트 활용',
            confidence: 0.70,
            timeSpent: 2
          });
        }
      });
    }

    return mockTasks;
  }
}

const aiService = new AIAnalysisService();

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AI-Enhanced Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    aiEnabled: aiService.hasApiKey
  });
});

// AI 분석 시작
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

    // 분석 시작 상태 저장
    analysisStorage.set(analysisId, {
      id: analysisId,
      status: 'in_progress',
      progress: 10,
      startedAt: new Date().toISOString(),
      domains,
      userContext,
      documents
    });

    console.log(`🔍 AI 분석 시작: ${analysisId}`);
    console.log(`📄 문서 길이: ${documents.length} 문자`);
    console.log(`🏷️ 업무 영역: ${domains.join(', ')}`);

    // 비동기로 AI 분석 실행
    setTimeout(async () => {
      try {
        // 진행상태 업데이트
        analysisStorage.set(analysisId, {
          ...analysisStorage.get(analysisId),
          status: 'in_progress',
          progress: 50
        });

        // 실제 AI 분석 수행
        const tasks = await aiService.analyzeTasks(documents, domains);

        console.log(`✅ AI 분석 완료: ${analysisId}, 추출된 업무: ${tasks.length}개`);

        // 우선순위 계산
        const priorities = tasks.map((task, index) => ({
          taskId: task.id || `task-${index}`,
          priority: task.automation === 'high' ? 'HIGH' : task.automation === 'medium' ? 'MEDIUM' : 'LOW',
          automationPotential: task.automation,
          confidence: task.confidence || 0.8,
          recommendedTools: [task.automationMethod || 'AI 어시스턴트']
        }));

        // 최종 결과 저장
        analysisStorage.set(analysisId, {
          id: analysisId,
          status: 'completed',
          progress: 100,
          startedAt: analysisStorage.get(analysisId)?.startedAt,
          completedAt: new Date().toISOString(),
          domains,
          userContext,
          tasks,
          priorities,
          summary: {
            totalTasks: tasks.length,
            totalWeeklyHours: tasks.reduce((sum, task) => sum + (task.weeklyHours || task.timeSpent || 0), 0),
            averageComplexity: tasks.length > 0 ? tasks.reduce((sum, task) => {
              return sum + (task.automation === 'high' ? 8 : task.automation === 'medium' ? 5 : 2);
            }, 0) / tasks.length : 0,
            unclearTasks: tasks.filter(task => (task.confidence || 0) < 0.7).length
          }
        });

      } catch (error) {
        console.error(`❌ AI 분석 실패: ${analysisId}`, error);
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
        status: 'started',
        estimatedTime: '2-5 seconds'
      },
      message: 'AI analysis started successfully'
    });
  } catch (error) {
    console.error('AI 분석 시작 오류:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to start AI analysis'
    });
  }
});

// 분석 상태 확인
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
    console.error('분석 상태 확인 오류:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get analysis status'
    });
  }
});

// 세션 생성 (기존 호환성)
app.post('/api/sessions', async (req, res) => {
  try {
    const { domains, userId } = req.body;
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    console.log(`📋 세션 생성: ${sessionId}, 영역: ${domains?.join(', ')}`);

    res.status(201).json({
      success: true,
      data: {
        sessionId,
        domains: domains || [],
        userId: userId || 'guest',
        createdAt: new Date().toISOString()
      },
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error('세션 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create session'
    });
  }
});

// 파일 업로드 (기존 호환성)
app.post('/api/files/upload', async (req, res) => {
  try {
    const { sessionId, files } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
        message: 'Please provide a valid session ID'
      });
    }

    const mockFileIds = files ? files.map((_, index) =>
      'file_' + Date.now() + '_' + index
    ) : ['file_' + Date.now() + '_0'];

    console.log(`📁 파일 업로드: ${sessionId}, 파일 수: ${mockFileIds.length}`);

    res.status(200).json({
      success: true,
      data: {
        fileIds: mockFileIds,
        sessionId,
        uploadedAt: new Date().toISOString(),
        totalFiles: mockFileIds.length
      },
      message: 'Files uploaded successfully'
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to upload files'
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
      console.log(`🗑️ 오래된 분석 정리: ${id}`);
    }
  }
}, 30 * 60 * 1000); // 30분마다 정리

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
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
  console.log(`🚀 AI-Enhanced Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Service: ${aiService.hasApiKey ? 'Claude API Connected' : 'Mock Mode'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100} MB`);
});

module.exports = app;