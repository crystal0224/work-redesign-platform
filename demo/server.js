const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const ClaudeService = require('./claudeService');
const DocumentProcessor = require('./documentProcessor');
const TemplateGenerator = require('./templateGenerator');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3000;

// Initialize services
const claudeService = new ClaudeService();
const documentProcessor = new DocumentProcessor();
const templateGenerator = new TemplateGenerator();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`사용자 연결: ${socket.id}`);

  // Join chat room
  socket.on('join-chat', (data) => {
    const { userId, workshopId, taskId } = data;
    const roomId = `workshop-${workshopId}-task-${taskId}`;

    socket.join(roomId);
    socket.userId = userId;
    socket.roomId = roomId;

    // Initialize chat session
    if (!chatSessions[roomId]) {
      chatSessions[roomId] = {
        participants: new Set(),
        messages: [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
    }

    chatSessions[roomId].participants.add(userId);
    activeChatRooms.add(roomId);

    console.log(`사용자 ${userId}가 채팅방 ${roomId}에 참여했습니다.`);

    // Send chat history
    socket.emit('chat-history', {
      roomId: roomId,
      messages: chatSessions[roomId].messages
    });

    // Notify others
    socket.to(roomId).emit('user-joined', {
      userId: userId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle chat messages
  socket.on('send-message', async (data) => {
    const { message, type = 'user' } = data;
    const roomId = socket.roomId;
    const userId = socket.userId;

    if (!roomId || !userId) {
      socket.emit('error', { message: '채팅방에 먼저 참여해주세요.' });
      return;
    }

    const chatMessage = {
      id: Date.now().toString(),
      userId: userId,
      message: message,
      type: type, // 'user', 'ai', 'system'
      timestamp: new Date().toISOString(),
      roomId: roomId
    };

    // Store message
    chatSessions[roomId].messages.push(chatMessage);
    chatSessions[roomId].lastActivity = new Date().toISOString();

    console.log(`채팅 메시지 (${roomId}): ${userId} - ${message}`);

    // Broadcast to room
    io.to(roomId).emit('new-message', chatMessage);

    // AI response for clarification questions
    if (type === 'user' && (message.includes('?') || message.includes('질문') || message.includes('도움'))) {
      setTimeout(async () => {
        try {
          const aiResponse = await generateAIResponse(message, userId, roomId);

          const aiMessage = {
            id: (Date.now() + 1).toString(),
            userId: 'ai-assistant',
            message: aiResponse,
            type: 'ai',
            timestamp: new Date().toISOString(),
            roomId: roomId
          };

          chatSessions[roomId].messages.push(aiMessage);
          io.to(roomId).emit('new-message', aiMessage);

        } catch (error) {
          console.error('AI 응답 생성 오류:', error);
        }
      }, 1000); // 1초 지연 후 AI 응답
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { isTyping } = data;
    const roomId = socket.roomId;
    const userId = socket.userId;

    if (roomId && userId) {
      socket.to(roomId).emit('user-typing', {
        userId: userId,
        isTyping: isTyping,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle workshop progress updates
  socket.on('update-progress', (data) => {
    const { workshopId, stepId, progress } = data;
    const roomId = `workshop-${workshopId}`;

    // Broadcast progress update to workshop participants
    io.to(roomId).emit('progress-updated', {
      workshopId: workshopId,
      stepId: stepId,
      progress: progress,
      timestamp: new Date().toISOString()
    });

    console.log(`워크샵 진행상황 업데이트: ${workshopId} - Step ${stepId}: ${progress}%`);
  });

  // Handle task updates
  socket.on('update-task', (data) => {
    const { taskId, status, data: taskData } = data;
    const roomId = socket.roomId;

    if (roomId) {
      io.to(roomId).emit('task-updated', {
        taskId: taskId,
        status: status,
        data: taskData,
        updatedBy: socket.userId,
        timestamp: new Date().toISOString()
      });

      console.log(`작업 업데이트: ${taskId} - ${status}`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`사용자 연결 해제: ${socket.id}`);

    if (socket.roomId && socket.userId) {
      const roomId = socket.roomId;
      const userId = socket.userId;

      // Remove from chat session
      if (chatSessions[roomId]) {
        chatSessions[roomId].participants.delete(userId);

        // Clean up empty rooms
        if (chatSessions[roomId].participants.size === 0) {
          delete chatSessions[roomId];
          activeChatRooms.delete(roomId);
        }
      }

      // Notify others
      socket.to(roomId).emit('user-left', {
        userId: userId,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// AI response generation for chat
async function generateAIResponse(userMessage, userId, roomId) {
  try {
    // Get user context
    const user = sampleUsers.find(u => u.id === userId);
    const userContext = user ? `${user.name} (${user.department} ${user.position})` : '사용자';

    // Simple AI response based on message content
    let response = '';

    if (userMessage.includes('자동화') || userMessage.includes('automation')) {
      response = `안녕하세요 ${userContext}님! 자동화 관련 질문이시군요. 현재 작업의 어떤 부분을 자동화하고 싶으신지 구체적으로 알려주시면 더 정확한 도움을 드릴 수 있습니다. 예를 들어:

• 데이터 수집 및 처리 자동화
• 보고서 생성 자동화
• 업무 프로세스 워크플로우 자동화
• 반복 작업 스크립트 자동화

어떤 영역에 관심이 있으신지 알려주세요.`;

    } else if (userMessage.includes('프롬프트') || userMessage.includes('prompt')) {
      response = `프롬프트 관련 질문이시네요! AI 프롬프트를 효과적으로 작성하는 팁을 알려드리겠습니다:

🎯 **명확한 역할 정의**: "당신은 [분야] 전문가입니다"
📋 **구체적인 지시사항**: 단계별로 수행할 작업 명시
📊 **출력 형식 지정**: 원하는 결과물의 형태 설명
💡 **예시 제공**: 기대하는 답변의 샘플

현재 작업에 대한 프롬프트 템플릿이 필요하시면 6단계 워크샵을 완료하시면 자동으로 생성해드립니다!`;

    } else if (userMessage.includes('도움') || userMessage.includes('help')) {
      response = `물론입니다! 어떤 도움이 필요하신지 알려주세요:

🔧 **워크샵 진행**: 6단계 업무 재설계 과정 안내
📁 **파일 업로드**: 업무 문서 분석 및 키워드 추출
🤖 **AI 분석**: 자동화 가능한 작업 식별
📦 **도구 생성**: 프롬프트, 코드, 워크플로우 템플릿

구체적으로 어떤 단계에서 도움이 필요하신지 말씀해주세요!`;

    } else if (userMessage.includes('단계') || userMessage.includes('step')) {
      response = `워크샵 단계에 대해 설명드리겠습니다:

**1단계**: 업무 도메인 정의 📝
**2단계**: 자료 및 도구 입력 📊
**3단계**: AI 분석 실행 🤖
**4단계**: 자동화 시나리오 분류 ⚡
**5단계**: 우선순위 Quick Wins 선별 🎯
**6단계**: 도구 및 템플릿 생성 📦

현재 어느 단계에 계신지, 혹은 특정 단계에 대해 더 자세히 알고 싶으신지 알려주세요.`;

    } else {
      response = `안녕하세요! SK Work Redesign Platform AI 어시스턴트입니다.

업무 재설계와 자동화에 대한 모든 질문에 답변해드립니다. 다음과 같은 주제로 도움을 받으실 수 있습니다:

• 업무 프로세스 분석 및 개선
• 자동화 솔루션 설계
• AI 도구 및 프롬프트 작성
• 워크플로우 최적화

구체적인 질문이나 도움이 필요한 부분을 알려주세요!`;
    }

    return response;

  } catch (error) {
    console.error('AI 응답 생성 실패:', error);
    return '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
}

// Sample data
const sampleWorkshops = [
  {
    id: '1',
    title: 'Q4 Work Redesign Workshop',
    description: 'SK Group 신임 팀장 업무 재설계 워크샵',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    createdBy: 'HRD 담당자',
    participants: [
      { id: 'user1', name: '김철수 팀장', department: 'IT', status: 'analyzing' },
      { id: 'user2', name: '이영희 팀장', department: 'Marketing', status: 'completed' },
      { id: 'user3', name: '박민수 팀장', department: 'Finance', status: 'in_progress' }
    ],
    maxParticipants: 20
  },
  {
    id: '2',
    title: 'SK Academy 팀장 교육 워크샵',
    description: '2024년 하반기 신임 팀장 대상 업무 효율화',
    status: 'DRAFT',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: 'HRD 담당자',
    participants: [],
    maxParticipants: 15
  }
];

const sampleUsers = [
  { id: 'hrd1', name: 'HRD 담당자', role: 'FACILITATOR', department: 'HRD' },
  { id: 'user1', name: '김철수', role: 'PARTICIPANT', department: 'IT', position: '팀장' },
  { id: 'user2', name: '이영희', role: 'PARTICIPANT', department: 'Marketing', position: '팀장' },
  { id: 'user3', name: '박민수', role: 'PARTICIPANT', department: 'Finance', position: '팀장' }
];

// User sessions (간단한 세션 관리)
const userSessions = {};

// WebSocket chat sessions
const chatSessions = {};
const activeChatRooms = new Set();

// Participant tasks storage (in production, use database)
const participantTasks = {
  'user1': [
    {
      id: '1',
      title: '서버 모니터링 자동화',
      description: '현재 매일 수동으로 서버 상태를 확인하고 있어서 시간이 많이 소요됩니다. 자동화 시스템을 구축하고 싶습니다.',
      priority: 'high',
      category: 'automation',
      estimatedHours: 8,
      status: 'backlog',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user1'
    },
    {
      id: '2',
      title: '코드 리뷰 프로세스 개선',
      description: '팀 내 코드 리뷰가 체계적이지 않아서 품질 이슈가 발생하고 있습니다.',
      priority: 'medium',
      category: 'process',
      estimatedHours: 4,
      status: 'progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user1'
    }
  ],
  'user2': [
    {
      id: '3',
      title: '마케팅 캠페인 분석 자동화',
      description: '월말마다 수동으로 캠페인 성과를 정리하는데 3일이 걸립니다. 자동 리포트 시스템이 필요합니다.',
      priority: 'high',
      category: 'automation',
      estimatedHours: 12,
      status: 'backlog',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user2'
    }
  ],
  'user3': [
    {
      id: '4',
      title: '예산 승인 프로세스 간소화',
      description: '현재 예산 승인에 7단계를 거쳐야 해서 너무 오래 걸립니다.',
      priority: 'medium',
      category: 'process',
      estimatedHours: 6,
      status: 'review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user3'
    }
  ]
};

const sampleTasks = [
  {
    id: '1',
    title: 'Implement Automated Server Monitoring',
    description: 'Set up automated monitoring system to replace manual checks',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    estimatedHours: 16,
    workshopId: '1'
  },
  {
    id: '2',
    title: 'Create Ticket Management System',
    description: 'Replace email-based ticket system with automated solution',
    status: 'BACKLOG',
    priority: 'HIGH',
    estimatedHours: 24,
    workshopId: '1'
  },
  {
    id: '3',
    title: 'Automate Backup Processes',
    description: 'Implement automated backup scheduling and monitoring',
    status: 'REVIEW',
    priority: 'MEDIUM',
    estimatedHours: 12,
    workshopId: '1'
  }
];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Work Redesign Platform API is running!',
    timestamp: new Date().toISOString()
  });
});

// 사용자 로그인 (간단한 데모용)
app.post('/api/auth/login', (req, res) => {
  const { userType } = req.body;

  let user;
  if (userType === 'hrd') {
    user = sampleUsers.find(u => u.role === 'FACILITATOR');
  } else {
    user = sampleUsers.find(u => u.role === 'PARTICIPANT' && u.id === userType);
  }

  if (user) {
    const sessionId = Math.random().toString(36).substr(2, 9);
    userSessions[sessionId] = user;

    res.json({
      success: true,
      sessionId,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        department: user.department,
        position: user.position
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid user type' });
  }
});

// 현재 사용자 정보
app.get('/api/auth/me', (req, res) => {
  const sessionId = req.headers.authorization;
  const user = userSessions[sessionId];

  if (user) {
    res.json({ user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// 워크샵 참여
app.post('/api/workshops/:id/join', (req, res) => {
  const workshopId = req.params.id;
  const sessionId = req.headers.authorization;
  const user = userSessions[sessionId];

  if (!user || user.role !== 'PARTICIPANT') {
    return res.status(403).json({ error: 'Only participants can join workshops' });
  }

  const workshop = sampleWorkshops.find(w => w.id === workshopId);
  if (!workshop) {
    return res.status(404).json({ error: 'Workshop not found' });
  }

  if (workshop.participants.length >= workshop.maxParticipants) {
    return res.status(400).json({ error: 'Workshop is full' });
  }

  // 이미 참여 중인지 확인
  const alreadyJoined = workshop.participants.find(p => p.id === user.id);
  if (alreadyJoined) {
    return res.status(400).json({ error: 'Already joined this workshop' });
  }

  // 참여자 추가
  workshop.participants.push({
    id: user.id,
    name: user.name,
    department: user.department,
    status: 'joined',
    joinedAt: new Date().toISOString()
  });

  res.json({ success: true, workshop });
});

// 개별 팀장의 업무 분석 제출
app.post('/api/workshops/:id/my-analysis', (req, res) => {
  const { currentProcesses, painPoints, goals, teamInfo } = req.body;
  const workshopId = req.params.id;
  const sessionId = req.headers.authorization;
  const user = userSessions[sessionId];

  if (!user || user.role !== 'PARTICIPANT') {
    return res.status(403).json({ error: 'Only participants can submit analysis' });
  }

  // 개별 분석 데이터 저장 (실제로는 데이터베이스에)
  const analysisId = `analysis-${workshopId}-${user.id}`;
  const analysis = {
    id: analysisId,
    workshopId,
    userId: user.id,
    userName: user.name,
    department: user.department,
    currentProcesses,
    painPoints,
    goals,
    teamInfo,
    status: 'analyzing',
    submittedAt: new Date().toISOString()
  };

  // 워크샵에서 참여자 상태 업데이트
  const workshop = sampleWorkshops.find(w => w.id === workshopId);
  if (workshop) {
    const participant = workshop.participants.find(p => p.id === user.id);
    if (participant) {
      participant.status = 'analyzing';
    }
  }

  res.json({ success: true, analysisId, analysis });
});

app.get('/api/workshops', (req, res) => {
  res.json(sampleWorkshops);
});

app.get('/api/workshops/:id', (req, res) => {
  const workshop = sampleWorkshops.find(w => w.id === req.params.id);
  if (!workshop) {
    return res.status(404).json({ error: 'Workshop not found' });
  }
  res.json(workshop);
});

app.get('/api/workshops/:id/tasks', (req, res) => {
  const workshopTasks = sampleTasks.filter(t => t.workshopId === req.params.id);
  res.json(workshopTasks);
});

app.post('/api/workshops', (req, res) => {
  const newWorkshop = {
    id: String(sampleWorkshops.length + 1),
    ...req.body,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    progress: 0
  };
  sampleWorkshops.push(newWorkshop);
  res.status(201).json(newWorkshop);
});

app.post('/api/ai/analyze', async (req, res) => {
  try {
    console.log('AI analysis request received:', req.body);

    // Extract analysis input from request
    const analysisInput = {
      domain: req.body.domain || '',
      areas: req.body.areas || [],
      description: req.body.description || '',
      tools: req.body.tools || [],
      materials: req.body.materials || [],
      userContext: {
        userId: req.body.userId || 'unknown',
        department: req.body.department || 'Unknown',
        position: req.body.position || 'Unknown'
      }
    };

    // Call Claude service for real AI analysis
    const analysis = await claudeService.analyzeWorkTasks(analysisInput);

    console.log('AI analysis completed successfully');
    res.json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      error: 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      fallback: claudeService.getFallbackAnalysis()
    });
  }
});

// Generate prompt template
app.post('/api/ai/generate-template', async (req, res) => {
  try {
    console.log('Template generation request received:', req.body);

    const { task, agentType } = req.body;

    if (!task || !agentType) {
      return res.status(400).json({
        error: '작업 정보와 에이전트 타입이 필요합니다.'
      });
    }

    // Generate template using Claude service
    const template = await claudeService.generatePromptTemplate(task, agentType);

    console.log('Template generation completed successfully');
    res.json(template);
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({
      error: '템플릿 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

// File upload and processing
app.post('/api/files/upload', (req, res) => {
  // Use multer middleware for file upload
  const uploadMiddleware = documentProcessor.getUploadMiddleware();

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error('파일 업로드 오류:', err);
      return res.status(400).json({
        error: err.message,
        code: 'UPLOAD_ERROR'
      });
    }

    try {
      console.log(`파일 업로드 요청: ${req.files?.length || 0}개 파일`);

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: '업로드할 파일이 없습니다.',
          code: 'NO_FILES'
        });
      }

      // 파일 검증
      const validationErrors = [];
      req.files.forEach(file => {
        const errors = documentProcessor.validateFile(file);
        if (errors.length > 0) {
          validationErrors.push({
            filename: file.originalname,
            errors: errors
          });
        }
      });

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: '파일 검증 실패',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        });
      }

      // 파일 처리
      const results = await documentProcessor.processFiles(req.files);
      const summary = documentProcessor.generateProcessingSummary(results);

      console.log(`파일 처리 완료: ${summary.successful}/${summary.totalFiles} 성공`);

      res.json({
        success: true,
        message: '파일 처리가 완료되었습니다.',
        results: results,
        summary: summary
      });

    } catch (error) {
      console.error('파일 처리 오류:', error);
      res.status(500).json({
        error: '파일 처리 중 오류가 발생했습니다.',
        code: 'PROCESSING_ERROR',
        details: error.message
      });
    }
  });
});

// Enhanced AI analysis with document context
app.post('/api/ai/analyze-with-documents', async (req, res) => {
  try {
    console.log('문서 기반 AI 분석 요청:', req.body);

    const {
      domain,
      areas,
      description,
      tools,
      materials,
      userId,
      department,
      position,
      documentSummary
    } = req.body;

    // 문서 내용을 포함한 분석 입력 구성
    const analysisInput = {
      domain: domain || '',
      areas: areas || [],
      description: description || '',
      tools: tools || [],
      materials: materials || [],
      documentContext: documentSummary || null,
      userContext: {
        userId: userId || 'unknown',
        department: department || 'Unknown',
        position: position || 'Unknown'
      }
    };

    // 문서 키워드가 있으면 분석에 포함
    if (documentSummary && documentSummary.keywords) {
      analysisInput.extractedKeywords = documentSummary.keywords;
    }

    // Claude 서비스를 통한 AI 분석
    const analysis = await claudeService.analyzeWorkTasks(analysisInput);

    console.log('문서 기반 AI 분석 완료');
    res.json({
      ...analysis,
      documentInsights: documentSummary ? {
        filesProcessed: documentSummary.totalFiles,
        keywordsFound: documentSummary.keywords,
        contentLength: documentSummary.extractedContent?.length || 0
      } : null
    });

  } catch (error) {
    console.error('문서 기반 AI 분석 오류:', error);
    res.status(500).json({
      error: '문서 기반 AI 분석 중 오류가 발생했습니다.',
      fallback: claudeService.getFallbackAnalysis()
    });
  }
});

// Generate downloadable template package
app.post('/api/templates/generate-package', async (req, res) => {
  try {
    console.log('템플릿 패키지 생성 요청:', req.body);

    const { task, scenario, options } = req.body;

    if (!task) {
      return res.status(400).json({
        error: '작업 정보가 필요합니다.',
        code: 'MISSING_TASK'
      });
    }

    // 패키지 생성 옵션 설정
    const packageOptions = {
      includePrompts: options?.includePrompts !== false,
      includeWorkflows: options?.includeWorkflows !== false,
      includeCode: options?.includeCode !== false,
      ...options
    };

    // 템플릿 패키지 생성
    const packageInfo = await templateGenerator.generateDownloadPackage(
      task,
      scenario,
      packageOptions
    );

    console.log('템플릿 패키지 생성 완료:', packageInfo.packageId);

    res.json({
      success: true,
      message: '템플릿 패키지가 생성되었습니다.',
      package: packageInfo
    });

  } catch (error) {
    console.error('템플릿 패키지 생성 오류:', error);
    res.status(500).json({
      error: '템플릿 패키지 생성 중 오류가 발생했습니다.',
      code: 'PACKAGE_GENERATION_ERROR',
      details: error.message
    });
  }
});

// Download generated template package
app.get('/api/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'generated_templates', filename);

    // 파일 존재 확인
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({
        error: '요청하신 파일을 찾을 수 없습니다.',
        code: 'FILE_NOT_FOUND'
      });
    }

    // 파일 다운로드
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('파일 다운로드 오류:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: '파일 다운로드 중 오류가 발생했습니다.',
            code: 'DOWNLOAD_ERROR'
          });
        }
      } else {
        console.log(`파일 다운로드 완료: ${filename}`);
      }
    });

  } catch (error) {
    console.error('다운로드 처리 오류:', error);
    res.status(500).json({
      error: '다운로드 처리 중 오류가 발생했습니다.',
      code: 'DOWNLOAD_PROCESSING_ERROR'
    });
  }
});

// Get individual template (prompt, workflow, code)
app.post('/api/templates/generate-single', async (req, res) => {
  try {
    console.log('개별 템플릿 생성 요청:', req.body);

    const { task, templateType, agentType, language, scenario } = req.body;

    if (!task || !templateType) {
      return res.status(400).json({
        error: '작업 정보와 템플릿 타입이 필요합니다.',
        code: 'MISSING_PARAMETERS'
      });
    }

    let template;

    switch (templateType) {
      case 'prompt':
        if (!agentType) {
          return res.status(400).json({
            error: '프롬프트 생성에는 에이전트 타입이 필요합니다.',
            code: 'MISSING_AGENT_TYPE'
          });
        }
        template = templateGenerator.generatePromptTemplate(task, agentType, scenario);
        break;

      case 'workflow':
        template = templateGenerator.generateN8nWorkflow(task, scenario);
        break;

      case 'code':
        const codeLanguage = language || 'python';
        template = {
          language: codeLanguage,
          code: templateGenerator.generateCodeSnippets(task, codeLanguage)
        };
        break;

      default:
        return res.status(400).json({
          error: '지원하지 않는 템플릿 타입입니다.',
          code: 'INVALID_TEMPLATE_TYPE',
          supportedTypes: ['prompt', 'workflow', 'code']
        });
    }

    console.log(`${templateType} 템플릿 생성 완료`);

    res.json({
      success: true,
      templateType: templateType,
      template: template
    });

  } catch (error) {
    console.error('개별 템플릿 생성 오류:', error);
    res.status(500).json({
      error: '템플릿 생성 중 오류가 발생했습니다.',
      code: 'TEMPLATE_GENERATION_ERROR',
      details: error.message
    });
  }
});

// Participant dashboard route
app.get('/participant/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = sampleUsers.find(u => u.id === userId && u.role === 'PARTICIPANT');

  if (!user) {
    return res.status(404).send('Participant not found');
  }

  res.send(getParticipantDashboardHTML(user));
});

// Task management API for participants
app.post('/api/participant/:userId/tasks', (req, res) => {
  const userId = req.params.userId;
  const { title, description, priority, category, estimatedHours } = req.body;

  if (!participantTasks[userId]) {
    participantTasks[userId] = [];
  }

  const newTask = {
    id: Date.now().toString(),
    title,
    description,
    priority: priority || 'medium',
    category: category || 'process',
    estimatedHours: estimatedHours || 1,
    status: 'backlog',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId
  };

  participantTasks[userId].push(newTask);
  res.json(newTask);
});

app.get('/api/participant/:userId/tasks', (req, res) => {
  const userId = req.params.userId;
  const tasks = participantTasks[userId] || [];
  res.json(tasks);
});

app.put('/api/participant/:userId/tasks/:taskId', (req, res) => {
  const { userId, taskId } = req.params;
  const { status, title, description, priority, category, estimatedHours } = req.body;

  if (!participantTasks[userId]) {
    return res.status(404).json({ error: 'User tasks not found' });
  }

  const taskIndex = participantTasks[userId].findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const task = participantTasks[userId][taskIndex];
  if (status) task.status = status;
  if (title) task.title = title;
  if (description) task.description = description;
  if (priority) task.priority = priority;
  if (category) task.category = category;
  if (estimatedHours) task.estimatedHours = estimatedHours;
  task.updatedAt = new Date().toISOString();

  res.json(task);
});

// HRD progress tracking API
app.get('/api/hrd/progress', (req, res) => {
  const allStats = {
    totalTasks: 0,
    activeParticipants: 0,
    completedTasks: 0,
    participants: []
  };

  // Calculate stats for each participant
  Object.keys(participantTasks).forEach(userId => {
    const userTasks = participantTasks[userId] || [];
    const user = sampleUsers.find(u => u.id === userId);

    if (user && userTasks.length > 0) {
      const completedTasks = userTasks.filter(t => t.status === 'done').length;
      const inProgressTasks = userTasks.filter(t => t.status === 'progress').length;
      const totalTasks = userTasks.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      allStats.totalTasks += totalTasks;
      allStats.completedTasks += completedTasks;
      if (totalTasks > 0) allStats.activeParticipants++;

      allStats.participants.push({
        id: userId,
        name: user.name,
        department: user.department,
        totalTasks,
        completedTasks,
        inProgressTasks,
        completionRate,
        efficiencyGain: Math.round(completionRate * 0.65) // Estimated efficiency gain
      });
    }
  });

  allStats.overallCompletionRate = allStats.totalTasks > 0 ?
    Math.round((allStats.completedTasks / allStats.totalTasks) * 100) : 0;
  allStats.averageEfficiency = allStats.participants.length > 0 ?
    Math.round(allStats.participants.reduce((sum, p) => sum + p.efficiencyGain, 0) / allStats.participants.length) : 0;

  res.json(allStats);
});

// Function to generate participant dashboard HTML
function getParticipantDashboardHTML(user) {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SK 업무재설계 플랫폼 - ${user.name} 개인 대시보드</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
    <style>
        .kanban-column {
            min-height: 400px;
        }
        .task-card {
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .task-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .sortable-ghost {
            opacity: 0.5;
        }
        .priority-high { border-left: 4px solid #ef4444; }
        .priority-medium { border-left: 4px solid #f59e0b; }
        .priority-low { border-left: 4px solid #10b981; }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-red-600 text-white p-4">
        <div class="container mx-auto flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzJkMzc0OCI+U0s8L3RleHQ+Cjwvc3ZnPg==" alt="SK" class="w-8 h-8">
                <div>
                    <h1 class="text-xl font-bold">SK 업무재설계 플랫폼</h1>
                    <p class="text-red-200 text-sm">${user.name} - ${user.department} ${user.position}</p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2 bg-red-700 px-3 py-1 rounded-full">
                    <span class="text-red-200">개인 작업공간</span>
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <button onclick="window.location.href='/'" class="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition">
                    <i class="fas fa-arrow-left mr-2"></i>
                    메인으로
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
        <!-- Progress Overview -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-chart-line text-blue-600 mr-3"></i>
                나의 업무재설계 진행현황
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="text-3xl font-bold text-blue-600" id="total-tasks">0</div>
                    <div class="text-sm text-gray-600">총 업무</div>
                </div>
                <div class="text-center p-4 bg-yellow-50 rounded-lg">
                    <div class="text-3xl font-bold text-yellow-600" id="in-progress-tasks">0</div>
                    <div class="text-sm text-gray-600">진행중</div>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                    <div class="text-3xl font-bold text-green-600" id="completed-tasks">0</div>
                    <div class="text-sm text-gray-600">완료</div>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <div class="text-3xl font-bold text-purple-600" id="efficiency-gain">0%</div>
                    <div class="text-sm text-gray-600">효율성 향상</div>
                </div>
            </div>
        </div>

        <!-- Work Redesign Workshop -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-800">
                    <i class="fas fa-magic text-purple-600 mr-2"></i>
                    AI 업무재설계 워크샵
                </h3>
                <button id="start-workshop-btn" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                    <i class="fas fa-rocket mr-2"></i>
                    워크샵 시작
                </button>
            </div>

            <!-- Progress Indicator -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm text-gray-600">진행률</span>
                    <span class="text-sm text-gray-600" id="workshop-progress-text">0/6 단계</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-purple-600 h-2 rounded-full transition-all duration-300" id="workshop-progress-bar" style="width: 0%"></div>
                </div>
            </div>

            <!-- Step Indicators -->
            <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6" id="step-indicators">
                <div class="step-indicator text-center p-3 bg-gray-50 rounded-lg cursor-pointer" data-step="1">
                    <div class="text-2xl mb-2">📝</div>
                    <h4 class="font-medium text-sm">도메인 정의</h4>
                    <p class="text-xs text-gray-600">업무 영역 분류</p>
                </div>
                <div class="step-indicator text-center p-3 bg-gray-50 rounded-lg cursor-pointer" data-step="2">
                    <div class="text-2xl mb-2">📁</div>
                    <h4 class="font-medium text-sm">자료 입력</h4>
                    <p class="text-xs text-gray-600">문서 업로드</p>
                </div>
                <div class="step-indicator text-center p-3 bg-gray-50 rounded-lg cursor-pointer" data-step="3">
                    <div class="text-2xl mb-2">🤖</div>
                    <h4 class="font-medium text-sm">AI 분석</h4>
                    <p class="text-xs text-gray-600">업무 구조화</p>
                </div>
                <div class="step-indicator text-center p-3 bg-gray-50 rounded-lg cursor-pointer" data-step="4">
                    <div class="text-2xl mb-2">⚡</div>
                    <h4 class="font-medium text-sm">자동화 분류</h4>
                    <p class="text-xs text-gray-600">AI Agent 매칭</p>
                </div>
                <div class="step-indicator text-center p-3 bg-gray-50 rounded-lg cursor-pointer" data-step="5">
                    <div class="text-2xl mb-2">🎯</div>
                    <h4 class="font-medium text-sm">우선순위</h4>
                    <p class="text-xs text-gray-600">Quick Win 선정</p>
                </div>
                <div class="step-indicator text-center p-3 bg-gray-50 rounded-lg cursor-pointer" data-step="6">
                    <div class="text-2xl mb-2">🚀</div>
                    <h4 class="font-medium text-sm">실행도구</h4>
                    <p class="text-xs text-gray-600">프롬프트 제공</p>
                </div>
            </div>

            <!-- Workshop Content Area -->
            <div id="workshop-content" class="hidden">
                <!-- Step 1: Domain Definition -->
                <div id="step-1" class="workshop-step hidden">
                    <h4 class="text-lg font-bold text-gray-800 mb-4">
                        📝 1단계: 업무 영역 정의
                    </h4>
                    <p class="text-gray-600 mb-4">당신의 주요 업무를 3-5개 영역으로 나눠주세요.</p>

                    <div class="space-y-3 mb-6" id="domain-inputs">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                            <input type="text" class="domain-input flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="예: 데이터 분석 및 리포팅">
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                            <input type="text" class="domain-input flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="예: 팀원 관리 및 협업">
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                            <input type="text" class="domain-input flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="예: 프로젝트 기획 및 실행">
                        </div>
                    </div>

                    <button class="add-domain-btn bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition mb-4">
                        <i class="fas fa-plus mr-2"></i>
                        영역 추가
                    </button>

                    <div class="flex justify-end">
                        <button class="next-step-btn bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                            다음 단계 →
                        </button>
                    </div>
                </div>

                <!-- Step 2: Material Input -->
                <div id="step-2" class="workshop-step hidden">
                    <h4 class="text-lg font-bold text-gray-800 mb-4">
                        📁 2단계: 업무 자료 입력
                    </h4>
                    <p class="text-gray-600 mb-4">기획서, 업무일지, 리포트 등 업무 관련 자료를 입력해주세요.</p>

                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">업무 자료 및 프로세스</label>
                        <textarea id="materials-input" class="w-full h-40 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="업무 프로세스, 사용 도구, 소요 시간, 문제점 등을 자유롭게 입력해주세요...

예시:
- 주간 리포트 작성: 매주 월요일 3시간 소요
- 데이터 수집: Excel, GA4에서 수동으로 복사
- 팀 미팅: 매주 화요일 1시간, 안건 정리에 30분 추가
- 문제점: 반복 작업이 많고, 데이터 정합성 체크에 시간 소요"></textarea>
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">주요 사용 도구</label>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" class="tool-checkbox" value="Excel">
                                <span class="text-sm">Excel</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" class="tool-checkbox" value="PowerPoint">
                                <span class="text-sm">PowerPoint</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" class="tool-checkbox" value="Google Analytics">
                                <span class="text-sm">Google Analytics</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" class="tool-checkbox" value="Slack">
                                <span class="text-sm">Slack</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" class="tool-checkbox" value="Notion">
                                <span class="text-sm">Notion</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" class="tool-checkbox" value="JIRA">
                                <span class="text-sm">JIRA</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" class="tool-checkbox" value="Figma">
                                <span class="text-sm">Figma</span>
                            </label>
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" class="tool-checkbox" value="기타">
                                <span class="text-sm">기타</span>
                            </label>
                        </div>
                    </div>

                    <div class="flex justify-between">
                        <button class="prev-step-btn bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition">
                            ← 이전 단계
                        </button>
                        <button class="next-step-btn bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                            AI 분석 시작 →
                        </button>
                    </div>
                </div>

                <!-- Additional steps will be added here -->
            </div>

            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4" id="workshop-intro">
                <p class="text-purple-800 text-sm">
                    <i class="fas fa-lightbulb text-purple-600 mr-2"></i>
                    체계적인 6단계 프로세스를 통해 당신의 업무를 AI 관점에서 재설계해보세요.
                    완료 후 즉시 사용 가능한 자동화 도구와 프롬프트를 받을 수 있습니다.
                </p>
            </div>
        </div>

        <!-- Task Creation -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-800">
                    <i class="fas fa-plus-circle text-green-600 mr-2"></i>
                    새 업무 분석하기
                </h3>
                <button id="add-task-btn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    <i class="fas fa-plus mr-2"></i>
                    업무 추가
                </button>
            </div>

            <div id="task-form" class="hidden">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">업무 제목</label>
                        <input type="text" id="task-title" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="예: 월간 보고서 작성 프로세스">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">업무 분류</label>
                        <select id="task-category" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="process">프로세스 개선</option>
                            <option value="automation">자동화</option>
                            <option value="collaboration">협업 최적화</option>
                            <option value="monitoring">모니터링</option>
                            <option value="efficiency">효율성 향상</option>
                        </select>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">업무 설명</label>
                        <textarea id="task-description" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="현재 어떤 방식으로 처리하고 있는지, 어떤 문제가 있는지 설명해주세요..."></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                        <select id="task-priority" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="high">높음</option>
                            <option value="medium" selected>보통</option>
                            <option value="low">낮음</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">예상 소요시간 (시간)</label>
                        <input type="number" id="task-hours" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value="2" min="0.5" step="0.5">
                    </div>
                </div>
                <div class="flex justify-end space-x-3 mt-4">
                    <button id="cancel-task-btn" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">취소</button>
                    <button id="save-task-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        <i class="fas fa-save mr-2"></i>
                        업무 저장
                    </button>
                </div>
            </div>
        </div>

        <!-- Individual Kanban Board -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-6">
                <i class="fas fa-columns text-blue-600 mr-2"></i>
                나의 업무재설계 칸반보드
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="kanban-column">
                    <div class="bg-gray-100 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-700 mb-3 flex items-center">
                            <i class="fas fa-inbox text-gray-600 mr-2"></i>
                            백로그
                            <span class="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full" id="backlog-count">0</span>
                        </h4>
                        <div id="backlog-tasks" class="space-y-3 min-h-[300px]">
                            <!-- 백로그 업무들이 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>

                <div class="kanban-column">
                    <div class="bg-yellow-50 rounded-lg p-4">
                        <h4 class="font-semibold text-yellow-700 mb-3 flex items-center">
                            <i class="fas fa-play text-yellow-600 mr-2"></i>
                            진행중
                            <span class="ml-auto bg-yellow-200 text-yellow-600 text-xs px-2 py-1 rounded-full" id="progress-count">0</span>
                        </h4>
                        <div id="progress-tasks" class="space-y-3 min-h-[300px]">
                            <!-- 진행중 업무들이 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>

                <div class="kanban-column">
                    <div class="bg-blue-50 rounded-lg p-4">
                        <h4 class="font-semibold text-blue-700 mb-3 flex items-center">
                            <i class="fas fa-eye text-blue-600 mr-2"></i>
                            검토중
                            <span class="ml-auto bg-blue-200 text-blue-600 text-xs px-2 py-1 rounded-full" id="review-count">0</span>
                        </h4>
                        <div id="review-tasks" class="space-y-3 min-h-[300px]">
                            <!-- 검토중 업무들이 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>

                <div class="kanban-column">
                    <div class="bg-green-50 rounded-lg p-4">
                        <h4 class="font-semibold text-green-700 mb-3 flex items-center">
                            <i class="fas fa-check text-green-600 mr-2"></i>
                            완료
                            <span class="ml-auto bg-green-200 text-green-600 text-xs px-2 py-1 rounded-full" id="done-count">0</span>
                        </h4>
                        <div id="done-tasks" class="space-y-3 min-h-[300px]">
                            <!-- 완료된 업무들이 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        const userId = '${user.id}';
        let tasks = [];

        // Initialize sortable columns
        const columns = ['backlog', 'progress', 'review', 'done'];
        columns.forEach(column => {
            new Sortable(document.getElementById(column + '-tasks'), {
                group: 'kanban',
                animation: 150,
                onEnd: function(evt) {
                    const taskId = evt.item.dataset.taskId;
                    const newStatus = evt.to.id.replace('-tasks', '');
                    updateTaskStatus(taskId, newStatus);
                }
            });
        });

        // Task form handlers
        document.getElementById('add-task-btn').addEventListener('click', () => {
            document.getElementById('task-form').classList.remove('hidden');
            document.getElementById('add-task-btn').classList.add('hidden');
        });

        document.getElementById('cancel-task-btn').addEventListener('click', () => {
            document.getElementById('task-form').classList.add('hidden');
            document.getElementById('add-task-btn').classList.remove('hidden');
            clearTaskForm();
        });

        document.getElementById('save-task-btn').addEventListener('click', saveTask);

        // Workshop state
        let currentWorkshopStep = 0;
        let workshopData = {
            domains: [],
            materials: '',
            analysis: {},
            automations: [],
            priorities: [],
            tools: []
        };

        // Workshop handlers
        document.getElementById('start-workshop-btn').addEventListener('click', startWorkshop);

        function startWorkshop() {
            document.getElementById('workshop-intro').classList.add('hidden');
            document.getElementById('workshop-content').classList.remove('hidden');
            showWorkshopStep(1);
        }

        function showWorkshopStep(step) {
            // Hide all steps
            document.querySelectorAll('.workshop-step').forEach(s => s.classList.add('hidden'));

            // Show current step
            const stepElement = document.getElementById('step-' + step);
            if (stepElement) {
                stepElement.classList.remove('hidden');
            }

            // Update progress
            currentWorkshopStep = step;
            updateWorkshopProgress();
            updateStepIndicators();
        }

        function updateWorkshopProgress() {
            const progress = (currentWorkshopStep / 6) * 100;
            document.getElementById('workshop-progress-bar').style.width = progress + '%';
            document.getElementById('workshop-progress-text').textContent = currentWorkshopStep + '/6 단계';
        }

        function updateStepIndicators() {
            document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
                const stepNum = index + 1;
                indicator.classList.remove('bg-purple-100', 'bg-green-100', 'bg-gray-50');

                if (stepNum < currentWorkshopStep) {
                    indicator.classList.add('bg-green-100'); // Completed
                } else if (stepNum === currentWorkshopStep) {
                    indicator.classList.add('bg-purple-100'); // Current
                } else {
                    indicator.classList.add('bg-gray-50'); // Not started
                }
            });
        }

        // Domain addition functionality
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('add-domain-btn')) {
                addDomainInput();
            }

            if (e.target.classList.contains('next-step-btn')) {
                handleNextStep();
            }

            if (e.target.classList.contains('prev-step-btn')) {
                handlePrevStep();
            }
        });

        function addDomainInput() {
            const container = document.getElementById('domain-inputs');
            const currentInputs = container.querySelectorAll('.domain-input').length;

            if (currentInputs < 5) {
                const newInput = document.createElement('div');
                newInput.className = 'flex items-center space-x-3';
                newInput.innerHTML =
                    '<div class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">' + (currentInputs + 1) + '</div>' +
                    '<input type="text" class="domain-input flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="예: 추가 업무 영역">';
                container.appendChild(newInput);
            }
        }

        function handleNextStep() {
            if (currentWorkshopStep === 1) {
                // Collect domain data
                const domains = Array.from(document.querySelectorAll('.domain-input'))
                    .map(input => input.value.trim())
                    .filter(value => value.length > 0);

                if (domains.length < 3) {
                    alert('최소 3개의 업무 영역을 입력해주세요.');
                    return;
                }

                workshopData.domains = domains;
                showWorkshopStep(2);
            } else if (currentWorkshopStep === 2) {
                // Collect materials data
                const materials = document.getElementById('materials-input').value.trim();
                const tools = Array.from(document.querySelectorAll('.tool-checkbox:checked')).map(cb => cb.value);

                if (materials.length < 50) {
                    alert('업무 자료를 더 자세히 입력해주세요 (최소 50자).');
                    return;
                }

                workshopData.materials = materials;
                workshopData.tools = tools;
                addStep3();
                showWorkshopStep(3);
            } else if (currentWorkshopStep === 3) {
                // Skip AI analysis (simulated)
                addStep4();
                showWorkshopStep(4);
            } else if (currentWorkshopStep === 4) {
                // Collect automation selections
                addStep5();
                showWorkshopStep(5);
            } else if (currentWorkshopStep === 5) {
                // Collect priorities
                addStep6();
                showWorkshopStep(6);
            } else if (currentWorkshopStep === 6) {
                // Complete workshop and generate tasks
                completeWorkshop();
            }
        }

        function handlePrevStep() {
            if (currentWorkshopStep > 1) {
                showWorkshopStep(currentWorkshopStep - 1);
            }
        }

        function addStep3() {
            const container = document.getElementById('workshop-content');
            const step3HTML = '<div>Step 3 placeholder</div>';
            container.insertAdjacentHTML('beforeend', step3HTML);
        }

        function addStep4() {
            const container = document.getElementById('workshop-content');
            const step4HTML = '<div>Step 4 placeholder</div>';
            container.insertAdjacentHTML('beforeend', step4HTML);
        }

        function addStep5() {
            const container = document.getElementById('workshop-content');
            const step5HTML = '<div>Step 5 placeholder</div>';
            container.insertAdjacentHTML('beforeend', step5HTML);
        }

        function addStep6() {
            const container = document.getElementById('workshop-content');
            const step6HTML = '<div>Step 6 placeholder</div>';
            container.insertAdjacentHTML('beforeend', step6HTML);
        }

        function completeWorkshop() {
            // Generate tasks based on workshop data
            const priorities = Array.from(document.querySelectorAll('input[name="priority"]:checked')).map(cb => cb.value);

            priorities.forEach((priority, index) => {
                const taskData = generateTaskFromPriority(priority, index + 1);
                createTaskFromWorkshop(taskData);
            });

            // Hide workshop and show success message
            document.getElementById('workshop-content').innerHTML = '<div class="text-center py-12"><h3>워크샵 완료!</h3><button onclick="location.reload()">대시보드로 돌아가기</button></div>';
        }

        function generateTaskFromPriority(priority, index) {
            const taskMap = {
                'data-dashboard': {
                    title: '자동 데이터 대시보드 구축',
                    description: 'Looker Studio와 API 연동을 통한 실시간 데이터 대시보드 구축',
                    category: 'automation',
                    priority: 'high',
                    estimatedHours: 8
                },
                'report-automation': {
                    title: 'AI 리포트 자동 생성 시스템',
                    description: 'Claude API를 활용한 주간/월간 리포트 자동 생성',
                    category: 'automation',
                    priority: 'medium',
                    estimatedHours: 12
                },
                'monitoring-alerts': {
                    title: '실시간 모니터링 알림 시스템',
                    description: '이상 상황 감지 및 Slack 자동 알림 설정',
                    category: 'monitoring',
                    priority: 'medium',
                    estimatedHours: 6
                }
            };

            return taskMap[priority] || taskMap['data-dashboard'];
        }

        async function createTaskFromWorkshop(taskData) {
            try {
                const response = await axios.post('/api/participant/' + userId + '/tasks', taskData);
                tasks.push(response.data);
            } catch (error) {
                console.error('Error creating workshop task:', error);
            }
        }

        function clearTaskForm() {
            document.getElementById('task-title').value = '';
            document.getElementById('task-description').value = '';
            document.getElementById('task-category').selectedIndex = 0;
            document.getElementById('task-priority').selectedIndex = 1;
            document.getElementById('task-hours').value = '2';
        }

        async function saveTask() {
            const title = document.getElementById('task-title').value.trim();
            const description = document.getElementById('task-description').value.trim();
            const category = document.getElementById('task-category').value;
            const priority = document.getElementById('task-priority').value;
            const estimatedHours = parseFloat(document.getElementById('task-hours').value);

            if (!title || !description) {
                alert('업무 제목과 설명을 입력해주세요.');
                return;
            }

            try {
                const response = await axios.post('/api/participant/' + userId + '/tasks', {
                    title,
                    description,
                    category,
                    priority,
                    estimatedHours
                });

                tasks.push(response.data);
                renderTasks();
                clearTaskForm();
                document.getElementById('task-form').classList.add('hidden');
                document.getElementById('add-task-btn').classList.remove('hidden');
                updateStats();
            } catch (error) {
                console.error('Error saving task:', error);
                alert('업무 저장 중 오류가 발생했습니다.');
            }
        }

        async function loadTasks() {
            try {
                const response = await axios.get('/api/participant/' + userId + '/tasks');
                tasks = response.data;
                renderTasks();
                updateStats();
            } catch (error) {
                console.error('Error loading tasks:', error);
            }
        }

        async function updateTaskStatus(taskId, newStatus) {
            try {
                const response = await axios.put('/api/participant/' + userId + '/tasks/' + taskId, {
                    status: newStatus
                });

                const taskIndex = tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex] = response.data;
                    updateStats();
                }
            } catch (error) {
                console.error('Error updating task status:', error);
                loadTasks(); // Reload on error
            }
        }

        function renderTasks() {
            columns.forEach(column => {
                const container = document.getElementById(column + '-tasks');
                const columnTasks = tasks.filter(task => task.status === column);

                container.innerHTML = columnTasks.map(task => createTaskCard(task)).join('');

                // Update count
                document.getElementById(column.replace('progress', 'in-progress') + '-count').textContent = columnTasks.length;
            });
        }

        function createTaskCard(task) {
            const priorityClass = 'priority-' + task.priority;
            const categoryColors = {
                'process': 'bg-blue-100 text-blue-800',
                'automation': 'bg-purple-100 text-purple-800',
                'collaboration': 'bg-green-100 text-green-800',
                'monitoring': 'bg-yellow-100 text-yellow-800',
                'efficiency': 'bg-red-100 text-red-800'
            };

            return '<div class="task-card bg-white p-4 rounded-lg border ' + priorityClass + ' cursor-move" data-task-id="' + task.id + '">' +
                '<div class="flex items-start justify-between mb-2">' +
                    '<h5 class="font-semibold text-gray-800 text-sm leading-tight">' + task.title + '</h5>' +
                    '<span class="text-xs px-2 py-1 rounded ' + (categoryColors[task.category] || 'bg-gray-100 text-gray-800') + '">' + task.category + '</span>' +
                '</div>' +
                '<p class="text-gray-600 text-xs mb-3 line-clamp-2">' + task.description + '</p>' +
                '<div class="flex items-center justify-between text-xs text-gray-500">' +
                    '<div class="flex items-center space-x-2">' +
                        '<i class="fas fa-clock"></i>' +
                        '<span>' + task.estimatedHours + 'h</span>' +
                    '</div>' +
                    '<div class="flex items-center space-x-1">' +
                        '<div class="w-2 h-2 rounded-full ' + (task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500') + '"></div>' +
                        '<span>' + task.priority + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }

        function updateStats() {
            const totalTasks = tasks.length;
            const inProgressTasks = tasks.filter(t => t.status === 'progress').length;
            const completedTasks = tasks.filter(t => t.status === 'done').length;
            const efficiencyGain = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 65) : 0;

            document.getElementById('total-tasks').textContent = totalTasks;
            document.getElementById('in-progress-tasks').textContent = inProgressTasks;
            document.getElementById('completed-tasks').textContent = completedTasks;
            document.getElementById('efficiency-gain').textContent = efficiencyGain + '%';
        }

        // Initialize
        loadTasks();
    </script>
</body>
</html>
  `;
}

// Serve personalized work redesign demo
app.get('/work-redesign-demo.html', (req, res) => {
  const fs = require('fs');
  const path = require('path');

  try {
    const userId = req.query.user || 'user1';
    const user = sampleUsers.find(u => u.id === userId && u.role === 'PARTICIPANT') || sampleUsers[1];

    const demoPath = path.join(__dirname, '../work-redesign-demo.html');
    let demoContent = fs.readFileSync(demoPath, 'utf8');

    // Personalize the content
    demoContent = demoContent.replace(/김스크 팀장/g, `${user.name} 팀장`);
    demoContent = demoContent.replace(/마케팅팀/g, `${user.department}팀`);
    demoContent = demoContent.replace(/SK텔레콤 마케팅팀/g, `SK ${user.department}팀`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(demoContent);
  } catch (error) {
    console.error('Error serving demo file:', error);
    res.status(404).send('Demo file not found');
  }
});

// Serve demo frontend
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SK Work Redesign Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Login Screen -->
    <div id="login-screen" class="min-h-screen flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-blue-600 mb-2">
                    <i class="fas fa-cogs mr-3"></i>
                    SK Work Redesign
                </h1>
                <p class="text-gray-600">신임 팀장 업무 재설계 플랫폼</p>
            </div>

            <div class="space-y-4">
                <button onclick="loginAs('hrd')" class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center">
                    <i class="fas fa-user-tie mr-3"></i>
                    <div class="text-left">
                        <div class="font-semibold">HRD 담당자로 로그인</div>
                        <div class="text-blue-100 text-sm">워크샵 생성 및 관리</div>
                    </div>
                </button>

                <div class="border-t pt-4">
                    <p class="text-sm text-gray-600 mb-3 text-center">팀장으로 참여하기</p>
                    <div class="space-y-2">
                        <button onclick="loginAs('user1')" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition flex items-center">
                            <i class="fas fa-user mr-3"></i>
                            <div>
                                <div class="font-medium">김철수 팀장</div>
                                <div class="text-green-100 text-xs">IT 부서</div>
                            </div>
                        </button>
                        <button onclick="loginAs('user2')" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition flex items-center">
                            <i class="fas fa-user mr-3"></i>
                            <div>
                                <div class="font-medium">이영희 팀장</div>
                                <div class="text-green-100 text-xs">Marketing 부서</div>
                            </div>
                        </button>
                        <button onclick="loginAs('user3')" class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition flex items-center">
                            <i class="fas fa-user mr-3"></i>
                            <div>
                                <div class="font-medium">박민수 팀장</div>
                                <div class="text-green-100 text-xs">Finance 부서</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main App -->
    <div id="main-app" class="hidden">
        <!-- Header -->
        <header class="bg-blue-600 text-white shadow-lg">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-cogs text-2xl"></i>
                        <h1 class="text-xl font-bold">SK Work Redesign Platform</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div id="user-info" class="text-blue-200"></div>
                        <button onclick="logout()" class="bg-blue-700 px-3 py-1 rounded hover:bg-blue-800 transition">
                            <i class="fas fa-sign-out-alt mr-1"></i> 로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Content -->
        <main id="app-content" class="container mx-auto px-4 py-8">
            <!-- Content will be loaded here based on user role -->
        </main>
    </div>

    <script>
        let currentUser = null;
        let sessionId = null;

        // 로그인 함수
        async function loginAs(userType) {
            try {
                const response = await axios.post('/api/auth/login', { userType });

                if (response.data.success) {
                    currentUser = response.data.user;
                    sessionId = response.data.sessionId;

                    // 세션 저장 (간단한 데모용)
                    localStorage.setItem('sessionId', sessionId);
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    // UI 업데이트
                    document.getElementById('login-screen').classList.add('hidden');
                    document.getElementById('main-app').classList.remove('hidden');
                    document.getElementById('user-info').textContent = \`\\\${currentUser.name} (\\\${currentUser.department})\`;

                    // 역할별 콘텐츠 로드
                    if (currentUser.role === 'FACILITATOR') {
                        loadHRDDashboard();
                    } else {
                        loadParticipantDashboard();
                    }
                }
            } catch (error) {
                alert('로그인에 실패했습니다.');
                console.error('Login error:', error);
            }
        }

        // 로그아웃 함수
        function logout() {
            localStorage.removeItem('sessionId');
            localStorage.removeItem('currentUser');
            location.reload();
        }

        // HRD 담당자 대시보드
        function loadHRDDashboard() {
            const content = document.getElementById('app-content');
            content.innerHTML = '<div>HRD Dashboard placeholder</div>';
            loadWorkshopsForHRD();
        }

        // 팀장 참여자 대시보드
        function loadParticipantDashboard() {
            const content = document.getElementById('app-content');
            content.innerHTML = \`
                <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-user text-green-600 mr-3"></i>
                        \\\${currentUser.name}님의 업무 재설계
                    </h2>

                    <!-- 참여 가능한 워크샵 -->
                    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 class="text-lg font-semibold mb-4">참여 가능한 워크샵</h3>
                        <div id="available-workshops" class="space-y-3">
                            <!-- 워크샵 목록이 여기에 로드됩니다 -->
                        </div>
                    </div>

                    <!-- 나의 업무 분석 폼 -->
                    <div id="my-analysis-section" class="bg-white rounded-lg shadow-md p-6 hidden">
                        <h3 class="text-lg font-semibold mb-4">
                            <i class="fas fa-clipboard-list text-blue-600 mr-2"></i>
                            나의 업무 분석
                        </h3>
                        <form id="analysis-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">현재 담당 업무 및 프로세스</label>
                                <textarea id="current-processes" rows="4" class="w-full border rounded-lg px-3 py-2" placeholder="현재 수행하고 있는 주요 업무와 프로세스를 상세히 설명해주세요"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">업무상 어려움과 문제점</label>
                                <textarea id="pain-points" rows="4" class="w-full border rounded-lg px-3 py-2" placeholder="현재 업무에서 겪고 있는 어려움, 비효율적인 부분, 개선이 필요한 점들을 설명해주세요"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">개선 목표 및 기대효과</label>
                                <textarea id="goals" rows="4" class="w-full border rounded-lg px-3 py-2" placeholder="어떤 목표를 달성하고 싶으신지, 개선 후 기대하는 효과를 설명해주세요"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">팀 구성 및 현황</label>
                                <textarea id="team-info" rows="3" class="w-full border rounded-lg px-3 py-2" placeholder="현재 팀 구성원, 각자의 역할, 팀 내 업무 분담 현황을 설명해주세요"></textarea>
                            </div>
                            <button type="submit" class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
                                <i class="fas fa-paper-plane mr-2"></i>
                                분석 제출하기
                            </button>
                        </form>
                    </div>

                    <!-- AI 분석 결과 -->
                    <div id="ai-results-section" class="bg-white rounded-lg shadow-md p-6 hidden">
                        <h3 class="text-lg font-semibold mb-4">
                            <i class="fas fa-robot text-purple-600 mr-2"></i>
                            AI 분석 결과
                        </h3>
                        <div id="ai-results-content">
                            <!-- AI 분석 결과가 여기에 표시됩니다 -->
                        </div>
                    </div>

                    <!-- 개인 Kanban 보드 -->
                    <div id="personal-kanban-section" class="bg-white rounded-lg shadow-md p-6 hidden">
                        <h3 class="text-lg font-semibold mb-4">
                            <i class="fas fa-columns text-blue-600 mr-2"></i>
                            나의 업무 재설계 보드
                        </h3>
                        <div id="personal-kanban" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <!-- 개인 Kanban 보드가 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>
            \`;

            loadAvailableWorkshops();
        }

        // 필요한 함수들 구현
        function showCreateWorkshopModal() {
            document.getElementById('create-workshop-modal').classList.remove('hidden');
        }

        function hideCreateWorkshopModal() {
            document.getElementById('create-workshop-modal').classList.add('hidden');
        }

        async function loadWorkshopsForHRD() {
            try {
                const response = await axios.get('/api/workshops');
                const workshops = response.data;
                const container = document.getElementById('workshops-grid');

                container.innerHTML = workshops.map(workshop => \`
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">\\\${workshop.title}</h3>
                            <span class="px-2 py-1 rounded text-xs \\\${
                                workshop.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                workshop.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }">\\\${workshop.status}</span>
                        </div>
                        <p class="text-gray-600 text-sm mb-4">\\\${workshop.description}</p>
                        <div class="space-y-2">
                            <div class="flex items-center justify-between text-sm">
                                <span class="text-gray-500">참여자</span>
                                <span>\\\${workshop.participants ? workshop.participants.length : 0}/\\\${workshop.maxParticipants || '∞'}</span>
                            </div>
                            <div class="text-xs text-gray-500">생성: \\\${new Date(workshop.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div class="mt-4 pt-4 border-t">
                            <div class="flex space-x-2">
                                <button onclick="viewWorkshopDetails('\\\${workshop.id}')" class="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200">
                                    상세보기
                                </button>
                                <button onclick="manageWorkshop('\\\${workshop.id}')" class="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-200">
                                    관리
                                </button>
                            </div>
                        </div>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Error loading workshops:', error);
            }
        }

        async function loadAvailableWorkshops() {
            try {
                const response = await axios.get('/api/workshops');
                const workshops = response.data.filter(w => w.status === 'ACTIVE');
                const container = document.getElementById('available-workshops');

                container.innerHTML = workshops.map(workshop => \`
                    <div class="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <h4 class="font-semibold">\\\${workshop.title}</h4>
                            <p class="text-sm text-gray-600">\\\${workshop.description}</p>
                            <div class="text-xs text-gray-500 mt-1">
                                참여자: \\\${workshop.participants ? workshop.participants.length : 0}/\\\${workshop.maxParticipants || '∞'}
                            </div>
                        </div>
                        <button onclick="joinWorkshop('\\\${workshop.id}')" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                            참여하기
                        </button>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Error loading workshops:', error);
            }
        }

        async function joinWorkshop(workshopId) {
            try {
                const response = await axios.post(\`/api/workshops/\\\${workshopId}/join\`, {}, {
                    headers: { Authorization: sessionId }
                });

                if (response.data.success) {
                    alert('워크샵에 성공적으로 참여했습니다!');
                    document.getElementById('my-analysis-section').classList.remove('hidden');
                    currentWorkshopId = workshopId;
                }
            } catch (error) {
                alert('워크샵 참여에 실패했습니다: ' + (error.response?.data?.error || error.message));
            }
        }

        let currentWorkshopId = null;

        // 분석 폼 제출
        document.addEventListener('DOMContentLoaded', function() {
            document.addEventListener('submit', async function(e) {
                if (e.target.id === 'analysis-form') {
                    e.preventDefault();

                    const formData = {
                        currentProcesses: document.getElementById('current-processes').value,
                        painPoints: document.getElementById('pain-points').value,
                        goals: document.getElementById('goals').value,
                        teamInfo: document.getElementById('team-info').value
                    };

                    try {
                        const response = await axios.post(\`/api/workshops/\\\${currentWorkshopId}/my-analysis\`, formData, {
                            headers: { Authorization: sessionId }
                        });

                        if (response.data.success) {
                            alert('분석이 성공적으로 제출되었습니다!');

                            // AI 분석 시작
                            document.getElementById('ai-results-section').classList.remove('hidden');
                            showAIAnalysis();
                        }
                    } catch (error) {
                        alert('분석 제출에 실패했습니다: ' + (error.response?.data?.error || error.message));
                    }
                }
            });
        });

        function showAIAnalysis() {
            const content = document.getElementById('ai-results-content');
            content.innerHTML = \`
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-3xl text-purple-600 mb-4"></i>
                    <p class="text-gray-600">AI가 당신의 업무를 분석하고 있습니다...</p>
                </div>
            \`;

            // 2초 후 결과 표시 (실제로는 AI 분석 API 호출)
            setTimeout(() => {
                content.innerHTML = \`
                    <div class="space-y-4">
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 class="font-semibold text-green-800 mb-2">✅ 분석 완료!</h4>
                            <p class="text-green-700 text-sm">당신의 \\\${currentUser.department} 부서 업무에 대한 최적화 방안을 생성했습니다.</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="text-center p-4 bg-blue-50 rounded-lg">
                                <div class="text-2xl font-bold text-blue-600">5개</div>
                                <div class="text-sm text-blue-700">최적화 태스크</div>
                            </div>
                            <div class="text-center p-4 bg-green-50 rounded-lg">
                                <div class="text-2xl font-bold text-green-600">40%</div>
                                <div class="text-sm text-green-700">효율성 향상</div>
                            </div>
                            <div class="text-center p-4 bg-purple-50 rounded-lg">
                                <div class="text-2xl font-bold text-purple-600">3개월</div>
                                <div class="text-sm text-purple-700">구현 기간</div>
                            </div>
                        </div>

                        <button onclick="showPersonalKanban()" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
                            <i class="fas fa-columns mr-2"></i>
                            나의 재설계 보드 시작하기
                        </button>
                    </div>
                \`;
            }, 2000);
        }

        function showPersonalKanban() {
            document.getElementById('personal-kanban-section').classList.remove('hidden');

            const kanbanContainer = document.getElementById('personal-kanban');
            kanbanContainer.innerHTML = \`
                <div class="bg-gray-100 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-700 mb-3">📋 할 일</h4>
                    <div class="space-y-2">
                        <div class="bg-white p-3 rounded border">
                            <div class="font-medium text-sm">프로세스 자동화 도구 도입</div>
                            <div class="text-xs text-gray-500 mt-1">예상: 2주</div>
                        </div>
                        <div class="bg-white p-3 rounded border">
                            <div class="font-medium text-sm">팀 소통 체계 개선</div>
                            <div class="text-xs text-gray-500 mt-1">예상: 1주</div>
                        </div>
                    </div>
                </div>

                <div class="bg-yellow-100 p-4 rounded-lg">
                    <h4 class="font-medium text-yellow-700 mb-3">🔄 진행 중</h4>
                    <div class="space-y-2">
                        <div class="bg-white p-3 rounded border">
                            <div class="font-medium text-sm">현재 업무 프로세스 분석</div>
                            <div class="text-xs text-gray-500 mt-1">진행률: 80%</div>
                        </div>
                    </div>
                </div>

                <div class="bg-blue-100 p-4 rounded-lg">
                    <h4 class="font-medium text-blue-700 mb-3">👀 검토</h4>
                    <div class="space-y-2">
                        <div class="bg-white p-3 rounded border">
                            <div class="font-medium text-sm">업무 우선순위 재정립</div>
                            <div class="text-xs text-gray-500 mt-1">검토 대기</div>
                        </div>
                    </div>
                </div>

                <div class="bg-green-100 p-4 rounded-lg">
                    <h4 class="font-medium text-green-700 mb-3">✅ 완료</h4>
                    <div class="space-y-2">
                        <div class="bg-white p-3 rounded border">
                            <div class="font-medium text-sm">현재 상황 분석 완료</div>
                            <div class="text-xs text-gray-500 mt-1">2024.11.05</div>
                        </div>
                    </div>
                </div>
            \`;
        }

        // 더미 함수들
        function viewWorkshopDetails(id) {
            alert('워크샵 상세보기 기능 (개발 중)');
        }

        function manageWorkshop(id) {
            alert('워크샵 관리 기능 (개발 중)');
        }

        // 페이지 로드 시 세션 확인
        document.addEventListener('DOMContentLoaded', function() {
            const savedSessionId = localStorage.getItem('sessionId');
            const savedUser = localStorage.getItem('currentUser');

            if (savedSessionId && savedUser) {
                sessionId = savedSessionId;
                currentUser = JSON.parse(savedUser);

                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('main-app').classList.remove('hidden');
                document.getElementById('user-info').textContent = \`\\\${currentUser.name} (\\\${currentUser.department})\`;

                if (currentUser.role === 'FACILITATOR') {
                    loadHRDDashboard();
                } else {
                    loadParticipantDashboard();
                }
            }
        });
                <div class="flex items-center space-x-4">
                    <span class="text-blue-200">Demo Mode</span>
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
        <!-- Welcome Section -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">
                <i class="fas fa-rocket text-blue-600 mr-3"></i>
                Welcome to SK Work Redesign Platform
            </h2>
            <p class="text-gray-600 text-lg mb-6">
                AI-powered workspace where SK new team managers can redesign their work processes in just 35 minutes!
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <i class="fas fa-brain text-3xl text-blue-600 mb-2"></i>
                    <h3 class="font-semibold">Multi-Agent AI</h3>
                    <p class="text-sm text-gray-600">Smart analysis with multiple AI agents</p>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                    <i class="fas fa-tasks text-3xl text-green-600 mb-2"></i>
                    <h3 class="font-semibold">Kanban Board</h3>
                    <p class="text-sm text-gray-600">Real-time drag & drop task management</p>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <i class="fas fa-clock text-3xl text-purple-600 mb-2"></i>
                    <h3 class="font-semibold">35-Minute Goal</h3>
                    <p class="text-sm text-gray-600">Complete work redesign in 35 minutes</p>
                </div>
            </div>
        </div>

        <!-- Quick Access - Team Manager Dashboards -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-users text-green-600 mr-2"></i>
                팀장 개인 작업공간 바로가기
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="/participant/user1" class="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">김</div>
                        <div>
                            <h4 class="font-semibold text-gray-800">김철수 팀장</h4>
                            <p class="text-sm text-gray-600">IT 부서</p>
                            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">개인 작업공간</span>
                        </div>
                    </div>
                </a>
                <a href="/participant/user2" class="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">이</div>
                        <div>
                            <h4 class="font-semibold text-gray-800">이영희 팀장</h4>
                            <p class="text-sm text-gray-600">Marketing 부서</p>
                            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">개인 작업공간</span>
                        </div>
                    </div>
                </a>
                <a href="/participant/user3" class="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">박</div>
                        <div>
                            <h4 class="font-semibold text-gray-800">박민수 팀장</h4>
                            <p class="text-sm text-gray-600">Finance 부서</p>
                            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">개인 작업공간</span>
                        </div>
                    </div>
                </a>
            </div>
        </div>

        <!-- HRD Progress Overview -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-chart-pie text-purple-600 mr-2"></i>
                전체 진행 현황 (HRD 관리자용)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="text-3xl font-bold text-blue-600" id="total-all-tasks">0</div>
                    <div class="text-sm text-gray-600">전체 업무</div>
                </div>
                <div class="text-center p-4 bg-yellow-50 rounded-lg">
                    <div class="text-3xl font-bold text-yellow-600" id="active-participants">0</div>
                    <div class="text-sm text-gray-600">활성 참여자</div>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                    <div class="text-3xl font-bold text-green-600" id="completion-rate">0%</div>
                    <div class="text-sm text-gray-600">완료율</div>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <div class="text-3xl font-bold text-purple-600" id="avg-efficiency">0%</div>
                    <div class="text-sm text-gray-600">평균 효율성</div>
                </div>
            </div>

            <!-- Participant Progress Details -->
            <div class="mt-6">
                <h4 class="font-semibold text-gray-800 mb-3">참여자별 상세 진행률</h4>
                <div class="space-y-3" id="participant-progress">
                    <!-- Progress bars will be loaded here -->
                </div>
            </div>
        </div>

        <!-- Current Workshops -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-800">
                    <i class="fas fa-project-diagram text-blue-600 mr-2"></i>
                    Current Workshops
                </h3>
                <button id="create-workshop-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <i class="fas fa-plus mr-2"></i>
                    New Workshop
                </button>
            </div>
            <div id="workshops-list" class="space-y-4">
                <!-- Workshops will be loaded here -->
            </div>
        </div>

        <!-- Workshop Creation Modal -->
        <div id="workshop-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-plus-circle text-blue-600 mr-2"></i>
                        Create New Workshop
                    </h3>
                    <button id="close-modal" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <form id="workshop-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Workshop Title</label>
                        <input type="text" id="workshop-title" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Marketing Process Automation">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="workshop-description" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Describe what processes you want to redesign..."></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select id="workshop-department" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Select Department</option>
                                <option value="IT">IT</option>
                                <option value="HR">HR</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Finance">Finance</option>
                                <option value="Operations">Operations</option>
                                <option value="Sales">Sales</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                            <select id="workshop-timeline" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="1 month">1 month</option>
                                <option value="3 months" selected>3 months</option>
                                <option value="6 months">6 months</option>
                                <option value="1 year">1 year</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Current Pain Points</label>
                        <textarea id="workshop-painpoints" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="What problems are you facing? (e.g., manual processes, delays, errors)"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Desired Goals</label>
                        <textarea id="workshop-goals" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="What do you want to achieve? (e.g., 50% time reduction, automation)"></textarea>
                    </div>

                    <div class="flex items-center justify-end space-x-3 pt-4">
                        <button type="button" id="cancel-workshop" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            <i class="fas fa-rocket mr-2"></i>
                            Create Workshop
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Demo Kanban Board -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-columns text-blue-600 mr-2"></i>
                Demo Kanban Board
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-gray-100 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-700 mb-3">Backlog</h4>
                    <div id="backlog-tasks" class="space-y-2">
                        <!-- Tasks will be loaded here -->
                    </div>
                </div>
                <div class="bg-yellow-50 rounded-lg p-4">
                    <h4 class="font-semibold text-yellow-700 mb-3">In Progress</h4>
                    <div id="progress-tasks" class="space-y-2">
                        <!-- Tasks will be loaded here -->
                    </div>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                    <h4 class="font-semibold text-blue-700 mb-3">Review</h4>
                    <div id="review-tasks" class="space-y-2">
                        <!-- Tasks will be loaded here -->
                    </div>
                </div>
                <div class="bg-green-50 rounded-lg p-4">
                    <h4 class="font-semibold text-green-700 mb-3">Done</h4>
                    <div id="done-tasks" class="space-y-2">
                        <!-- Tasks will be loaded here -->
                    </div>
                </div>
            </div>
        </div>

        <!-- AI Analysis Demo -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-magic text-purple-600 mr-2"></i>
                AI Analysis Demo
            </h3>
            <div class="mb-4">
                <button id="analyze-btn" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                    <i class="fas fa-play mr-2"></i>
                    Start AI Analysis
                </button>
            </div>
            <div id="analysis-result" class="hidden">
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 class="font-semibold text-purple-800 mb-2">Analysis Complete!</h4>
                    <div id="analysis-content">
                        <!-- Analysis results will appear here -->
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Load workshops
        async function loadWorkshops() {
            try {
                const response = await axios.get('/api/workshops');
                const workshops = response.data;
                const container = document.getElementById('workshops-list');

                container.innerHTML = workshops.map(workshop => \`
                    <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-semibold text-gray-800">\\\${workshop.title}</h4>
                                <p class="text-gray-600 text-sm">\\\${workshop.description}</p>
                            </div>
                            <div class="text-right">
                                <span class="px-2 py-1 rounded text-xs \\\${
                                    workshop.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                    workshop.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }">\\\${workshop.status}</span>
                                <div class="text-sm text-gray-500 mt-1">\\\${workshop.progress}% Complete</div>
                            </div>
                        </div>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Error loading workshops:', error);
            }
        }

        // Load tasks
        async function loadTasks() {
            try {
                const response = await axios.get('/api/workshops/1/tasks');
                const tasks = response.data;

                // Clear existing tasks
                document.getElementById('backlog-tasks').innerHTML = '';
                document.getElementById('progress-tasks').innerHTML = '';
                document.getElementById('review-tasks').innerHTML = '';
                document.getElementById('done-tasks').innerHTML = '';

                tasks.forEach(task => {
                    const taskCard = \\\`
                        <div class="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                            <h5 class="font-medium text-gray-800 text-sm">\\\${task.title}</h5>
                            <p class="text-gray-600 text-xs mt-1">\\\${task.description}</p>
                            <div class="flex items-center justify-between mt-2">
                                <span class="px-2 py-1 rounded text-xs \\\${
                                    task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }">\\\${task.priority}</span>
                                <span class="text-xs text-gray-500">\\\${task.estimatedHours}h</span>
                            </div>
                        </div>
                    \\\`;

                    const column = task.status === 'BACKLOG' ? 'backlog-tasks' :
                                 task.status === 'IN_PROGRESS' ? 'progress-tasks' :
                                 task.status === 'REVIEW' ? 'review-tasks' : 'done-tasks';

                    document.getElementById(column).innerHTML += taskCard;
                });
            } catch (error) {
                console.error('Error loading tasks:', error);
            }
        }

        // AI Analysis
        document.getElementById('analyze-btn').addEventListener('click', async function() {
            const btn = this;
            const result = document.getElementById('analysis-result');
            const content = document.getElementById('analysis-content');

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analyzing...';

            try {
                const response = await axios.post('/api/ai/analyze', {
                    department: 'IT',
                    processes: ['Manual monitoring', 'Email tickets'],
                    goals: ['Automation', 'Efficiency']
                });

                const analysis = response.data;
                content.innerHTML = \`
                    <h5 class="font-medium mb-2">Generated \\\${analysis.tasks.length} optimization tasks:</h5>
                    <ul class="space-y-1">
                        \\\${analysis.tasks.map(task => \\\`
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                <span class="text-sm">\\\${task.title} (\\\${task.estimatedHours}h)</span>
                            </li>
                        \\\`).join('')}
                    </ul>
                    <div class="mt-3">
                        <h5 class="font-medium mb-2">Recommended Implementation Scenario:</h5>
                        <p class="text-sm text-purple-700">\\\${analysis.scenarios[0].title}</p>
                        <p class="text-xs text-purple-600 mt-1">\\\${analysis.scenarios[0].description}</p>
                    </div>
                \`;

                result.classList.remove('hidden');
            } catch (error) {
                console.error('Error during analysis:', error);
                content.innerHTML = '<p class="text-red-600 text-sm">Analysis failed. Please try again.</p>';
                result.classList.remove('hidden');
            }

            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-play mr-2"></i>Start AI Analysis';
        });

        // Workshop Modal Functions
        const modal = document.getElementById('workshop-modal');
        const createBtn = document.getElementById('create-workshop-btn');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-workshop');
        const form = document.getElementById('workshop-form');

        // Open modal
        createBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });

        // Close modal
        const closeModal = () => {
            modal.classList.add('hidden');
            form.reset();
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                title: document.getElementById('workshop-title').value,
                description: document.getElementById('workshop-description').value,
                department: document.getElementById('workshop-department').value,
                timeline: document.getElementById('workshop-timeline').value,
                painPoints: document.getElementById('workshop-painpoints').value,
                goals: document.getElementById('workshop-goals').value
            };

            // Validate required fields
            if (!formData.title || !formData.description || !formData.department) {
                alert('Please fill in all required fields (Title, Description, Department)');
                return;
            }

            try {
                const response = await axios.post('/api/workshops', formData);

                if (response.status === 201) {
                    const workshop = response.data;

                    // Show success message with workflow start option
                    const successDiv = document.createElement('div');
                    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm';
                    successDiv.innerHTML = \\\`
                        <div class="mb-3">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-check-circle mr-2"></i>
                                Workshop "\\\${formData.title}" created!
                            </div>
                            <div class="text-green-100 text-sm">Ready to start your 35-minute redesign process?</div>
                        </div>
                        <div class="flex space-x-2">
                            <button id="start-workflow-\\\${workshop.id}" class="bg-white text-green-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition">
                                🚀 Start Workflow
                            </button>
                            <button id="dismiss-\\\${workshop.id}" class="bg-green-600 text-white px-3 py-1 rounded text-sm border border-green-300 hover:bg-green-700 transition">
                                Later
                            </button>
                        </div>
                    \\\`;
                    document.body.appendChild(successDiv);

                    // Handle workflow start
                    document.getElementById(\`start-workflow-\\\${workshop.id}\`).addEventListener('click', () => {
                        startWorkshopWorkflow(workshop);
                        document.body.removeChild(successDiv);
                    });

                    // Handle dismiss
                    document.getElementById(\`dismiss-\\\${workshop.id}\`).addEventListener('click', () => {
                        document.body.removeChild(successDiv);
                    });

                    // Auto remove after 10 seconds
                    setTimeout(() => {
                        if (document.body.contains(successDiv)) {
                            document.body.removeChild(successDiv);
                        }
                    }, 10000);

                    // Close modal and reload workshops
                    closeModal();
                    loadWorkshops();
                } else {
                    throw new Error('Failed to create workshop');
                }
            } catch (error) {
                console.error('Error creating workshop:', error);
                alert('Failed to create workshop. Please try again.');
            }
        });

        // 35-Minute Workshop Workflow Function
        async function startWorkshopWorkflow(workshop) {
            // Hide main dashboard and show workflow interface
            document.querySelector('main').innerHTML = \`
                <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">\${workshop.title}</h2>
                            <p class="text-gray-600">\${workshop.description}</p>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-500">Target Time</div>
                            <div class="text-2xl font-bold text-blue-600" id="workflow-timer">35:00</div>
                        </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="w-full bg-gray-200 rounded-full h-3 mb-6">
                        <div id="workflow-progress" class="bg-blue-600 h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                    </div>

                    <!-- Workflow Steps -->
                    <div id="workflow-steps" class="space-y-6">
                        <!-- Steps will be dynamically loaded here -->
                    </div>
                </div>
            \`;

            // Start the 35-minute workflow
            const steps = [
                {
                    id: 1,
                    title: "📋 Process Analysis Setup",
                    description: "Define current processes and pain points",
                    duration: 5,
                    action: () => showProcessAnalysisStep(workshop)
                },
                {
                    id: 2,
                    title: "🤖 AI Analysis Phase",
                    description: "AI agents analyze and generate optimization tasks",
                    duration: 8,
                    action: () => showAIAnalysisStep(workshop)
                },
                {
                    id: 3,
                    title: "📊 Task Planning & Prioritization",
                    description: "Organize tasks in Kanban board and set priorities",
                    duration: 12,
                    action: () => showKanbanPlanningStep(workshop)
                },
                {
                    id: 4,
                    title: "👥 Team Assignment & Scenarios",
                    description: "Assign tasks to team members and select implementation scenario",
                    duration: 7,
                    action: () => showTeamAssignmentStep(workshop)
                },
                {
                    id: 5,
                    title: "📈 Review & Export Results",
                    description: "Final review and export implementation plan",
                    duration: 3,
                    action: () => showReviewExportStep(workshop)
                }
            ];

            let currentStep = 0;
            let startTime = Date.now();
            let totalDuration = 35 * 60; // 35 minutes in seconds

            // Timer function
            function updateTimer() {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const remaining = Math.max(0, totalDuration - elapsed);
                const minutes = Math.floor(remaining / 60);
                const seconds = remaining % 60;
                document.getElementById('workflow-timer').textContent =
                    \`\\\${minutes.toString().padStart(2, '0')}:\\\${seconds.toString().padStart(2, '0')}\`;

                // Update progress
                const progress = (elapsed / totalDuration) * 100;
                document.getElementById('workflow-progress').style.width = \`\\\${Math.min(progress, 100)}%\`;

                if (remaining > 0) {
                    setTimeout(updateTimer, 1000);
                } else {
                    // Time's up!
                    showTimeUpMessage();
                }
            }

            // Start timer
            updateTimer();

            // Execute first step
            executeWorkflowStep(steps, currentStep, workshop);
        }

        function executeWorkflowStep(steps, stepIndex, workshop) {
            const step = steps[stepIndex];
            const stepsContainer = document.getElementById('workflow-steps');

            // Mark current step as active
            stepsContainer.innerHTML = steps.map((s, index) => \`
                <div class="flex items-center p-4 rounded-lg border \\\${
                    index === stepIndex ? 'border-blue-500 bg-blue-50' :
                    index < stepIndex ? 'border-green-500 bg-green-50' :
                    'border-gray-200 bg-gray-50'
                }">
                    <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center \\\${
                        index === stepIndex ? 'bg-blue-500 text-white' :
                        index < stepIndex ? 'bg-green-500 text-white' :
                        'bg-gray-300 text-gray-600'
                    }">
                        \\\${index < stepIndex ? '✓' : index + 1}
                    </div>
                    <div class="ml-4 flex-1">
                        <h3 class="font-semibold \\\${index === stepIndex ? 'text-blue-800' : index < stepIndex ? 'text-green-800' : 'text-gray-600'}">
                            \\\${s.title}
                        </h3>
                        <p class="text-sm \\\${index === stepIndex ? 'text-blue-600' : index < stepIndex ? 'text-green-600' : 'text-gray-500'}">
                            \\\${s.description}
                        </p>
                    </div>
                    <div class="text-sm text-gray-500">\\\${s.duration} min</div>
                </div>
            \`).join('');

            // Execute current step action
            step.action();

            // Auto-proceed to next step after duration (for demo purposes, shortened)
            setTimeout(() => {
                if (stepIndex < steps.length - 1) {
                    executeWorkflowStep(steps, stepIndex + 1, workshop);
                } else {
                    showWorkflowComplete(workshop);
                }
            }, step.duration * 1000); // Convert to seconds for demo (normally would be minutes)
        }

        function showProcessAnalysisStep(workshop) {
            // Add step content below the steps
            const stepContent = document.createElement('div');
            stepContent.id = 'current-step-content';
            stepContent.className = 'mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg';
            stepContent.innerHTML = \`
                <h4 class="font-bold text-blue-800 mb-3">📋 Step 1: Process Analysis Setup</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h5 class="font-medium mb-2">Current Processes:</h5>
                        <p class="text-sm text-gray-700 bg-white p-3 rounded">\${workshop.painPoints || 'Analyzing current workflows...'}</p>
                    </div>
                    <div>
                        <h5 class="font-medium mb-2">Target Goals:</h5>
                        <p class="text-sm text-gray-700 bg-white p-3 rounded">\${workshop.goals || 'Identifying optimization opportunities...'}</p>
                    </div>
                </div>
                <div class="mt-4 flex items-center text-blue-600">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    <span class="text-sm">Analyzing current state...</span>
                </div>
            \`;

            document.getElementById('workflow-steps').appendChild(stepContent);
        }

        function showAIAnalysisStep(workshop) {
            const existingContent = document.getElementById('current-step-content');
            if (existingContent) existingContent.remove();

            const stepContent = document.createElement('div');
            stepContent.id = 'current-step-content';
            stepContent.className = 'mt-6 p-6 bg-purple-50 border border-purple-200 rounded-lg';
            stepContent.innerHTML = \`
                <h4 class="font-bold text-purple-800 mb-3">🤖 Step 2: AI Multi-Agent Analysis</h4>
                <div class="space-y-3">
                    <div class="flex items-center text-purple-600">
                        <i class="fas fa-brain mr-3"></i>
                        <span class="text-sm">TaskAgent: Identifying optimization tasks...</span>
                        <i class="fas fa-spinner fa-spin ml-2"></i>
                    </div>
                    <div class="flex items-center text-purple-600">
                        <i class="fas fa-search mr-3"></i>
                        <span class="text-sm">AnalysisAgent: Evaluating process efficiency...</span>
                        <i class="fas fa-spinner fa-spin ml-2"></i>
                    </div>
                    <div class="flex items-center text-purple-600">
                        <i class="fas fa-users mr-3"></i>
                        <span class="text-sm">CoordinatorAgent: Planning team structure...</span>
                        <i class="fas fa-spinner fa-spin ml-2"></i>
                    </div>
                </div>
                <div class="mt-4 p-3 bg-white rounded border">
                    <div class="text-sm text-gray-600">AI Analysis Results:</div>
                    <div class="text-sm text-green-600 mt-1">✓ Found 5 automation opportunities</div>
                    <div class="text-sm text-green-600">✓ Identified 3 efficiency bottlenecks</div>
                    <div class="text-sm text-green-600">✓ Generated 8 optimization tasks</div>
                </div>
            \`;

            document.getElementById('workflow-steps').appendChild(stepContent);
        }

        function showKanbanPlanningStep(workshop) {
            const existingContent = document.getElementById('current-step-content');
            if (existingContent) existingContent.remove();

            const stepContent = document.createElement('div');
            stepContent.id = 'current-step-content';
            stepContent.className = 'mt-6 p-6 bg-green-50 border border-green-200 rounded-lg';
            stepContent.innerHTML = \`
                <h4 class="font-bold text-green-800 mb-3">📊 Step 3: Interactive Kanban Planning</h4>
                <div class="grid grid-cols-4 gap-3">
                    <div class="bg-gray-100 p-3 rounded">
                        <h5 class="font-medium text-gray-700 mb-2">Backlog</h5>
                        <div class="space-y-2">
                            <div class="bg-white p-2 rounded text-xs">Process Automation Framework</div>
                            <div class="bg-white p-2 rounded text-xs">Email Integration System</div>
                        </div>
                    </div>
                    <div class="bg-yellow-100 p-3 rounded">
                        <h5 class="font-medium text-yellow-700 mb-2">In Progress</h5>
                        <div class="space-y-2">
                            <div class="bg-white p-2 rounded text-xs">Monitoring Dashboard</div>
                        </div>
                    </div>
                    <div class="bg-blue-100 p-3 rounded">
                        <h5 class="font-medium text-blue-700 mb-2">Review</h5>
                        <div class="space-y-2">
                            <div class="bg-white p-2 rounded text-xs">Data Analysis Tool</div>
                        </div>
                    </div>
                    <div class="bg-green-100 p-3 rounded">
                        <h5 class="font-medium text-green-700 mb-2">Done</h5>
                        <div class="space-y-2">
                            <div class="bg-white p-2 rounded text-xs">Requirements Analysis</div>
                        </div>
                    </div>
                </div>
                <div class="mt-4 text-green-600 text-sm">
                    <i class="fas fa-mouse-pointer mr-2"></i>
                    Drag & drop tasks to organize your implementation plan
                </div>
            \`;

            document.getElementById('workflow-steps').appendChild(stepContent);
        }

        function showTeamAssignmentStep(workshop) {
            const existingContent = document.getElementById('current-step-content');
            if (existingContent) existingContent.remove();

            const stepContent = document.createElement('div');
            stepContent.id = 'current-step-content';
            stepContent.className = 'mt-6 p-6 bg-orange-50 border border-orange-200 rounded-lg';
            stepContent.innerHTML = \`
                <h4 class="font-bold text-orange-800 mb-3">👥 Step 4: Team Assignment & Scenarios</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h5 class="font-medium mb-2">Recommended Team Structure:</h5>
                        <div class="space-y-2">
                            <div class="flex items-center p-2 bg-white rounded border">
                                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">TA</div>
                                <div class="ml-3">
                                    <div class="text-sm font-medium">Task Agent</div>
                                    <div class="text-xs text-gray-500">Implementation & Automation</div>
                                </div>
                            </div>
                            <div class="flex items-center p-2 bg-white rounded border">
                                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">AA</div>
                                <div class="ml-3">
                                    <div class="text-sm font-medium">Analysis Agent</div>
                                    <div class="text-xs text-gray-500">Quality & Testing</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h5 class="font-medium mb-2">Implementation Scenario:</h5>
                        <div class="p-3 bg-white rounded border">
                            <div class="font-medium text-sm">Agile Implementation</div>
                            <div class="text-xs text-gray-600 mt-1">2-week sprints, iterative delivery</div>
                            <div class="text-xs text-orange-600 mt-2">
                                <i class="fas fa-clock mr-1"></i>
                                Timeline: ${workshop.timeline}
                            </div>
                        </div>
                    </div>
                </div>
            \`;

            document.getElementById('workflow-steps').appendChild(stepContent);
        }

        function showReviewExportStep(workshop) {
            const existingContent = document.getElementById('current-step-content');
            if (existingContent) existingContent.remove();

            const stepContent = document.createElement('div');
            stepContent.id = 'current-step-content';
            stepContent.className = 'mt-6 p-6 bg-indigo-50 border border-indigo-200 rounded-lg';
            stepContent.innerHTML = \`
                <h4 class="font-bold text-indigo-800 mb-3">📈 Step 5: Review & Export</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center p-4 bg-white rounded border">
                        <div class="text-2xl font-bold text-indigo-600">8</div>
                        <div class="text-sm text-gray-600">Tasks Generated</div>
                    </div>
                    <div class="text-center p-4 bg-white rounded border">
                        <div class="text-2xl font-bold text-green-600">65%</div>
                        <div class="text-sm text-gray-600">Expected Efficiency Gain</div>
                    </div>
                    <div class="text-center p-4 bg-white rounded border">
                        <div class="text-2xl font-bold text-blue-600">${workshop.timeline}</div>
                        <div class="text-sm text-gray-600">Implementation Timeline</div>
                    </div>
                </div>
                <div class="mt-4 flex space-x-3">
                    <button class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition">
                        <i class="fas fa-file-pdf mr-2"></i>
                        Export PDF Report
                    </button>
                    <button class="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">
                        <i class="fas fa-file-excel mr-2"></i>
                        Export Excel Plan
                    </button>
                </div>
            \`;

            document.getElementById('workflow-steps').appendChild(stepContent);
        }

        function showWorkflowComplete(workshop) {
            const existingContent = document.getElementById('current-step-content');
            if (existingContent) existingContent.remove();

            const stepContent = document.createElement('div');
            stepContent.id = 'current-step-content';
            stepContent.className = 'mt-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center';
            stepContent.innerHTML = \`
                <div class="text-6xl mb-4">🎉</div>
                <h4 class="text-2xl font-bold text-green-800 mb-2">Workshop Complete!</h4>
                <p class="text-green-600 mb-4">Your work redesign plan has been generated successfully.</p>
                <div class="flex justify-center space-x-3">
                    <button onclick="location.reload()" class="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition">
                        <i class="fas fa-home mr-2"></i>
                        Back to Dashboard
                    </button>
                    <button class="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 transition">
                        <i class="fas fa-rocket mr-2"></i>
                        Start Implementation
                    </button>
                </div>
            \`;

            document.getElementById('workflow-steps').appendChild(stepContent);
        }

        // Load HRD progress data
        async function loadHRDProgress() {
            try {
                const response = await axios.get('/api/hrd/progress');
                const stats = response.data;

                // Update summary stats
                document.getElementById('total-all-tasks').textContent = stats.totalTasks;
                document.getElementById('active-participants').textContent = stats.activeParticipants;
                document.getElementById('completion-rate').textContent = stats.overallCompletionRate + '%';
                document.getElementById('avg-efficiency').textContent = stats.averageEfficiency + '%';

                // Update participant progress
                const container = document.getElementById('participant-progress');
                container.innerHTML = stats.participants.map(participant => \`
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                \\\${participant.name.charAt(0)}
                            </div>
                            <div>
                                <h5 class="font-semibold text-gray-800">\\\${participant.name}</h5>
                                <p class="text-sm text-gray-600">\\\${participant.department} • \\\${participant.totalTasks}개 업무</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="text-right">
                                <div class="text-sm font-medium">\\\${participant.completionRate}% 완료</div>
                                <div class="text-xs text-gray-500">효율성 \\\${participant.efficiencyGain}%</div>
                            </div>
                            <div class="w-24 bg-gray-200 rounded-full h-2">
                                <div class="bg-green-500 h-2 rounded-full transition-all duration-300" style="width: \\\${participant.completionRate}%"></div>
                            </div>
                            <a href="/participant/\\\${participant.id}" class="text-blue-600 hover:text-blue-800 text-sm">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Error loading HRD progress:', error);
            }
        }

        // Initialize
        loadWorkshops();
        loadTasks();
        loadHRDProgress();

        // Refresh HRD data every 30 seconds
        setInterval(loadHRDProgress, 30000);
    </script>
</body>
</html>
  `);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
server.listen(PORT, () => {
  console.log(`
🚀 SK Work Redesign Platform Demo Server Running!

📍 Server: http://localhost:${PORT}
🔗 API Health: http://localhost:${PORT}/api/health
📊 Dashboard: http://localhost:${PORT}

✨ Features Available:
- Multi-Agent AI Analysis
- Real-time Kanban Board
- Workshop Management
- 35-minute Workflow Demo

🎯 Ready for SK Group managers to redesign their work processes!
  `);
});

module.exports = app;