# 🎯 3월 교육과정 배포 로드맵 (50명+, 예산 50만원)

> **목표**: 2025년 3월 교육과정에서 50명 이상의 팀장이 안정적으로 사용, 월 50만원 예산 유지

**작성일**: 2025-11-22
**런칭 목표**: 2025년 3월
**베타 테스트**: 2025년 1-2월
**예산**: 월 50만원 (약 $385, 환율 1,300원 기준)

---

## 💰 예산 분석 및 최적화

### 목표 예산 구조 (월 50만원 = $385)

| 항목 | 예상 비용 (USD/월) | 원화 (₩) | 비중 |
|------|------------------|---------|------|
| **인프라** | | | |
| Railway (Backend + DB + Redis) | $50-80 | 6.5만-10만원 | 20% |
| Vercel (Frontend) | $20-40 | 2.6만-5만원 | 10% |
| **AI API** | | | |
| Anthropic Claude API | $200-250 | 26만-32만원 | 65% |
| **기타** | | | |
| 도메인, SSL 등 | $5-10 | 0.6만-1.3만원 | 2% |
| **총계** | **$275-380** | **35.7만-49.4만원** | **100%** |

### ✅ 예산 내 가능!

**핵심**: AI API 사용량 최적화가 관건

---

## 🚀 배포 전략: Railway + Vercel

### 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                   Vercel (Frontend)                  │
│  - Next.js 14 SSR                                   │
│  - CDN (전 세계 엣지 캐싱)                            │
│  - 자동 SSL                                          │
│  - $20-40/월 (Pro plan)                             │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────┐
│              Railway (Backend)                       │
│  ┌───────────────────────────────────────┐          │
│  │  Express API (Node.js)                │          │
│  │  - REST API                           │          │
│  │  - Socket.IO (WebSocket)              │          │
│  │  - 2GB RAM, 2 vCPU                    │          │
│  └───────────────────────────────────────┘          │
│  ┌───────────────────────────────────────┐          │
│  │  PostgreSQL 15                        │          │
│  │  - 2GB Storage (자동 확장)             │          │
│  │  - 자동 백업                           │          │
│  └───────────────────────────────────────┘          │
│  ┌───────────────────────────────────────┐          │
│  │  Redis 7                              │          │
│  │  - 256MB (캐싱용)                      │          │
│  └───────────────────────────────────────┘          │
│  $50-80/월 (모든 서비스 포함)                        │
└─────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         Anthropic Claude API                         │
│         - Claude 3.5 Sonnet                          │
│         - 최적화된 사용량                             │
└─────────────────────────────────────────────────────┘
```

---

## 💡 비용 최적화 전략

### 1. AI API 비용 절감 (가장 중요!) 💰

**현재 문제**: Claude API가 비용의 65%를 차지

**해결책**:

#### A. 응답 캐싱 (50% 절약)
```typescript
// backend/src/services/ai-cache.service.ts
import { createHash } from 'crypto';

class AICacheService {
  private redis: Redis;

  // 동일한 질문에 대한 캐싱 (24시간)
  async getCachedResponse(prompt: string, context: any): Promise<string | null> {
    const cacheKey = this.generateCacheKey(prompt, context);
    const cached = await this.redis.get(`ai:response:${cacheKey}`);

    if (cached) {
      console.log('💰 Cache hit - API 비용 절약!');
      return cached;
    }

    return null;
  }

  async setCachedResponse(prompt: string, context: any, response: string) {
    const cacheKey = this.generateCacheKey(prompt, context);
    await this.redis.setex(`ai:response:${cacheKey}`, 86400, response); // 24시간
  }

  private generateCacheKey(prompt: string, context: any): string {
    return createHash('sha256')
      .update(JSON.stringify({ prompt, context }))
      .digest('hex');
  }
}

// 사용 예시
const cached = await aiCache.getCachedResponse(userPrompt, taskContext);
if (cached) {
  return cached; // 캐시된 응답 반환, API 호출 없음!
}

const response = await anthropic.messages.create({...});
await aiCache.setCachedResponse(userPrompt, taskContext, response);
```

**효과**: 반복적인 질문 50% 절약 → **$100-125/월 절약**

---

#### B. 프롬프트 최적화 (30% 절약)
```typescript
// ❌ 비효율적 (2,000 tokens input)
const prompt = `
당신은 업무 자동화 전문가입니다. 다음 업무들을 분석하고...
[긴 설명]

업무 목록:
${tasks.map(t => JSON.stringify(t, null, 2)).join('\n')}

각 업무에 대해 다음을 제공해주세요:
1. 자동화 가능성 (High/Medium/Low)
2. 자동화 방법
3. 예상 시간 절감
...
`;

// ✅ 효율적 (800 tokens input)
const prompt = `업무 자동화 분석:

${tasks.map(t => `- ${t.title}: ${t.description}`).join('\n')}

각 업무의 자동화 가능성(H/M/L), 방법, 시간 절감 제시.`;
```

**효과**: 토큰 사용 60% 감소 → **$60-75/월 절약**

---

#### C. Batch Processing (20% 절약)
```typescript
// ❌ 비효율적: 업무마다 개별 API 호출
for (const task of tasks) {
  const analysis = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    messages: [{ role: "user", content: `분석: ${task.title}` }]
  });
}
// → 10개 업무 = 10번 API 호출

// ✅ 효율적: 한 번에 배치 처리
const batchAnalysis = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  messages: [{
    role: "user",
    content: `다음 업무들을 한 번에 분석:\n${tasks.map((t, i) => `${i+1}. ${t.title}`).join('\n')}`
  }]
});
// → 1번 API 호출로 처리
```

**효과**: API 호출 횟수 90% 감소 → **$40-50/월 절약**

---

#### D. 모델 선택 최적화
```typescript
// 간단한 작업: Haiku (저렴)
if (taskType === 'simple_classification') {
  model = "claude-3-haiku-20240307"; // $0.25/1M tokens (Sonnet의 1/10)
}

// 복잡한 분석: Sonnet (정확)
if (taskType === 'deep_analysis') {
  model = "claude-3-5-sonnet-20241022"; // $3/1M tokens
}
```

**효과**: 단순 작업 90% 비용 절감 → **$30-40/월 절약**

---

### 총 AI API 절약 효과

| 최적화 방법 | 절약 금액 | 누적 절약 |
|-----------|---------|---------|
| 기본 (최적화 없음) | - | $500/월 |
| A. 응답 캐싱 | -$125 | $375/월 |
| B. 프롬프트 최적화 | -$75 | $300/월 |
| C. Batch Processing | -$50 | $250/월 |
| D. 모델 선택 | -$30 | **$220/월** ✅ |

**최종 AI API 비용**: **$220/월 (28.6만원)** ← 목표 달성!

---

### 2. 인프라 비용 최적화

#### Railway 플랜 선택
```
Hobby Plan: $5/월 + 사용량
- $5 크레딧 포함
- 추가 사용: $0.000231/GB-hour

예상 사용량 (50명 동시):
- Backend: 2GB RAM × 730 hours × $0.000231 = $34
- PostgreSQL: 2GB × 730 × $0.000231 = $34
- Redis: 256MB × 730 × $0.000231 = $4

총: $5 + $72 = $77/월
```

#### Vercel 플랜 선택
```
Pro Plan: $20/월
- 100GB 대역폭 포함
- 무제한 빌드
- Analytics 포함

예상 사용량:
- 50명 × 10 세션 × 50MB = 25GB/월
- 추가 비용 없음

총: $20/월
```

**인프라 총합**: $77 + $20 = **$97/월 (12.6만원)**

---

## 📊 최종 예산 (50명 기준)

| 항목 | 월 비용 (USD) | 원화 (₩) |
|------|-------------|---------|
| Railway (Backend + DB + Redis) | $77 | 10만원 |
| Vercel (Frontend Pro) | $20 | 2.6만원 |
| Anthropic Claude API (최적화) | $220 | 28.6만원 |
| 도메인 (Cloudflare) | $0 | 0원 |
| **총계** | **$317** | **41.2만원** ✅ |

**여유 예산**: 50만원 - 41.2만원 = **8.8만원**

---

## 🗓️ 타임라인 (11월 → 3월)

### Phase 1: 기반 구축 (11월 25일 - 12월 15일, 3주)

**Week 1 (11/25-12/1): 배포 환경 구축**
- [ ] Railway 프로젝트 생성 및 DB 설정
- [ ] Vercel 프로젝트 연결
- [ ] 환경 변수 설정
- [ ] 자동 배포 파이프라인 구축

**Week 2 (12/2-12/8): 멀티테넌시 구현**
- [ ] 세션 격리 미들웨어
- [ ] 동시 세션 관리
- [ ] Socket.IO 네임스페이스 분리

**Week 3 (12/9-12/15): AI 최적화**
- [ ] 응답 캐싱 구현
- [ ] 프롬프트 최적화
- [ ] Batch processing
- [ ] 모델 선택 로직

**Milestone**: Dev 환경 배포 완료

---

### Phase 2: 기능 완성도 향상 (12월 16일 - 1월 15일, 4주)

**Week 4-5 (12/16-12/29): 인증 및 권한**
- [ ] 간단한 이메일 인증 (또는 SK SSO)
- [ ] 팀장/팀원 권한 관리
- [ ] 세션 초대 기능

**Week 6-7 (12/30-1/12): UX 개선**
- [ ] 대시보드 (진행 중 워크샵 목록)
- [ ] 실시간 참여자 표시
- [ ] 모바일 반응형 최적화
- [ ] 로딩 상태 개선

**Week 8 (1/13-1/15): 모니터링 구축**
- [ ] Railway 모니터링 설정
- [ ] Vercel Analytics 활성화
- [ ] 에러 추적 (Sentry 무료 티어)
- [ ] Slack 알림 연동

**Milestone**: Staging 환경 배포 완료

---

### Phase 3: 베타 테스트 (1월 20일 - 2월 20일, 4주)

**Week 9-10 (1/20-2/2): 내부 베타**
- [ ] 5-10명 내부 팀장 초대
- [ ] 실제 워크샵 진행 (3-5회)
- [ ] 피드백 수집 및 분석
- [ ] 버그 수정

**Week 11-12 (2/3-2/16): 외부 베타**
- [ ] 20-30명 확대 테스트
- [ ] 부하 테스트 (동시 30명)
- [ ] 성능 최적화
- [ ] UI/UX 개선

**Week 13 (2/17-2/20): 최종 검증**
- [ ] 50명 동시 접속 테스트
- [ ] 모든 기능 검증
- [ ] 매뉴얼 작성
- [ ] FAQ 준비

**Milestone**: 프로덕션 준비 완료

---

### Phase 4: 런칭 (2월 24일 - 3월 7일, 2주)

**Week 14 (2/24-3/2): Soft Launch**
- [ ] 프로덕션 배포
- [ ] 모니터링 강화
- [ ] On-call 체제 구축
- [ ] 사전 안내 이메일 발송

**Week 15 (3/3-3/7): 교육과정 시작**
- [ ] 3월 첫째 주 교육 시작
- [ ] 실시간 지원
- [ ] 이슈 즉시 대응
- [ ] 사용 데이터 수집

**Milestone**: 정식 런칭 🚀

---

### Phase 5: 운영 및 개선 (3월 이후)

**매주 반복**:
- [ ] 주간 사용 리포트
- [ ] 비용 모니터링
- [ ] 성능 최적화
- [ ] 기능 개선

---

## 🔧 50명+ 스케일링 전략

### 동시 접속 50명 대응

#### 1. Railway 리소스 자동 확장
```toml
# railway.toml
[deploy]
startCommand = "node dist/server.js"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"

[scaling]
minInstances = 1
maxInstances = 3  # 자동으로 3개까지 확장
targetCPU = 70
targetMemory = 80
```

**비용**: 평소 1 인스턴스, 피크 시 3 인스턴스
- 평상시: $77/월
- 교육 기간 (3개 인스턴스): $77 × 3 = $231/월
- **월 평균**: $100-150/월 (교육은 월 일부만)

---

#### 2. 데이터베이스 최적화

```sql
-- 인덱스 최적화 (50명 동시 쿼리 대응)
CREATE INDEX CONCURRENTLY idx_workshop_sessions_created_by
ON workshop_sessions(created_by);

CREATE INDEX CONCURRENTLY idx_workshop_sessions_status_created_at
ON workshop_sessions(status, created_at DESC);

CREATE INDEX CONCURRENTLY idx_tasks_domain_status
ON tasks(domain_id, status);

-- Connection Pool 설정
-- prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  // 50명 동시 = 최대 100 connections 필요
  pool_size = 20
  connection_limit = 100
  pool_timeout = 30
}
```

---

#### 3. Redis 캐싱 전략

```typescript
// 자주 조회되는 데이터 캐싱
class WorkshopCacheService {
  // 세션 데이터 (10분 캐시)
  async getSession(sessionId: string) {
    const key = `session:${sessionId}`;
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    const session = await prisma.workshopSession.findUnique({
      where: { id: sessionId },
      include: { domains: true, participants: true }
    });

    await redis.setex(key, 600, JSON.stringify(session));
    return session;
  }

  // 업무 목록 (5분 캐시)
  async getTasks(sessionId: string) {
    const key = `tasks:${sessionId}`;
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    const tasks = await prisma.task.findMany({
      where: { project: { sessionId } }
    });

    await redis.setex(key, 300, JSON.stringify(tasks));
    return tasks;
  }

  // 캐시 무효화 (업데이트 시)
  async invalidateSession(sessionId: string) {
    await redis.del(`session:${sessionId}`);
    await redis.del(`tasks:${sessionId}`);
  }
}
```

**효과**: DB 쿼리 70% 감소 → 응답 속도 3배 향상

---

#### 4. Socket.IO 최적화 (50명 동시 WebSocket)

```typescript
// backend/src/socket/optimized-handler.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

export function setupSocket(io: Server, redis: Redis) {
  // Redis adapter로 여러 인스턴스 간 통신
  const pubClient = redis.duplicate();
  const subClient = redis.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  // 네임스페이스별 격리
  io.of(/^\/workshop\/\w+$/).on('connection', (socket) => {
    const sessionId = socket.nsp.name.split('/')[2];

    // Room 참여
    socket.join(sessionId);

    // 메시지 브로드캐스트 (해당 세션만)
    socket.on('task-update', async (data) => {
      // 캐시 무효화
      await cacheService.invalidateSession(sessionId);

      // 같은 세션의 다른 사용자들에게만 전송
      socket.to(sessionId).emit('task-updated', data);
    });

    // 연결 끊김
    socket.on('disconnect', () => {
      console.log(`User left session ${sessionId}`);
    });
  });

  // Connection 수 모니터링
  setInterval(() => {
    const count = io.of('/').sockets.size;
    console.log(`Active connections: ${count}`);

    if (count > 100) {
      console.warn('⚠️ High connection count!');
      // Slack 알림 전송
    }
  }, 60000); // 1분마다
}
```

---

#### 5. Rate Limiting (과도한 사용 방지)

```typescript
import rateLimit from 'express-rate-limit';

// API Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 15분당 100 요청
  message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

// AI API Rate limiting (비용 보호!)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 20, // 1시간당 20 AI 요청
  message: 'AI 분석 요청이 제한을 초과했습니다.',
  keyGenerator: (req) => req.user.id, // 사용자별
});

app.use('/api/', apiLimiter);
app.use('/api/ai/', aiLimiter);
```

**효과**: 과도한 AI API 사용 방지 → **비용 폭탄 방지**

---

## 📈 비용 시뮬레이션

### 시나리오 1: 평상시 (베타 테스트 전)
```
Railway: $77/월
Vercel: $20/월
AI API: $50/월 (개발/테스트)
───────────────────
총: $147/월 (19만원)
```

### 시나리오 2: 베타 테스트 (20-30명)
```
Railway: $100/월 (스케일링)
Vercel: $20/월
AI API: $150/월 (중간 사용량)
───────────────────
총: $270/월 (35만원)
```

### 시나리오 3: 교육 기간 (50명+, 집중 사용)
```
Railway: $120/월 (3 인스턴스)
Vercel: $20/월
AI API: $250/월 (최적화 적용)
───────────────────
총: $390/월 (50.7만원)
```

### 시나리오 4: 교육 후 (유지 보수)
```
Railway: $50/월 (최소)
Vercel: $20/월
AI API: $30/월 (거의 사용 안함)
───────────────────
총: $100/월 (13만원)
```

**연간 총 비용**:
- 개발/베타 (4개월): $147 × 2 + $270 × 2 = $834
- 교육 기간 (2개월): $390 × 2 = $780
- 유지 보수 (6개월): $100 × 6 = $600
- **총**: $2,214/년 ≈ **287만원/년**
- **월 평균**: **24만원/월** ✅

---

## 🎯 즉시 시작 체크리스트

### 오늘 할 일 (2시간)
- [ ] Railway 계정 생성
- [ ] Vercel 계정 생성
- [ ] GitHub repository 확인
- [ ] 환경 변수 정리

### 이번 주 (Week 1)
- [ ] Railway 프로젝트 배포
- [ ] Vercel 프론트엔드 배포
- [ ] Dev 환경 테스트
- [ ] AI 캐싱 구현

### 다음 주 (Week 2)
- [ ] 멀티테넌시 구현
- [ ] Socket.IO 최적화
- [ ] 부하 테스트 (10명)

### 12월 말까지
- [ ] Staging 환경 완성
- [ ] 내부 데모 준비

---

## 💡 리스크 관리

### 리스크 1: AI API 비용 초과
**대응책**:
- Rate limiting 강화
- 일일 사용량 모니터링
- 예산 알림 ($300 도달 시 Slack 알림)

### 리스크 2: 동시 접속 50명 초과
**대응책**:
- Railway 자동 스케일링 (최대 5 인스턴스)
- 대기열 시스템 (필요시)

### 리스크 3: 데이터베이스 성능 저하
**대응책**:
- 인덱스 최적화
- Read Replica 추가 (필요시 +$50/월)

---

## 🚀 다음 단계

지금 바로 시작할 수 있습니다:

1. **설정 파일 생성** (제가 지금 만들어드림)
2. **Railway 배포** (10분)
3. **Vercel 배포** (5분)
4. **첫 테스트** (30분 후 완료)

시작할까요? 🎯
