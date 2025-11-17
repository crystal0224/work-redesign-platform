const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Mock AI analysis endpoint
app.post('/api/ai/analyze', (req, res) => {
  try {
    const { domains = [], documents = '', userContext } = req.body;

    if (!documents.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Documents content is required',
        message: 'Please provide documents to analyze'
      });
    }

    const analysisId = 'analysis_' + Date.now();

    // Mock analysis - simulate processing
    setTimeout(() => {
      // This would normally be stored in a database or memory store
      // For now we'll just create a mock response
    }, 100);

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

// Mock analysis status endpoint
// Mock sessions endpoint
app.post('/api/sessions', async (req, res) => {
  try {
    const { domains, userId } = req.body;

    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    console.log(`📋 Session created: ${sessionId} with domains:`, domains);

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
    console.error('Session creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create session'
    });
  }
});

// Mock file upload endpoint
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

    // Mock file processing
    const mockFileIds = files ? files.map((_, index) =>
      'file_' + Date.now() + '_' + index
    ) : ['file_' + Date.now() + '_0'];

    console.log(`📁 Files uploaded for session ${sessionId}:`, mockFileIds);

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
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to upload files'
    });
  }
});

app.get('/api/ai/analysis/:id', (req, res) => {
  try {
    const analysisId = req.params.id;

    // Mock completed analysis
    const mockTasks = [
      {
        id: 'task-1',
        title: '데이터 분석 및 보고서 작성',
        description: '매주 업무 데이터를 수집하고 분석하여 경영진 보고서 작성',
        weeklyHours: 4,
        frequency: 'weekly',
        automation: 'high',
        automationMethod: 'Python 스크립트 + 자동 보고서 생성',
        category: '데이터 분석',
        confidence: 0.85
      },
      {
        id: 'task-2',
        title: '고객 문의 응답 관리',
        description: '일일 고객 문의 사항 검토 및 표준 응답 작성',
        weeklyHours: 6,
        frequency: 'daily',
        automation: 'medium',
        automationMethod: 'AI 챗봇 + 템플릿 자동화',
        category: '고객 서비스',
        confidence: 0.75
      },
      {
        id: 'task-3',
        title: '회의 일정 조율 및 준비',
        description: '주간 팀 회의 일정 조율 및 아젠다 준비',
        weeklyHours: 2,
        frequency: 'weekly',
        automation: 'low',
        automationMethod: '캘린더 자동화 툴',
        category: '일정 관리',
        confidence: 0.60
      }
    ];

    const result = {
      id: analysisId,
      status: 'completed',
      progress: 100,
      startedAt: new Date(Date.now() - 5000).toISOString(),
      completedAt: new Date().toISOString(),
      tasks: mockTasks,
      priorities: mockTasks.map((task, index) => ({
        taskId: task.id,
        priority: task.automation === 'high' ? 'HIGH' : task.automation === 'medium' ? 'MEDIUM' : 'LOW',
        automationPotential: task.automation,
        confidence: task.confidence,
        recommendedTools: [task.automationMethod]
      })),
      summary: {
        totalTasks: mockTasks.length,
        totalWeeklyHours: mockTasks.reduce((sum, task) => sum + task.weeklyHours, 0),
        averageComplexity: 6.5,
        unclearTasks: 0
      }
    };

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});