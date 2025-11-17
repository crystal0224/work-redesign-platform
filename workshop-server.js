const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const archiver = require('archiver');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const xlsx = require('xlsx');
const Anthropic = require('@anthropic-ai/sdk');

// 환경 변수 설정
require('dotenv').config({ path: './backend/.env' });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, 'uploads');
const templatesDir = path.join(__dirname, 'generated_templates');
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);
fs.mkdir(templatesDir, { recursive: true }).catch(console.error);

// Multer 설정
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const ext = path.extname(file.originalname);
    const safeName = `${timestamp}_${randomString}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`지원하지 않는 파일 형식: ${file.mimetype}`));
    }
  }
});

// Claude AI 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 메모리 저장소
const workshopsDB = new Map();
const filesDB = new Map();

// 유틸리티 함수들
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
}

function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9가-힣\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

function getFileExtension(type) {
  const map = {
    'ai_prompt': '.txt',
    'n8n_workflow': '.json',
    'python_script': '.py',
    'javascript_code': '.js'
  };
  return map[type] || '.txt';
}

function translateFrequency(freq) {
  const map = {
    daily: '일일',
    weekly: '주간',
    monthly: '월간'
  };
  return map[freq] || freq;
}

function translateAutomation(level) {
  const map = {
    high: '🟢 자동화 가능',
    medium: '🟡 부분 자동화',
    low: '🔴 자동화 어려움'
  };
  return map[level] || level;
}

// 문서 파싱 함수
async function parseDocument(filePath, mimeType) {
  console.log(`📄 파싱 시작: ${filePath}`);

  try {
    if (mimeType.includes('wordprocessingml')) {
      // DOCX
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;

    } else if (mimeType.includes('pdf')) {
      // PDF
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);
      return data.text;

    } else if (mimeType.includes('spreadsheet') || mimeType.includes('ms-excel')) {
      // XLSX/XLS
      const workbook = xlsx.readFile(filePath);
      let text = '';

      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        text += `\n[${sheetName}]\n`;
        text += json.map(row => row.join(' | ')).join('\n');
      });

      return text;
    }

    throw new Error(`지원하지 않는 파일 형식: ${mimeType}`);

  } catch (error) {
    console.error('파싱 에러:', error);
    throw error;
  }
}

// Claude AI 분석 함수
async function analyzeTasks(documentText, domains) {
  console.log('🤖 Claude AI 분석 시작');

  const systemPrompt = `당신은 업무 재설계 전문가입니다.
제공된 문서를 분석하여 반복적인 업무를 추출하고 자동화 방안을 제시하세요.

업무 영역: ${domains.join(', ')}

각 업무는 다음 정보를 포함해야 합니다:
- title: 업무명 (간결하게)
- description: 업무 설명
- timeSpent: 소요 시간 (시간 단위, 숫자)
- frequency: 빈도 (daily/weekly/monthly)
- automation: 자동화 가능성 (high/medium/low)
- automationMethod: 자동화 방법 제안 (구체적으로)
- category: 업무 영역 (위 도메인 중 하나)

JSON 배열 형식으로만 응답하세요.`;

  const userMessage = `다음 문서에서 반복적인 업무를 추출해주세요:

${documentText.substring(0, 8000)}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userMessage
      }]
    });

    const textContent = response.content[0];

    // JSON 추출
    const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('JSON 형식 없음:', textContent.text);
      return [];
    }

    const tasks = JSON.parse(jsonMatch[0]);
    console.log(`✅ ${tasks.length}개 업무 추출됨`);

    return tasks;

  } catch (error) {
    console.error('Claude API 에러:', error);
    throw error;
  }
}

// API 라우트들
app.post('/api/workshops', (req, res) => {
  try {
    const { name, domains, participantCount } = req.body;

    if (!domains || domains.length !== 3) {
      return res.status(400).json({
        success: false,
        error: '3개의 도메인이 필요합니다'
      });
    }

    const workshop = {
      id: generateId('WS'),
      name,
      domains,
      participantCount: participantCount || 1,
      status: 'domain_defined',
      createdAt: new Date(),
      tasks: [],
      files: [],
      fileIds: []
    };

    workshopsDB.set(workshop.id, workshop);
    console.log(`✅ 워크샵 생성: ${workshop.id}`);

    res.status(201).json({
      success: true,
      id: workshop.id,
      message: '워크샵이 생성되었습니다'
    });

  } catch (error) {
    console.error('워크샵 생성 에러:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

// 수동 입력 텍스트 분석 API
app.post('/api/analyze-text', async (req, res) => {
  try {
    const { workshopId, textContent, domains } = req.body;

    const workshop = workshopsDB.get(workshopId);
    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: '워크샵을 찾을 수 없습니다'
      });
    }

    if (!textContent || textContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '분석할 텍스트가 없습니다'
      });
    }

    // Claude AI로 텍스트 분석
    const tasks = await analyzeTasks(textContent, domains);

    tasks.forEach(taskData => {
      const task = {
        ...taskData,
        id: generateId('TASK'),
        sourceFileId: 'manual-input',
        sourceFilename: '직접 입력',
        workshopId: workshopId,
        createdAt: new Date()
      };
      workshop.tasks.push(task);
    });

    res.json({
      success: true,
      tasks: tasks,
      count: tasks.length,
      message: `${tasks.length}개 업무가 분석되었습니다`
    });

  } catch (error) {
    console.error('텍스트 분석 에러:', error);
    res.status(500).json({
      success: false,
      error: '텍스트 분석 중 오류가 발생했습니다'
    });
  }
});

app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  try {
    const workshopId = req.body.workshopId;

    const workshop = workshopsDB.get(workshopId);
    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: '워크샵을 찾을 수 없습니다'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: '업로드된 파일이 없습니다'
      });
    }

    const uploadedFileIds = [];

    for (const file of req.files) {
      const fileId = generateId('FILE');

      const fileRecord = {
        id: fileId,
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        workshopId: workshopId,
        uploadedAt: new Date(),
        status: 'uploaded',
        content: null
      };

      filesDB.set(fileId, fileRecord);
      uploadedFileIds.push(fileId);

      console.log(`✅ 파일 저장: ${fileId} (${file.originalname})`);
    }

    workshop.fileIds = uploadedFileIds;
    workshop.status = 'files_uploaded';
    workshop.updatedAt = new Date();

    res.json({
      success: true,
      fileIds: uploadedFileIds,
      count: req.files.length,
      message: `${req.files.length}개 파일 업로드 완료`
    });

  } catch (error) {
    console.error('업로드 에러:', error);
    res.status(500).json({
      success: false,
      error: '파일 업로드 중 오류가 발생했습니다'
    });
  }
});

// 자동화 솔루션 생성 API
app.post('/api/generate-solutions', async (req, res) => {
  try {
    const { workshopId, selectedTaskIds } = req.body;

    const workshop = workshopsDB.get(workshopId);
    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: '워크샵을 찾을 수 없습니다'
      });
    }

    const selectedTasks = workshop.tasks.filter(task => selectedTaskIds.includes(task.id));

    if (selectedTasks.length === 0) {
      return res.status(400).json({
        success: false,
        error: '선택된 업무가 없습니다'
      });
    }

    const solutions = [];

    for (const task of selectedTasks) {
      // AI 프롬프트 생성
      const promptSolution = await generateAIPrompt(task, workshop.domains);

      // n8n 워크플로우 생성
      const n8nWorkflow = await generateN8NWorkflow(task, workshop.domains);

      // Python 스크립트 생성
      const pythonScript = await generatePythonScript(task, workshop.domains);

      solutions.push({
        taskId: task.id,
        taskTitle: task.title,
        aiPrompt: promptSolution,
        n8nWorkflow: n8nWorkflow,
        pythonScript: pythonScript
      });
    }

    res.json({
      success: true,
      solutions: solutions,
      message: `${solutions.length}개 업무의 자동화 솔루션이 생성되었습니다`
    });

  } catch (error) {
    console.error('솔루션 생성 에러:', error);
    res.status(500).json({
      success: false,
      error: '솔루션 생성 중 오류가 발생했습니다'
    });
  }
});

// AI 프롬프트 생성 함수
async function generateAIPrompt(task, domains) {
  const systemPrompt = `당신은 업무 자동화 전문가입니다. 주어진 업무에 대해 실행 가능한 AI 프롬프트를 작성하세요.

업무 정보:
- 제목: ${task.title}
- 설명: ${task.description}
- 빈도: ${task.frequency}
- 소요시간: ${task.timeSpent}시간
- 업무영역: ${domains.join(', ')}

다음 형식으로 응답하세요:
1. 프롬프트 제목
2. 상세 프롬프트 (실제 AI에게 제공할 명령어)
3. 입력 변수들
4. 예상 결과

실용적이고 구체적으로 작성해주세요.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `"${task.title}" 업무에 대한 AI 자동화 프롬프트를 생성해주세요.`
      }]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('AI 프롬프트 생성 에러:', error);
    return `# ${task.title} 자동화 프롬프트\n\n업무: ${task.description}\n\n*AI 프롬프트 생성 중 오류가 발생했습니다.*`;
  }
}

// n8n 워크플로우 생성 함수
async function generateN8NWorkflow(task, domains) {
  const systemPrompt = `당신은 n8n 워크플로우 전문가입니다. 주어진 업무를 자동화하는 n8n 워크플로우 JSON을 생성하세요.

업무 정보:
- 제목: ${task.title}
- 설명: ${task.description}
- 빈도: ${task.frequency}
- 업무영역: ${domains.join(', ')}

실제 작동하는 n8n 워크플로우 JSON 형식으로 응답하세요.
일반적인 노드들(HTTP Request, Set, If, Schedule Trigger 등)을 활용하세요.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `"${task.title}" 업무를 자동화하는 n8n 워크플로우 JSON을 생성해주세요.`
      }]
    });

    // JSON 추출 시도
    const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        return { error: 'JSON 파싱 실패', rawContent: response.content[0].text };
      }
    }

    return {
      name: `${task.title} 자동화`,
      nodes: [],
      connections: {},
      comment: response.content[0].text
    };
  } catch (error) {
    console.error('n8n 워크플로우 생성 에러:', error);
    return { error: '워크플로우 생성 실패', task: task.title };
  }
}

// Python 스크립트 생성 함수
async function generatePythonScript(task, domains) {
  const systemPrompt = `당신은 Python 자동화 전문가입니다. 주어진 업무를 자동화하는 Python 스크립트를 생성하세요.

업무 정보:
- 제목: ${task.title}
- 설명: ${task.description}
- 빈도: ${task.frequency}
- 업무영역: ${domains.join(', ')}

실제 실행 가능한 Python 코드로 작성하세요.
필요한 라이브러리 import, 함수 정의, 실행 예시를 포함하세요.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `"${task.title}" 업무를 자동화하는 Python 스크립트를 작성해주세요.`
      }]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Python 스크립트 생성 에러:', error);
    return `# ${task.title} 자동화 스크립트\n# 업무: ${task.description}\n\n# 스크립트 생성 중 오류가 발생했습니다.`;
  }
}

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;

  if (!filename || filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({
      success: false,
      error: '잘못된 파일명입니다'
    });
  }

  const filepath = path.join(templatesDir, filename);

  if (!require('fs').existsSync(filepath)) {
    return res.status(404).json({
      success: false,
      error: '파일을 찾을 수 없습니다'
    });
  }

  res.download(filepath, filename, (err) => {
    if (err) {
      console.error('다운로드 에러:', err);
      res.status(500).json({ error: '다운로드 실패' });
    }
  });
});

// Socket.IO 이벤트 핸들러
io.on('connection', (socket) => {
  console.log('🔌 클라이언트 연결:', socket.id);

  socket.on('start-analysis', async (data) => {
    const { workshopId, fileIds, domains } = data;

    console.log(`🚀 분석 시작: ${workshopId}, 파일 ${fileIds.length}개`);

    try {
      const workshop = workshopsDB.get(workshopId);
      if (!workshop) {
        socket.emit('analysis-error', { message: '워크샵을 찾을 수 없습니다' });
        return;
      }

      workshop.status = 'analyzing';
      let totalTasks = 0;

      for (let i = 0; i < fileIds.length; i++) {
        const fileId = fileIds[i];
        const fileRecord = filesDB.get(fileId);

        if (!fileRecord) {
          console.error(`파일 없음: ${fileId}`);
          continue;
        }

        const progress = ((i / fileIds.length) * 100);
        socket.emit('analysis-progress', {
          percent: progress,
          message: `${i + 1}/${fileIds.length} 파일 분석 중...`
        });

        socket.emit('file-analysis-start', {
          fileId: fileId,
          filename: fileRecord.originalName
        });

        // 문서 파싱
        const documentText = await parseDocument(fileRecord.path, fileRecord.mimetype);
        fileRecord.content = documentText;
        fileRecord.status = 'parsed';

        // AI 분석
        const tasks = await analyzeTasks(documentText, domains);

        tasks.forEach(taskData => {
          const task = {
            ...taskData,
            id: generateId('TASK'),
            sourceFileId: fileId,
            sourceFilename: fileRecord.originalName,
            workshopId: workshopId,
            createdAt: new Date()
          };

          workshop.tasks.push(task);
          socket.emit('task-analyzed', task);
          totalTasks++;
        });

        fileRecord.status = 'analyzed';

        socket.emit('file-analysis-complete', {
          fileId: fileId,
          filename: fileRecord.originalName,
          taskCount: tasks.length
        });
      }

      workshop.status = 'analyzed';
      workshop.analyzedAt = new Date();

      socket.emit('analysis-progress', {
        percent: 100,
        message: '분석 완료!'
      });

      socket.emit('analysis-complete', {
        workshopId: workshopId,
        totalTasks: totalTasks,
        totalFiles: fileIds.length
      });

      console.log(`✅ 분석 완료: ${totalTasks}개 업무 발견`);

    } catch (error) {
      console.error('분석 에러:', error);
      socket.emit('analysis-error', {
        message: error.message || '분석 중 오류가 발생했습니다'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 클라이언트 연결 해제:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 워크샵 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`📡 Socket.IO 서버가 활성화되었습니다`);
});