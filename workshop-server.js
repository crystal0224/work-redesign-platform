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
const { z } = require('zod');

// 중복 제거 시스템 (P1 Priority)
const { deduplicateTasks, validateTaskIntegration } = require('./deduplication-system');

// 환경 변수 설정
require('dotenv').config({ path: './.env' });

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

// Zod 스키마 정의 - Task 검증
const TaskSchema = z.object({
  title: z.string()
    .min(1, '업무명은 필수입니다')
    .max(50, '업무명은 50자를 초과할 수 없습니다'),

  description: z.string()
    .min(10, '업무 설명은 최소 10자 이상이어야 합니다')
    .max(500, '업무 설명은 500자를 초과할 수 없습니다'),

  domain: z.string()
    .min(1, '업무 영역은 필수입니다'),

  estimatedStatus: z.enum(['Progress', 'Planned', 'Not Started', 'Completed'], {
    errorMap: () => ({ message: 'estimatedStatus는 Progress, Planned, Not Started, Completed 중 하나여야 합니다' })
  }),

  frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Ad-hoc'], {
    errorMap: () => ({ message: 'frequency는 Daily, Weekly, Monthly, Quarterly, Yearly, Ad-hoc 중 하나여야 합니다' })
  }),

  automationPotential: z.enum(['High', 'Medium', 'Low'], {
    errorMap: () => ({ message: 'automationPotential은 High, Medium, Low 중 하나여야 합니다' })
  }),

  source: z.enum(['uploaded', 'manual'], {
    errorMap: () => ({ message: 'source는 uploaded 또는 manual이어야 합니다' })
  }),

  timeSpent: z.number()
    .min(0.1, '소요 시간은 최소 0.1시간 이상이어야 합니다')
    .max(24, '소요 시간은 24시간을 초과할 수 없습니다'),

  automationMethod: z.string().optional(),

  estimatedSavings: z.number()
    .min(0, '예상 절감 시간은 0 이상이어야 합니다')
    .max(1000, '예상 절감 시간은 1000시간을 초과할 수 없습니다'),

  complexity: z.enum(['simple', 'moderate', 'complex'], {
    errorMap: () => ({ message: 'complexity는 simple, moderate, complex 중 하나여야 합니다' })
  }),

  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'priority는 high, medium, low 중 하나여야 합니다' })
  }),

  tags: z.array(z.string())
    .min(0, 'tags는 배열이어야 합니다')
    .max(10, 'tags는 최대 10개까지 가능합니다')
});

// 기본 라우트 (상태 확인용)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Workshop Server Status</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f9ff; }
          .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; }
          h1 { color: #0284c7; margin-bottom: 0.5rem; }
          p { color: #64748b; }
          .status { display: inline-block; padding: 0.25rem 0.75rem; background: #dcfce7; color: #166534; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Workshop Server</h1>
          <p>API Server is running normally.</p>
          <div class="status">● Online</div>
        </div>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

// JSON 추출 헬퍼 함수 (Robust 파싱 로직)
function extractJSON(text, retryCount = 0) {
  const MAX_RETRIES = 3;
  const strategies = [
    // Strategy 1: 원본 텍스트에서 JSON 추출
    (text) => {
      const match = text.match(/\[[\s\S]*\]/);
      return match ? match[0] : null;
    },
    // Strategy 2: 코드블록 제거 후 추출
    (text) => {
      const cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const match = cleanedText.match(/\[[\s\S]*\]/);
      return match ? match[0] : null;
    },
    // Strategy 3: 중첩 배열 고려한 추출 (첫 [ 부터 마지막 ] 까지)
    (text) => {
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        return text.substring(firstBracket, lastBracket + 1);
      }
      return null;
    }
  ];

  console.log(`\n🔍 JSON 추출 시도 ${retryCount + 1}/${MAX_RETRIES}`);
  console.log(`📝 원본 텍스트 길이: ${text.length}자`);
  console.log(`📝 원본 텍스트 미리보기: ${text.substring(0, 200)}...`);

  // 현재 전략 선택
  const strategy = strategies[retryCount] || strategies[0];
  const jsonString = strategy(text);

  if (!jsonString) {
    console.error(`❌ 전략 ${retryCount + 1} 실패: JSON 배열을 찾을 수 없습니다`);
    console.error(`📄 분석 실패한 텍스트 샘플:\n${text.substring(0, 500)}\n...`);

    if (retryCount < MAX_RETRIES - 1) {
      console.log(`🔄 다음 전략으로 재시도...`);
      return extractJSON(text, retryCount + 1);
    }

    console.error(`❌ 모든 재시도 실패 (${MAX_RETRIES}회)`);
    return { success: false, error: 'JSON_NOT_FOUND', rawText: text.substring(0, 1000) };
  }

  console.log(`✅ JSON 문자열 추출 성공 (길이: ${jsonString.length}자)`);
  console.log(`📝 추출된 JSON 미리보기: ${jsonString.substring(0, 200)}...`);

  // JSON 파싱 시도
  try {
    const parsed = JSON.parse(jsonString);

    // 배열인지 확인
    if (!Array.isArray(parsed)) {
      throw new Error('파싱 결과가 배열이 아닙니다');
    }

    console.log(`✅ JSON 파싱 성공: ${parsed.length}개 항목`);
    return { success: true, data: parsed };

  } catch (parseError) {
    console.error(`❌ JSON 파싱 실패 (전략 ${retryCount + 1}):`, parseError.message);

    // 파싱 실패 위치 표시
    if (parseError instanceof SyntaxError) {
      const errorMatch = parseError.message.match(/position (\d+)/);
      if (errorMatch) {
        const position = parseInt(errorMatch[1]);
        const contextStart = Math.max(0, position - 50);
        const contextEnd = Math.min(jsonString.length, position + 50);
        console.error(`📍 오류 위치 근처:\n...${jsonString.substring(contextStart, contextEnd)}...`);
      }
    }

    console.error(`📄 파싱 실패한 JSON 샘플:\n${jsonString.substring(0, 500)}\n...`);

    if (retryCount < MAX_RETRIES - 1) {
      console.log(`🔄 다음 전략으로 재시도...`);
      return extractJSON(text, retryCount + 1);
    }

    console.error(`❌ 모든 재시도 실패 (${MAX_RETRIES}회)`);
    return {
      success: false,
      error: 'JSON_PARSE_ERROR',
      parseError: parseError.message,
      rawJson: jsonString.substring(0, 1000)
    };
  }
}

// 한국어 시간 표현 전처리 시스템
function normalizeKoreanTime(text) {
  console.log('⏰ 한국어 시간 표현 전처리 시작');

  const result = {
    timeSpent: null,
    frequency: null,
    rawMatches: []
  };

  // 시간 표현 패턴들
  const timePatterns = [
    // "X시간 Y분" 패턴
    {
      regex: /(\d+)\s*시간\s*(\d+)\s*분/g,
      handler: (match) => {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        return hours + (minutes / 60);
      }
    },
    // "X시간" 패턴
    {
      regex: /(\d+(?:\.\d+)?)\s*시간/g,
      handler: (match) => parseFloat(match[1])
    },
    // "X분" 패턴
    {
      regex: /(\d+)\s*분/g,
      handler: (match) => parseInt(match[1]) / 60
    },
    // "일 X시간" 패턴 (일일 기준)
    {
      regex: /일\s*(\d+(?:\.\d+)?)\s*시간/g,
      handler: (match) => parseFloat(match[1])
    },
    // "주 X시간" 패턴 (주 5일 기준으로 일일 환산)
    {
      regex: /주\s*(\d+(?:\.\d+)?)\s*시간/g,
      handler: (match) => parseFloat(match[1]) / 5
    },
    // "월 X시간" 패턴 (월 20일 기준으로 일일 환산)
    {
      regex: /월\s*(\d+(?:\.\d+)?)\s*시간/g,
      handler: (match) => parseFloat(match[1]) / 20
    },
    // "주 X회, 각 Y시간" 패턴 (1회당 시간)
    {
      regex: /주\s*(\d+)\s*회[,\s]*각\s*(\d+(?:\.\d+)?)\s*시간/g,
      handler: (match) => parseFloat(match[2])
    },
    // "주 X회, Y시간씩" 패턴
    {
      regex: /주\s*(\d+)\s*회[,\s]*(\d+(?:\.\d+)?)\s*시간\s*씩/g,
      handler: (match) => parseFloat(match[2])
    },
    // "하루 X시간" 패턴
    {
      regex: /하루\s*(\d+(?:\.\d+)?)\s*시간/g,
      handler: (match) => parseFloat(match[1])
    },
    // "X시간 반" 패턴
    {
      regex: /(\d+)\s*시간\s*반/g,
      handler: (match) => parseFloat(match[1]) + 0.5
    }
  ];

  // 빈도 표현 패턴들
  const frequencyPatterns = [
    { regex: /매일|일일|하루|매\s*일/g, value: 'Daily' },
    { regex: /주간|주\s*\d+\s*회|매\s*주|주별|주단위/g, value: 'Weekly' },
    { regex: /월간|월\s*\d+\s*회|매\s*월|월별|월단위/g, value: 'Monthly' },
    { regex: /분기|분기별|분기\s*\d+\s*회/g, value: 'Quarterly' },
    { regex: /연간|연\s*\d+\s*회|매\s*년|연별|연단위/g, value: 'Yearly' },
    { regex: /필요시|비정기|수시|가끔/g, value: 'Ad-hoc' }
  ];

  // 시간 표현 추출
  let maxTimeSpent = 0;
  const timeMatches = [];

  timePatterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.regex);
    while ((match = regex.exec(text)) !== null) {
      const timeValue = pattern.handler(match);
      timeMatches.push(match[0]);

      if (timeValue > maxTimeSpent) {
        maxTimeSpent = timeValue;
      }
    }
  });

  if (maxTimeSpent > 0) {
    result.timeSpent = Math.round(maxTimeSpent * 100) / 100; // 소수점 2자리까지
  }

  // 빈도 표현 추출 (첫 번째 매칭 사용)
  for (const pattern of frequencyPatterns) {
    const match = text.match(pattern.regex);
    if (match) {
      result.frequency = pattern.value;
      timeMatches.push(match[0]);
      break;
    }
  }

  result.rawMatches = [...new Set(timeMatches)]; // 중복 제거

  if (result.timeSpent || result.frequency) {
    console.log('✅ 시간 정보 추출 성공:', result);
  } else {
    console.log('⚠️ 시간 정보를 찾지 못했습니다');
  }

  return result;
}

// Claude AI 분석 함수
async function analyzeTasks(documentText, domains, manualInput = '') {
  console.log('🤖 Claude AI 분석 시작');
  console.log(`📝 문서 길이: ${documentText.length}자`);
  console.log(`📝 수동 입력 길이: ${manualInput.length}자`);

  // 전체 텍스트에서 시간 정보 전처리
  const fullText = `${documentText}\n${manualInput}`;
  const normalizedTimeInfo = normalizeKoreanTime(fullText);

  // 정규화된 시간 정보를 힌트로 추가
  let timeHints = '';
  if (normalizedTimeInfo.timeSpent || normalizedTimeInfo.frequency || normalizedTimeInfo.rawMatches.length > 0) {
    timeHints = `\n\n## 🕐 시간 정보 전처리 결과 (참고용 힌트)\n\n`;
    timeHints += `다음은 문서에서 자동 추출된 시간 정보입니다. 이를 참고하여 각 업무의 timeSpent와 frequency를 더 정확하게 추출하세요:\n\n`;

    if (normalizedTimeInfo.timeSpent) {
      timeHints += `- 추출된 소요 시간: ${normalizedTimeInfo.timeSpent}시간\n`;
    }
    if (normalizedTimeInfo.frequency) {
      timeHints += `- 추출된 빈도: ${normalizedTimeInfo.frequency}\n`;
    }
    if (normalizedTimeInfo.rawMatches.length > 0) {
      timeHints += `- 원본 표현: ${normalizedTimeInfo.rawMatches.join(', ')}\n`;
    }

    timeHints += `\n이 정보를 업무 추출 시 참고하되, 각 업무별로 별도의 시간 정보가 명시된 경우 해당 정보를 우선 사용하세요.\n`;
  }

  // 프롬프트 템플릿 로드
  const promptTemplate = getPromptTemplate();

  let systemPrompt;

  if (promptTemplate) {
    // 프롬프트 파일에서 로딩한 경우, 변수 치환 및 시간 힌트 추가
    systemPrompt = promptTemplate
      .replace('{domains}', domains.join(', '))
      .replace('{uploadedDocuments}', documentText || '(업로드된 문서 없음)')
      .replace('{manualInput}', (manualInput || '(직접 입력한 내용 없음)') + timeHints);
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
      console.error('❌ 예상치 못한 응답 타입:', textContent.type);
      throw new Error('Unexpected response type from Claude');
    }

    console.log('✅ Claude API 응답 수신 완료');
    console.log(`📝 응답 길이: ${textContent.text.length}자`);

    // Robust JSON 추출 (재시도 로직 포함)
    const extractResult = extractJSON(textContent.text);

    if (!extractResult.success) {
      // Fallback: 빈 배열 반환 (크래시 방지)
      console.error('❌ JSON 추출 완전 실패 - Fallback 실행');
      console.error('📄 에러 상세:', JSON.stringify(extractResult, null, 2));

      // 분석용 로그 저장
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: extractResult.error,
        parseError: extractResult.parseError,
        rawTextSample: extractResult.rawText || extractResult.rawJson,
        domains: domains,
        documentTextLength: documentText.length
      };
      console.error('📊 디버깅 정보:', JSON.stringify(errorLog, null, 2));

      return []; // 빈 배열 반환하여 크래시 방지
    }

    const tasks = extractResult.data;
    console.log(`✅ ${tasks.length}개 업무 추출됨`);

    // Zod 스키마 기반 데이터 검증
    const validTasks = [];
    const invalidTasks = [];

    tasks.forEach((task, index) => {
      try {
        // Zod 검증 수행
        const validatedTask = TaskSchema.parse(task);
        validTasks.push(validatedTask);
        console.log(`✅ Task ${index + 1} 검증 성공: "${task.title}"`);
      } catch (error) {
        // 검증 실패 시 상세 에러 로그
        console.error(`❌ Task ${index + 1} 검증 실패: "${task.title || '(제목 없음)'}"`);

        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            console.error(`   - ${err.path.join('.')}: ${err.message}`);
          });
        } else {
          console.error(`   - 알 수 없는 에러:`, error.message);
        }

        // 실패한 태스크 정보 저장
        invalidTasks.push({
          index: index + 1,
          task: task,
          error: error instanceof z.ZodError ? error.errors : error.message
        });
      }
    });

    // 검증 결과 로그
    console.log(`\n📊 검증 결과 요약:`);
    console.log(`   ✅ 유효한 업무: ${validTasks.length}개`);
    console.log(`   ❌ 무효한 업무: ${invalidTasks.length}개`);

    if (invalidTasks.length > 0) {
      console.log(`\n⚠️  무효한 업무 목록:`);
      invalidTasks.forEach((item) => {
        console.log(`   - Task ${item.index}: ${item.task.title || '(제목 없음)'}`);
      });
    }

    // ============================================================
    // 중복 제거 및 검증 파이프라인 (P1 Priority)
    // ============================================================

    console.log('\n🔄 중복 제거 파이프라인 시작...');

    // 1단계: 중복 업무 제거
    const deduplicatedTasks = deduplicateTasks(validTasks);

    // 2단계: 통합 검증
    const validationResult = validateTaskIntegration(deduplicatedTasks);

    // 검증 경고가 있으면 로그 출력
    if (validationResult.warnings.length > 0) {
      console.log('\n⚠️  검증 경고 사항:');
      validationResult.warnings.forEach((warning, idx) => {
        console.log(`   ${idx + 1}. ${warning}`);
      });
    }

    console.log('✅ 중복 제거 파이프라인 완료\n');

    // 중복 제거된 태스크 반환 (부분 실패 허용)
    return deduplicatedTasks;

  } catch (error) {
    console.error('❌ Claude API 에러 - analyzeTasks 함수');
    console.error('에러 메시지:', error.message);
    console.error('에러 타입:', error.type || error.constructor.name);
    if (error.status) console.error('HTTP 상태:', error.status);
    throw error;
  }
}

// API 라우트들

// 대화형 컨설팅 API
app.post('/api/consulting/chat', async (req, res) => {
  const { workshopId, message, conversationHistory = [] } = req.body;

  console.log('💬 대화형 컨설팅 요청:', message);
  console.log('📋 WorkshopId:', workshopId);
  console.log('📜 대화 히스토리 길이:', conversationHistory.length);

  try {
    const workshop = workshopsDB.get(workshopId);
    if (!workshop) {
      console.error('❌ 워크샵을 찾을 수 없음:', workshopId);
      return res.status(404).json({
        success: false,
        error: '워크샵을 찾을 수 없습니다'
      });
    }
    console.log('✅ 워크샵 확인:', workshop.id);

    // 대화형 컨설팅 프롬프트 로드
    const consultingPromptPath = path.join(__dirname, 'prompts', 'interactive-consulting-prompt.md');
    console.log('📂 프롬프트 경로:', consultingPromptPath);
    let systemPrompt;

    if (fsSync.existsSync(consultingPromptPath)) {
      console.log('📄 프롬프트 파일 존재 확인');
      systemPrompt = fsSync.readFileSync(consultingPromptPath, 'utf-8');
      console.log('✅ 대화형 컨설팅 프롬프트 로드 완료 (길이:', systemPrompt.length, '자)');
    } else {
      console.warn('⚠️ 대화형 컨설팅 프롬프트 파일 없음, 기본 프롬프트 사용');
      systemPrompt = `당신은 업무 자동화 컨설턴트입니다.
최소한의 질문으로 업무를 파악하고 구체적인 자동화 솔루션을 제시하세요.

핵심 파악 항목:
1. 반복 주기 (일/주/월/분기)
2. 1회당 소요 시간
3. 업무 흐름 및 사용 도구
4. 핵심 병목 지점

3-4개 질문만으로 솔루션을 제시하세요.`;
    }

    // 대화 히스토리 구성
    console.log('🔄 대화 히스토리 구성 시작...');
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // 현재 사용자 메시지 추가
    messages.push({
      role: 'user',
      content: message
    });
    console.log('📨 최종 메시지 개수:', messages.length);

    // Claude API 호출
    let assistantMessage;

    try {
      console.log('🔄 Claude API 호출 시작 (대화형 컨설팅)...');
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: messages
      });

      assistantMessage = response.content[0].text;
      console.log('✅ Claude API 호출 성공 - 대화형 컨설팅');
    } catch (apiError) {
      // API 크레딧 부족 시 Mock 응답 사용
      console.error('❌ Claude API 호출 실패, Mock 응답 사용');
      console.error('에러 상세:', apiError.message);
      console.error('에러 타입:', apiError.type || apiError.constructor.name);
      if (apiError.status) console.error('HTTP 상태:', apiError.status);

      // Mock 응답 생성 (대화 단계에 따라)
      if (conversationHistory.length === 0) {
        // 첫 질문
        assistantMessage = `"광고 소재 제작" 자동화를 검토하시는군요.
먼저 이 업무가 왜 필요한지, 어떤 가치를 만드는지 이해하고 싶습니다.

1. 이 업무의 최종 결과물은 무엇인가요? (예: 배너 이미지, 영상 소재, 카드뉴스 등)
2. 그 결과물을 누가 사용하거나 확인하나요?
3. 이 업무가 없다면 어떤 문제가 발생할까요?`;
      } else if (conversationHistory.length <= 2) {
        // 2단계 질문
        assistantMessage = `업무의 흐름을 구체적으로 파악하고 싶습니다.

1. 이 업무를 시작하려면 어떤 정보/데이터가 필요한가요?
   (예: 캠페인 기획서, 타겟 이미지, 카피 등)

2. 업무를 처음부터 끝까지 순서대로 설명해주시겠어요?
   각 단계에서 어떤 도구를 사용하는지도 함께 알려주세요.

3. 업무 중 "사람이 판단해야 하는 순간"이 있나요?
   (예: 디자인 시안 승인, 메시지 톤앤매너 조정 등)`;
      } else {
        // 일반 응답
        assistantMessage = `감사합니다. 이제 업무의 규모와 소요 시간을 파악하겠습니다.

1. 이 업무는 얼마나 자주 발생하나요?
   (예: 매일, 주 3회, 월말 등)

2. 한 번 수행할 때 평균 얼마나 걸리나요?
   각 단계별로 대략적인 시간도 알려주시면 좋습니다.`;
      }
    }

    res.json({
      success: true,
      message: assistantMessage,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
      ]
    });

  } catch (error) {
    console.error('대화형 컨설팅 에러:', error);
    res.status(500).json({
      success: false,
      error: '컨설팅 중 오류가 발생했습니다'
    });
  }
});

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

    if (!domains || domains.length < 2 || domains.length > 5) {
      return res.status(400).json({
        success: false,
        error: '최소 2개, 최대 5개의 도메인이 필요합니다'
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
    console.log(`📂 파일 IDs:`, fileIds);
    console.log(`🏷️ 도메인:`, domains);

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
        console.log(`📄 파일 파싱 완료: ${fileRecord.originalName}, 길이: ${documentText.length}자`);
        console.log(`📝 파싱된 내용 미리보기: ${documentText.substring(0, 200)}...`);
        fileRecord.content = documentText;
        fileRecord.status = 'parsed';

        // AI 분석
        console.log(`🤖 AI 분석 시작: ${fileRecord.originalName}`);
        const tasks = await analyzeTasks(documentText, domains);
        console.log(`✅ AI 분석 완료: ${tasks.length}개 업무 추출`);

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