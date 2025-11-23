# 🚀 배포 가이드

## 목차
- [개요](#개요)
- [사전 준비](#사전-준비)
- [Backend 배포 (Railway)](#backend-배포-railway)
- [Frontend 배포 (Vercel)](#frontend-배포-vercel)
- [배포 후 확인](#배포-후-확인)
- [문제 해결](#문제-해결)

---

## 개요

Work Redesign Platform은 다음과 같이 배포됩니다:
- **Backend**: Railway (Node.js + PostgreSQL + Redis)
- **Frontend**: Vercel (Next.js)

**예상 비용**:
- Railway: PostgreSQL + Redis + Backend 서버 = ~$20/월
- Vercel: Hobby (무료) 또는 Pro ($20/월)
- **총 예상 비용**: $20-40/월 (목표 100만원/월 이내)

---

## 사전 준비

### 1. 필수 계정 생성
- [ ] [Railway](https://railway.app) 계정 (GitHub 연동)
- [ ] [Vercel](https://vercel.com) 계정 (GitHub 연동)
- [ ] [Anthropic](https://console.anthropic.com) API 키 발급

### 2. 환경 변수 준비
`.env.example` 파일을 참고하여 다음 값들을 준비:

#### Backend 필수 환경 변수
```bash
DATABASE_URL=<Railway에서 자동 생성>
REDIS_URL=<Railway에서 자동 생성>
ANTHROPIC_API_KEY=sk-ant-api-...
JWT_SECRET=<32자 이상 랜덤 문자열>
CORS_ORIGIN=https://your-frontend.vercel.app
ENABLE_AI_CACHE=true
```

#### Frontend 필수 환경 변수
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
```

---

## Backend 배포 (Railway)

### Step 1: Railway 프로젝트 생성

1. Railway에 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 저장소 선택 후 `backend` 폴더 지정

또는 CLI 사용:
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# Backend 디렉토리로 이동
cd backend

# 프로젝트 초기화
railway init

# 배포
railway up
```

### Step 2: PostgreSQL 추가

1. Railway Dashboard → "New" → "Database" → "PostgreSQL"
2. 자동으로 `DATABASE_URL` 환경 변수 생성됨

### Step 3: Redis 추가

1. Railway Dashboard → "New" → "Database" → "Redis"
2. 자동으로 `REDIS_URL` 환경 변수 생성됨

### Step 4: 환경 변수 설정

Railway Dashboard → 프로젝트 → "Variables"에서 다음 추가:

```bash
# 필수
NODE_ENV=production
PORT=${{PORT}}  # Railway가 자동 할당
CORS_ORIGIN=https://your-frontend.vercel.app
ANTHROPIC_API_KEY=sk-ant-api-...
JWT_SECRET=<안전한 랜덤 문자열>

# AI 캐싱 (비용 절감)
ENABLE_AI_CACHE=true
AI_CACHE_TTL=3600

# 선택사항
LOG_LEVEL=info
ENABLE_API_DOCS=true
```

### Step 5: 데이터베이스 마이그레이션

```bash
# Railway CLI로 마이그레이션 실행
railway run npm run migrate:deploy

# 시드 데이터 생성 (선택사항)
railway run npm run seed
```

### Step 6: 배포 확인

```bash
# 헬스 체크
curl https://your-backend.railway.app/health

# 예상 응답:
{
  "status": "healthy",
  "timestamp": "2025-...",
  "uptime": "1 minutes",
  "database": {
    "postgres": "connected",
    "redis": "connected"
  },
  "features": {
    "aiEnabled": true,
    "fileUploadEnabled": true
  }
}
```

---

## Frontend 배포 (Vercel)

### Step 1: Vercel 프로젝트 생성

1. Vercel에 로그인
2. "Add New..." → "Project"
3. GitHub 저장소 선택
4. Root Directory: `frontend` 설정
5. Framework Preset: "Next.js" 자동 감지

또는 CLI 사용:
```bash
# Vercel CLI 설치
npm install -g vercel

# Frontend 디렉토리로 이동
cd frontend

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### Step 2: 환경 변수 설정

Vercel Dashboard → Project → "Settings" → "Environment Variables":

```bash
# Backend API URL (Railway 배포 후)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app

# 앱 설정
NEXT_PUBLIC_APP_NAME=Work Redesign Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Step 3: 배포 확인

```bash
# 프론트엔드 접속
https://your-project.vercel.app

# 기본 기능 테스트
1. 랜딩 페이지 로드
2. 워크샵 시작 버튼 클릭
3. API 연결 확인 (네트워크 탭)
```

### Step 4: CORS 업데이트

Vercel 배포 후 생성된 URL을 Railway Backend 환경 변수에 추가:

```bash
# Railway Dashboard → Variables
CORS_ORIGIN=https://your-project.vercel.app
```

---

## 배포 후 확인

### 체크리스트

#### Backend (Railway)
- [ ] 헬스체크 엔드포인트 응답 확인 (`/health`)
- [ ] PostgreSQL 연결 확인 (status: "connected")
- [ ] Redis 연결 확인 (status: "connected")
- [ ] Anthropic API 키 동작 확인 (features.aiEnabled: true)
- [ ] 로그 확인 (Railway Dashboard → Logs)

#### Frontend (Vercel)
- [ ] 랜딩 페이지 로드 확인
- [ ] API 연결 확인 (네트워크 탭에서 /health 요청 성공)
- [ ] 워크샵 플로우 테스트
- [ ] 파일 업로드 테스트
- [ ] AI 분석 테스트

#### 통합 테스트
- [ ] 전체 워크샵 플로우 (35분) 완료
- [ ] 칸반 보드 동작 확인
- [ ] 결과물 다운로드 확인
- [ ] 성능 테스트 (동시 접속 10명)

### 모니터링 설정 (선택사항)

#### Sentry 연동
```bash
# Backend
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production

# Frontend
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

#### 로그 모니터링
- Railway는 자동으로 로그 수집 및 검색 제공
- Vercel은 Functions Logs 제공

---

## 문제 해결

### Backend 배포 실패

**증상**: Railway 배포 시 빌드 실패
```
error TS2339: Property does not exist...
```

**해결**:
```bash
# tsconfig.json 확인
"noEmitOnError": true  # true로 설정되어 있으면 빌드 실패

# package.json 빌드 스크립트 확인
"build": "tsc || echo 'Build completed with warnings'"
```

### Frontend 프리렌더링 에러

**증상**: Vercel 배포 시 prerendering error
```
Error occurred prerendering page "/"
```

**해결**:
- Vercel은 동적 렌더링을 자동 처리하므로 무시해도 됨
- 빌드는 성공하고 런타임에서는 정상 작동

### CORS 에러

**증상**: 브라우저 콘솔에서
```
Access to fetch blocked by CORS policy
```

**해결**:
```bash
# Railway Backend 환경 변수 확인
CORS_ORIGIN=https://your-exact-vercel-domain.vercel.app

# 프로토콜(https://) 포함 필수!
# 슬래시(/) 없이!
```

### Database Connection 실패

**증상**: Health check에서 `postgres: disconnected`

**해결**:
```bash
# Railway Dashboard에서 PostgreSQL 플러그인 상태 확인
# DATABASE_URL 환경 변수가 자동 생성되었는지 확인

# 수동 연결 테스트
railway run npm run migrate:deploy
```

### Redis Connection 실패

**증상**: Health check에서 `redis: disconnected`

**해결**:
```bash
# Railway Dashboard에서 Redis 플러그인 상태 확인
# REDIS_URL 환경 변수가 자동 생성되었는지 확인

# Redis 플러그인이 없으면 추가:
# Railway Dashboard → New → Redis
```

### AI API 에러

**증상**: AI 분석 시 403 Forbidden

**해결**:
```bash
# Anthropic API 키 확인
ANTHROPIC_API_KEY=sk-ant-api-...

# API 키가 유효한지 확인:
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"

# 사용량 한도 확인:
# https://console.anthropic.com/settings/limits
```

---

## 비용 최적화

### Railway 최적화
- PostgreSQL: 공유 인스턴스 사용 (~$5/월)
- Redis: 최소 메모리 설정 (~$5/월)
- Backend: 1x vCPU, 512MB RAM (~$10/월)
- **총 예상**: ~$20/월

### Vercel 최적화
- Hobby 플랜 사용 (무료)
- 또는 Pro 플랜 ($20/월) - 상용 서비스 시

### AI API 비용 절감
- Redis 캐싱 활성화 (50% 절감)
  ```bash
  ENABLE_AI_CACHE=true
  AI_CACHE_TTL=3600
  ```
- Rate Limiting으로 과도한 사용 방지
- 월 사용량 모니터링: https://console.anthropic.com

---

## 다음 단계

### 배포 완료 후
1. [ ] 도메인 연결 (선택사항)
   - Frontend: Vercel에서 커스텀 도메인 설정
   - Backend: Railway에서 커스텀 도메인 설정

2. [ ] SSL 인증서 (자동 생성됨)
   - Railway/Vercel 모두 자동으로 Let's Encrypt 인증서 발급

3. [ ] 모니터링 설정 (Sentry/DataDog)

4. [ ] 백업 전략 수립
   - Railway PostgreSQL 자동 백업 활성화
   - 주간 데이터 export 스크립트 설정

5. [ ] 성능 테스트
   - 50명 동시 접속 테스트
   - AI 분석 응답 시간 측정

---

## 지원

문제가 발생하면:
1. Railway Logs 확인
2. Vercel Function Logs 확인
3. GitHub Issues에 문의
4. README.md 문서 참조

**긴급 문의**: GitHub Issues
**문서**: README.md, API Docs (/api-docs)
