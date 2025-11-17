const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
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

// 프롬프트 파일 로딩 함수
function loadPromptTemplate() {
  try {
    const promptPath = path.join(__dirname, 'prompts', 'task-extraction-prompt.md');
    console.log('📄 프롬프트 파일 로딩:', promptPath);

    if (fsSync.existsSync(promptPath)) {
      const promptContent = fsSync.readFileSync(promptPath, 'utf-8');
      console.log('✅ 프롬프트 파일 로딩 완료');
      return promptContent;
    } else {
      console.warn('⚠️ 프롬프트 파일을 찾을 수 없습니다. 기본 프롬프트 사용');
      return null;
    }
  } catch (error) {
    console.error('❌ 프롬프트 파일 로딩 실패:', error.message);
    return null;
  }
}

// 프롬프트 템플릿 캐싱
let cachedPromptTemplate = null;

function getPromptTemplate() {
  if (!cachedPromptTemplate) {
    cachedPromptTemplate = loadPromptTemplate();
  }
  return cachedPromptTemplate;
}

// Claude AI 분석 함수
async function analyzeTasks(documentText, domains, manualInput = '') {
  console.log('🤖 Claude AI 분석 시작');
  console.log(`📝 문서 길이: ${documentText.length}자`);
  console.log(`📝 수동 입력 길이: ${manualInput.length}자`);

  // 프롬프트 템플릿 로드
  const promptTemplate = getPromptTemplate();

  let systemPrompt;

  if (promptTemplate) {
    // 프롬프트 파일에서 로딩한 경우, 변수 치환
    systemPrompt = promptTemplate
      .replace('{domains}', domains.join(', '))
      .replace('{uploadedDocuments}', documentText || '(업로드된 문서 없음)')
      .replace('{manualInput}', manualInput || '(직접 입력한 내용 없음)');
  } else {
    // 기본 프롬프트 (fallback)
    systemPrompt = `당신은 10년 경력의 업무 재설계 및 프로세스 최적화 컨설턴트입니다.
제공된 문서와 팀장의 입력 내용을 분석하여 반복 가능한 업무를 정밀하게 추출하고, 실행 가능한 자동화 방안을 제시하세요.

업무 영역: ${domains.join(', ')}

업로드된 문서:
${documentText || '(없음)'}

팀장 직접 입력:
${manualInput || '(없음)'}

각 업무는 다음 정보를 포함해야 합니다:
- title: 업무명 (15자 이내)
- description: 업무 설명 (100-300자)
- domain: 업무 영역 (제공된 도메인 중 하나 또는 '기타')
- estimatedStatus: Progress | Planned | Not Started | Completed
- frequency: Daily | Weekly | Monthly | Quarterly | Yearly | Ad-hoc
- automationPotential: High | Medium | Low
- source: uploaded | manual
- timeSpent: 소요 시간 (숫자, 시간 단위)
- automationMethod: 자동화 방법 (구체적으로)
- estimatedSavings: 예상 절감 시간 (시간/월, 숫자)
- complexity: simple | moderate | complex
- priority: high | medium | low
- tags: 키워드 배열

JSON 배열 형식으로만 응답하세요. 최소 30분 이상 소요되는 반복 업무만 추출하세요.`;
  }

  const userMessage = promptTemplate
    ? "위 지침에 따라 업무를 추출하고 분류해주세요. 오직 JSON 배열만 출력하세요."
    : "위 정보를 바탕으로 업무를 추출하여 JSON 배열로 응답해주세요.";

  try {
    console.log('🔄 Claude API 호출 중...');
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userMessage
      }]
    });

    const textContent = response.content[0];

    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // JSON 추출
    const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('JSON 형식 없음:', textContent.text.substring(0, 500));
      return [];
    }

    const tasks = JSON.parse(jsonMatch[0]);
    console.log(`✅ ${tasks.length}개 업무 추출됨`);

    // 데이터 검증
    const validTasks = tasks.filter(task => {
      return task.title && task.description && task.domain;
    });

    console.log(`✅ 검증 완료: ${validTasks.length}개 유효한 업무`);
    return validTasks;

  } catch (error) {
    console.error('Claude API 에러:', error);
    throw error;
  }
}

// API 라우트들

// 업무 추출 엔드포인트 추가
app.post('/api/workshops/:id/extract-tasks', async (req, res) => {
  const { id: workshopId } = req.params;
  const { manualInput } = req.body;

  console.log(`📊 업무 추출 요청 - Workshop: ${workshopId}`);
  console.log(`📝 입력 내용:`, manualInput);

  try {
    const workshop = workshopsDB.get(workshopId);
    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: '워크샵을 찾을 수 없습니다'
      });
    }

    // manualInput을 업무 영역별로 파싱
    const domainTasks = {};
    if (manualInput) {
      const domainSections = manualInput.split(/\[([^\]]+)\]/);
      for (let i = 1; i < domainSections.length; i += 2) {
        const domain = domainSections[i];
        const tasks = domainSections[i + 1];
        if (tasks && tasks.trim()) {
          domainTasks[domain] = tasks.trim().split('\n').filter(line => line.trim() && line.trim() !== '');
        }
      }
    }

    console.log(`📂 파싱된 영역별 업무:`, domainTasks);

    // 입력된 업무를 기반으로 태스크 생성
    const mockTasks = [];

    Object.entries(domainTasks).forEach(([domain, tasks]) => {
      tasks.forEach((taskLine, idx) => {
        // 업무 내용에서 주요 정보 추출
        const cleanLine = taskLine.replace(/^-\s*/, '').trim();
        const title = cleanLine.split('(')[0].trim();
        const automationPotentials = ['High', 'Medium', 'Low'];
        const frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly'];

        mockTasks.push({
          id: generateId('task'),
          title: title || `${domain} 관련 업무 ${idx + 1}`,
          description: cleanLine,
          domain: domain,
          estimatedStatus: 'Progress',
          frequency: frequencies[Math.min(idx, 3)],
          automationPotential: automationPotentials[idx % 3],
          source: 'manual'
        });
      });
    });

    // 입력이 없거나 부족하면 기본 샘플 추가
    if (mockTasks.length === 0) {
      mockTasks.push(
      {
        id: generateId('task'),
        title: '고객 문의 메일 확인 및 답변',
        description: '매일 오전 9시 고객 문의 메일을 확인하고 답변을 작성합니다.',
        domain: workshop.domains[0] || '고객 지원',
        estimatedStatus: 'Progress',
        frequency: 'Daily',
        automationPotential: 'High',
        source: 'manual'
      },
      {
        id: generateId('task'),
        title: '주간 마케팅 성과 리포트 작성',
        description: '매주 월요일 마케팅 캠페인 성과를 분석하고 보고서를 작성합니다.',
        domain: workshop.domains[1] || '마케팅',
        estimatedStatus: 'Progress',
        frequency: 'Weekly',
        automationPotential: 'Medium',
        source: 'manual'
      },
      {
        id: generateId('task'),
        title: '월간 데이터 분석 대시보드 업데이트',
        description: '매월 초 전체 비즈니스 데이터를 분석하고 대시보드를 업데이트합니다.',
        domain: workshop.domains[2] || '데이터 분석',
        estimatedStatus: 'Planned',
        frequency: 'Monthly',
        automationPotential: 'High',
        source: 'uploaded'
      },
      {
        id: generateId('task'),
        title: '고객 VOC 수집 및 분석',
        description: '고객 피드백을 수집하고 주요 이슈를 분석하여 개선점을 도출합니다.',
        domain: workshop.domains[0] || '고객 지원',
        estimatedStatus: 'Progress',
        frequency: 'Weekly',
        automationPotential: 'Medium',
        source: 'manual'
      },
      {
        id: generateId('task'),
        title: '경쟁사 마케팅 전략 분석',
        description: '분기별로 경쟁사의 마케팅 전략을 분석하고 인사이트를 도출합니다.',
        domain: workshop.domains[1] || '마케팅',
        estimatedStatus: 'Planned',
        frequency: 'Quarterly',
        automationPotential: 'Low',
        source: 'uploaded'
      },
      {
        id: generateId('task'),
        title: '신규 캠페인 A/B 테스트 설계',
        description: '마케팅 캠페인의 효과를 측정하기 위한 A/B 테스트를 설계합니다.',
        domain: workshop.domains[1] || '마케팅',
        estimatedStatus: 'Not Started',
        frequency: 'Ad-hoc',
        automationPotential: 'Medium',
        source: 'manual'
      },
      {
        id: generateId('task'),
        title: '재고 현황 모니터링',
        description: '실시간으로 재고 현황을 모니터링하고 부족 시 알림을 발송합니다.',
        domain: '기타',
        estimatedStatus: 'Progress',
        frequency: 'Daily',
        automationPotential: 'High',
        source: 'uploaded'
      }
      );
    }

    // 워크샵에 업무 저장
    workshop.tasks = mockTasks;
    workshopsDB.set(workshopId, workshop);

    res.json({
      success: true,
      tasks: mockTasks,
      count: mockTasks.length,
      message: `${mockTasks.length}개 업무가 추출되었습니다`
    });

  } catch (error) {
    console.error('업무 추출 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '업무 추출 중 오류가 발생했습니다'
    });
  }
});

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