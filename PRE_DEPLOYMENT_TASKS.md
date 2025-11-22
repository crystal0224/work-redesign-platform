# 🔧 배포 전 미리 작업하면 좋은 것들

> **목표**: 다음 주 배포할 때 문제없이 한 방에 성공하기

---

## 🎯 우선순위별 작업 목록

### 🔴 필수 (배포 전 꼭 해야 함)

#### 1. 백엔드 - AI 캐싱 서비스 통합 ⭐⭐⭐
**이유**: 비용 50% 절감 (월 15만원 절약)

**현재 상태**: 파일만 생성됨, 통합 안 됨
**작업 내용**:

```typescript
// backend/src/app.ts 또는 server.ts에 추가

import { Redis } from 'ioredis';
import { initAICache } from './services/ai-cache.service';

// Redis 초기화
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// AI Cache 초기화
initAICache(redis);
```

```typescript
// backend/src/services/ai-analysis.service.ts 수정
import { getAICache } from './ai-cache.service';

class AIAnalysisService {
  async analyzeTask(task: Task): Promise<AnalysisResult> {
    const aiCache = getAICache();

    // 1. 캐시 확인
    const cached = await aiCache.getCachedResponse(
      this.buildPrompt(task),
      { taskId: task.id }
    );

    if (cached) {
      return JSON.parse(cached);
    }

    // 2. AI API 호출
    const response = await this.callAnthropicAPI(task);

    // 3. 캐시 저장
    await aiCache.setCachedResponse(
      this.buildPrompt(task),
      { taskId: task.id },
      JSON.stringify(response)
    );

    return response;
  }
}
```

**예상 시간**: 30분
**효과**: 월 15만원 비용 절감

---

#### 2. 백엔드 - 환경 변수 검증 추가 ⭐⭐⭐
**이유**: 배포 시 환경 변수 누락으로 인한 에러 방지

**작업 내용**:

```typescript
// backend/src/config/env-validation.ts (새 파일)
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(20),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().url().optional(),
  ENABLE_AI_CACHE: z.string().transform(val => val === 'true').default('true'),
});

export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated');
    return env;
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    console.error(error);
    process.exit(1);
  }
}
```

```typescript
// backend/src/server.ts에 추가
import { validateEnv } from './config/env-validation';

// 서버 시작 전에 검증
validateEnv();

async function startServer() {
  // ... 기존 코드
}
```

**예상 시간**: 20분
**효과**: 배포 시 환경 변수 에러 사전 차단

---

#### 3. 프론트엔드 - API URL 환경 변수로 분리 ⭐⭐⭐
**이유**: 하드코딩된 localhost:4000을 환경 변수로 변경

**현재 문제**:
```typescript
// ❌ 하드코딩된 URL들
const response = await fetch('http://localhost:4000/api/workshops', ...);
const socket = io('http://localhost:4000');
```

**수정**:

```typescript
// frontend/src/config/api.ts (새 파일)
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  wsURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000',
};
```

```typescript
// frontend/src/app/workshop/page.tsx 수정
import { API_CONFIG } from '@/config/api';

// ✅ 환경 변수 사용
const response = await fetch(`${API_CONFIG.baseURL}/api/workshops`, ...);
const socket = io(API_CONFIG.wsURL);
```

**찾아야 할 파일들**:
```bash
# 모든 localhost:4000, localhost:3001 찾기
cd frontend
grep -r "localhost:4000" src/
grep -r "localhost:3001" src/

# 각 파일에서 API_CONFIG로 변경
```

**예상 시간**: 1시간
**효과**: 배포 시 즉시 프로덕션 API 연결

---

#### 4. 에러 처리 개선 ⭐⭐
**이유**: 프로덕션에서 에러 발생 시 사용자 경험 개선

**작업 내용**:

```typescript
// frontend/src/lib/error-handler.ts (새 파일)
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function handleAPIResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new APIError(
      error.message || 'API request failed',
      response.status,
      error.code
    );
  }
  return response.json();
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
```

**사용 예시**:
```typescript
// Before
try {
  const response = await fetch(url);
  const data = await response.json();
} catch (error) {
  console.error(error); // ❌ 사용자에게 의미 없음
}

// After
import { handleAPIResponse, getErrorMessage } from '@/lib/error-handler';

try {
  const response = await fetch(url);
  const data = await handleAPIResponse(response);
} catch (error) {
  toast.error(getErrorMessage(error)); // ✅ 명확한 에러 메시지
}
```

**예상 시간**: 1시간
**효과**: 사용자 친화적 에러 메시지

---

### 🟡 중요 (시간 있으면 하면 좋음)

#### 5. 로딩 상태 개선 ⭐⭐
**이유**: AI 분석 등 긴 작업 시 사용자 경험 개선

**작업 내용**:

```typescript
// frontend/src/components/ui/LoadingOverlay.tsx (새 파일)
export function LoadingOverlay({
  isLoading,
  message = 'Loading...',
  progress
}: {
  isLoading: boolean;
  message?: string;
  progress?: number;
}) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />

          {/* Message */}
          <p className="text-lg font-medium text-slate-900">{message}</p>

          {/* Progress bar */}
          {progress !== undefined && (
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

**사용 예시**:
```typescript
// Step 4 AI 분석에 적용
const [loading, setLoading] = useState(false);
const [progress, setProgress] = useState(0);

async function extractTasks() {
  setLoading(true);
  setProgress(0);

  try {
    setProgress(30);
    const response = await fetch(`${API_CONFIG.baseURL}/api/extract-tasks`, ...);
    setProgress(70);
    const data = await response.json();
    setProgress(100);
    // ... 처리
  } finally {
    setLoading(false);
  }
}

return (
  <>
    <LoadingOverlay
      isLoading={loading}
      message="AI가 업무를 분석하고 있습니다..."
      progress={progress}
    />
    {/* ... */}
  </>
);
```

**예상 시간**: 1.5시간
**효과**: 사용자가 진행 상황 명확히 인지

---

#### 6. 프론트엔드 - 모바일 반응형 체크 ⭐
**이유**: 태블릿/모바일에서도 사용 가능하도록

**체크 항목**:
```bash
# Chrome DevTools에서 테스트
1. iPhone SE (375px) - 최소 화면
2. iPad (768px) - 태블릿
3. Desktop (1920px) - 일반 모니터

# 각 Step별 확인:
□ Step 1-2: 텍스트 입력 필드 너비
□ Step 3: 파일 업로드 버튼
□ Step 4: 업무 카드 그리드 레이아웃
□ Step 5: 채팅 UI
□ Step 6: 워크플로우 다이어그램
```

**수정 예시**:
```tsx
// Before - 고정 너비
<div className="grid grid-cols-3 gap-4">

// After - 반응형
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**예상 시간**: 2시간
**효과**: 다양한 디바이스 지원

---

#### 7. 백엔드 - Rate Limiting 추가 ⭐
**이유**: AI API 과도한 호출 방지 (비용 보호)

**작업 내용**:

```typescript
// backend/src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

// 일반 API Rate Limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 15분당 100 요청
  message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

// AI API Rate Limit (더 엄격)
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 20, // 1시간당 20 AI 요청
  message: 'AI 분석 요청 한도를 초과했습니다. 1시간 후 다시 시도해주세요.',
  keyGenerator: (req) => {
    // 사용자별로 제한 (나중에 인증 추가되면)
    return req.user?.id || req.ip;
  },
});
```

```typescript
// backend/src/routes/ai.routes.ts
import { apiLimiter, aiLimiter } from '../middleware/rate-limit';

router.post('/api/extract-tasks', aiLimiter, extractTasksHandler);
router.post('/api/ai-consulting', aiLimiter, aiConsultingHandler);
router.post('/api/*', apiLimiter); // 나머지 API들
```

**예상 시간**: 30분
**효과**: 비용 폭탄 방지

---

### 🟢 선택 (나중에 해도 됨)

#### 8. 프론트엔드 - Toast 알림 시스템 ⭐
**이유**: 성공/에러 메시지 통일된 UI로 표시

```bash
# react-hot-toast 설치
cd frontend
npm install react-hot-toast
```

```typescript
// frontend/src/app/layout.tsx
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
                color: '#fff',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
```

```typescript
// 사용
import toast from 'react-hot-toast';

toast.success('워크샵이 생성되었습니다!');
toast.error('AI 분석 중 오류가 발생했습니다.');
toast.loading('AI가 분석 중입니다...');
```

**예상 시간**: 30분

---

#### 9. 로컬 빌드 테스트 스크립트 ⭐
**이유**: 배포 전 빌드 성공 여부 확인

```bash
# scripts/test-build.sh (새 파일)
#!/bin/bash

echo "🔧 Testing production build..."

# Backend
echo "📦 Building backend..."
cd backend
npm run build
if [ $? -eq 0 ]; then
  echo "✅ Backend build successful"
else
  echo "❌ Backend build failed"
  exit 1
fi

# Frontend
echo "📦 Building frontend..."
cd ../frontend
npm run build
if [ $? -eq 0 ]; then
  echo "✅ Frontend build successful"
else
  echo "❌ Frontend build failed"
  exit 1
fi

echo "🎉 All builds successful!"
```

```bash
# 실행 권한 추가
chmod +x scripts/test-build.sh

# 실행
./scripts/test-build.sh
```

**예상 시간**: 15분

---

## 📋 우선순위 작업 체크리스트

### 이번 주 필수 (총 3.5시간)
- [ ] AI 캐싱 서비스 통합 (30분) ⭐⭐⭐
- [ ] 환경 변수 검증 추가 (20분) ⭐⭐⭐
- [ ] API URL 환경 변수 분리 (1시간) ⭐⭐⭐
- [ ] 에러 처리 개선 (1시간) ⭐⭐
- [ ] Rate Limiting 추가 (30분) ⭐

### 시간 있으면 (총 4시간)
- [ ] 로딩 상태 개선 (1.5시간)
- [ ] 모바일 반응형 체크 (2시간)
- [ ] Toast 알림 시스템 (30분)
- [ ] 빌드 테스트 스크립트 (15분)

---

## 🎯 작업 순서 추천

### Day 1 (2시간)
```bash
1. API URL 환경 변수 분리 (1시간)
   → 가장 중요, 배포 시 필수

2. AI 캐싱 통합 (30분)
   → 비용 절감 핵심

3. 환경 변수 검증 (20분)
   → 배포 시 에러 방지

4. 커밋
   git add .
   git commit -m "feat: Prepare for deployment - env vars and AI cache"
   git push
```

### Day 2 (2시간)
```bash
1. 에러 처리 개선 (1시간)
   → UX 개선

2. Rate Limiting 추가 (30분)
   → 비용 보호

3. 로딩 상태 개선 (30분)
   → 최소한만 (Step 4, 5)

4. 커밋
   git add .
   git commit -m "feat: Add error handling and rate limiting"
   git push
```

### Day 3 (선택, 2시간)
```bash
1. 모바일 반응형 체크 (1.5시간)
2. Toast 알림 (30분)
3. 커밋
```

---

## 🔍 체크 포인트

### 작업 전 확인
```bash
# 1. 현재 브랜치 확인
git status

# 2. 최신 코드인지 확인
git pull origin main

# 3. 로컬 환경 정상인지 확인
cd backend && npm run dev
cd frontend && npm run dev
```

### 작업 후 확인
```bash
# 1. 로컬 테스트
→ 브라우저에서 http://localhost:3000
→ 전체 플로우 한 번 돌려보기

# 2. 빌드 테스트
cd backend && npm run build
cd frontend && npm run build

# 3. 커밋
git add .
git commit -m "작업 내용"
git push
```

---

## 💡 작업 팁

### 1. 점진적으로 작업
```bash
# ❌ 한 번에 다 하려고 하지 말기
# ✅ 하나씩 완성 → 테스트 → 커밋

작업 1 → 테스트 → 커밋
작업 2 → 테스트 → 커밋
작업 3 → 테스트 → 커밋
```

### 2. 실험용 브랜치 활용
```bash
# 큰 변경은 브랜치에서
git checkout -b feature/api-url-env
# 작업...
git commit -m "feat: API URL env vars"

# 테스트 완료 후 main에 merge
git checkout main
git merge feature/api-url-env
git push
```

### 3. 막히면 스킵
```bash
# 30분 넘게 막히면 일단 스킵하고 다른 작업
# 나중에 다시 시도하거나 문의
```

---

## 📞 도움이 필요하면

각 작업마다 막히는 부분 있으면 언제든 물어보세요:
- "AI 캐싱 통합이 잘 안되는데?"
- "localhost:4000이 너무 많이 있는데 다 찾는 방법은?"
- "에러 처리를 어디에 적용해야 할까?"

---

**핵심 메시지**:
- ✅ 필수 5개만 하면 배포 준비 완료 (총 3.5시간)
- ✅ 하나씩 천천히, 커밋하면서 작업
- ✅ 막히면 스킵하고 다른 거 먼저

**시간 없으면 1, 2, 3번만 해도 배포 가능합니다!** 🚀
