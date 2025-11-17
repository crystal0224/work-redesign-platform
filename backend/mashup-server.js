// Work Redesign Platform - 매시업 백엔드 서버
// 프론트엔드 개발을 위한 임시 API 서버

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 4000;

// 미들웨어 설정
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 (HTML, CSS, JS 등)
app.use(express.static(__dirname));

// 파일 업로드 설정
const upload = multer({
  dest: 'uploads/workshops/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.docx', '.pdf', '.xlsx', '.txt', '.hwp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// 메모리에 저장할 임시 데이터
let sessions = [];
let domains = [];
let tasks = [];
let aiAnalyses = [];

// 📍 Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🚀 Work Redesign Platform API Server Running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0-mashup'
  });
});

// 📍 API 문서
app.get('/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Work Redesign Platform API</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .method { color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
        .get { background: #28a745; }
        .post { background: #007bff; }
        .put { background: #ffc107; color: black; }
        .delete { background: #dc3545; }
      </style>
    </head>
    <body>
      <h1>🚀 Work Redesign Platform API</h1>
      <p>매시업 백엔드 서버 - 프론트엔드 개발용</p>

      <h2>🔧 시스템</h2>
      <div class="endpoint">
        <span class="method get">GET</span> <strong>/health</strong> - 서버 상태 확인
      </div>

      <h2>👥 세션 관리</h2>
      <div class="endpoint">
        <span class="method get">GET</span> <strong>/api/sessions</strong> - 세션 목록 조회
      </div>
      <div class="endpoint">
        <span class="method post">POST</span> <strong>/api/sessions</strong> - 새 세션 생성
      </div>
      <div class="endpoint">
        <span class="method get">GET</span> <strong>/api/sessions/:id</strong> - 세션 상세 조회
      </div>

      <h2>📁 파일 관리</h2>
      <div class="endpoint">
        <span class="method post">POST</span> <strong>/api/files/upload</strong> - 파일 업로드
      </div>

      <h2>🤖 AI 분석</h2>
      <div class="endpoint">
        <span class="method post">POST</span> <strong>/api/ai/analyze</strong> - AI 분석 시작
      </div>
      <div class="endpoint">
        <span class="method get">GET</span> <strong>/api/ai/analyses/:id</strong> - 분석 결과 조회
      </div>

      <h2>📋 태스크 관리</h2>
      <div class="endpoint">
        <span class="method get">GET</span> <strong>/api/tasks</strong> - 태스크 목록 조회
      </div>
      <div class="endpoint">
        <span class="method post">POST</span> <strong>/api/tasks</strong> - 새 태스크 생성
      </div>

      <hr>
      <p>🌐 <strong>CORS 허용 도메인:</strong> localhost:3000-3004</p>
      <p>📂 <strong>업로드 경로:</strong> uploads/workshops/</p>
      <p>📦 <strong>지원 파일:</strong> .docx, .pdf, .xlsx, .txt, .hwp</p>
    </body>
    </html>
  `);
});

// 🔐 인증 (간단한 더미 구현)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // 간단한 더미 로그인
  if (email && password) {
    res.json({
      success: true,
      user: {
        id: 'user-1',
        email: email,
        name: '테스트 사용자',
        role: 'TEAM_MEMBER'
      },
      token: 'dummy-jwt-token'
    });
  } else {
    res.status(400).json({
      success: false,
      error: '이메일과 비밀번호를 입력해주세요.'
    });
  }
});

// 👤 사용자 정보
app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: '테스트 사용자',
      role: 'TEAM_MEMBER'
    }
  });
});

// 📊 세션 관리
app.get('/api/sessions', (req, res) => {
  res.json({
    success: true,
    data: sessions,
    total: sessions.length
  });
});

app.post('/api/sessions', (req, res) => {
  const { title, description, teamId } = req.body;

  const newSession = {
    id: `session-${Date.now()}`,
    title: title || '새로운 업무 재설계 세션',
    description: description || '',
    teamId: teamId || 'team-1',
    status: 'PLANNING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  sessions.push(newSession);

  res.status(201).json({
    success: true,
    data: newSession
  });
});

app.get('/api/sessions/:id', (req, res) => {
  const session = sessions.find(s => s.id === req.params.id);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: '세션을 찾을 수 없습니다.'
    });
  }

  res.json({
    success: true,
    data: session
  });
});

// 📁 파일 업로드
app.post('/api/files/upload', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: '업로드할 파일이 없습니다.'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalName: file.originalname,
      fileName: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString()
    }));

    res.json({
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length}개 파일이 성공적으로 업로드되었습니다.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '파일 업로드 중 오류가 발생했습니다.'
    });
  }
});

// 🤖 AI 분석
app.post('/api/ai/analyze', (req, res) => {
  const { sessionId, type, prompt } = req.body;

  const analysis = {
    id: `analysis-${Date.now()}`,
    sessionId: sessionId || 'session-1',
    type: type || 'WORKFLOW_OPTIMIZATION',
    status: 'IN_PROGRESS',
    prompt: prompt || '',
    startedAt: new Date().toISOString()
  };

  aiAnalyses.push(analysis);

  // 3초 후 완료로 상태 변경 (시뮬레이션)
  setTimeout(() => {
    const existingAnalysis = aiAnalyses.find(a => a.id === analysis.id);
    if (existingAnalysis) {
      existingAnalysis.status = 'COMPLETED';
      existingAnalysis.result = {
        summary: '업무 프로세스 분석이 완료되었습니다.',
        recommendations: [
          '문서 검토 과정을 디지털화하여 처리 시간을 50% 단축',
          '반복 작업을 자동화하여 생산성 향상',
          '팀 간 커뮤니케이션 도구 도입으로 협업 효율성 증대'
        ],
        confidence: 0.85,
        estimatedTimeSaved: '주당 8시간'
      };
      existingAnalysis.completedAt = new Date().toISOString();
    }
  }, 3000);

  res.status(201).json({
    success: true,
    data: analysis,
    message: 'AI 분석이 시작되었습니다.'
  });
});

app.get('/api/ai/analyses/:id', (req, res) => {
  const analysis = aiAnalyses.find(a => a.id === req.params.id);

  if (!analysis) {
    return res.status(404).json({
      success: false,
      error: '분석 결과를 찾을 수 없습니다.'
    });
  }

  res.json({
    success: true,
    data: analysis
  });
});

// 📋 태스크 관리
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    data: tasks,
    total: tasks.length
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, description, priority, sessionId } = req.body;

  const newTask = {
    id: `task-${Date.now()}`,
    title: title || '새로운 태스크',
    description: description || '',
    status: 'BACKLOG',
    priority: priority || 'MEDIUM',
    sessionId: sessionId || 'session-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    data: newTask
  });
});

// 오류 처리
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(500).json({
    success: false,
    error: error.message || '서버 오류가 발생했습니다.'
  });
});

// 404 처리
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API 엔드포인트를 찾을 수 없습니다.',
    message: `${req.method} ${req.originalUrl}에 대한 핸들러가 없습니다.`
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`🚀 Work Redesign Platform 매시업 서버 실행 중!`);
  console.log(`📍 서버 주소: http://localhost:${port}`);
  console.log(`📚 API 문서: http://localhost:${port}/docs`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
  console.log(``);
  console.log(`🎯 지원 프론트엔드 포트: 3000-3004`);
  console.log(`📁 파일 업로드: uploads/workshops/`);
  console.log(``);
  console.log(`⚡ 프론트엔드에서 이제 API 호출이 가능합니다!`);
});

module.exports = app;