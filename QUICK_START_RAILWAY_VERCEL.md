# 🚀 빠른 시작 가이드: Railway + Vercel 배포

> **목표**: 30분 안에 프로덕션 환경 구축하기

---

## ✅ 사전 준비 (5분)

### 1. 계정 생성

```bash
# Railway (https://railway.app)
→ GitHub 계정으로 로그인

# Vercel (https://vercel.com)
→ GitHub 계정으로 로그인
```

### 2. CLI 설치

```bash
# Railway CLI
npm install -g @railway/cli

# Vercel CLI
npm install -g vercel

# 로그인 확인
railway login
vercel login
```

---

## 📦 Step 1: Railway 백엔드 배포 (15분)

### 1-1. Railway 프로젝트 생성

```bash
cd /Users/crystal/Desktop/work-redesign-platform

# Railway 프로젝트 초기화
railway init

# 프로젝트 이름: work-redesign-backend
```

### 1-2. PostgreSQL 추가

```bash
# Railway 대시보드 또는 CLI
railway add postgresql

# 자동으로 DATABASE_URL 환경 변수 생성됨
```

### 1-3. Redis 추가

```bash
railway add redis

# 자동으로 REDIS_URL 환경 변수 생성됨
```

### 1-4. 환경 변수 설정

```bash
# 필수 환경 변수 추가
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set ANTHROPIC_API_KEY=your-key-here
railway variables set ENABLE_AI_CACHE=true
railway variables set JWT_SECRET=your-super-secret-minimum-32-chars

# CORS Origin은 Vercel 배포 후 설정
# railway variables set CORS_ORIGIN=https://your-app.vercel.app
```

### 1-5. 백엔드 배포

```bash
# backend 디렉토리로 이동
cd backend

# Railway에 배포
railway up

# 배포 진행 상황 확인
# ✓ Building
# ✓ Deploying
# ✓ Success!

# 배포된 URL 확인
railway domain
# 출력: https://work-redesign-backend-production-xxxx.up.railway.app
```

### 1-6. 데이터베이스 마이그레이션

```bash
# Railway Shell에서 실행
railway run npx prisma migrate deploy

# 또는 로컬에서 Railway DB에 연결
railway run npx prisma db push
```

### 1-7. 배포 확인

```bash
# Health check
curl https://your-backend-url.up.railway.app/health

# 응답:
# {
#   "status": "ok",
#   "timestamp": "2025-11-22T10:00:00.000Z",
#   "uptime": 123
# }
```

**✅ 백엔드 배포 완료!**

---

## 🎨 Step 2: Vercel 프론트엔드 배포 (10분)

### 2-1. Vercel 프로젝트 생성

```bash
cd frontend

# Vercel 초기화
vercel

# 질문 답변:
# ? Set up and deploy "~/work-redesign-platform/frontend"? [Y/n] Y
# ? Which scope do you want to deploy to? (본인 계정 선택)
# ? Link to existing project? [y/N] N
# ? What's your project's name? work-redesign-platform
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] N
```

### 2-2. 환경 변수 설정

```bash
# Production 환경 변수
vercel env add NEXT_PUBLIC_API_URL production
# → Railway 백엔드 URL 입력: https://your-backend.up.railway.app

vercel env add NEXT_PUBLIC_WS_URL production
# → Railway WebSocket URL: wss://your-backend.up.railway.app

vercel env add NEXT_PUBLIC_APP_NAME production
# → Work Redesign Platform
```

### 2-3. 프로덕션 배포

```bash
# 프로덕션 배포
vercel --prod

# 배포 진행...
# ✓ Inspecting
# ✓ Building
# ✓ Deploying
# ✓ Success!

# 출력:
# https://work-redesign-platform.vercel.app
```

### 2-4. Railway CORS 설정 업데이트

```bash
# Railway에 Vercel URL 설정
railway variables set CORS_ORIGIN=https://work-redesign-platform.vercel.app

# 재배포 (자동)
```

**✅ 프론트엔드 배포 완료!**

---

## 🧪 Step 3: 동작 테스트 (5분)

### 3-1. 프론트엔드 접속

```bash
# 브라우저에서 열기
open https://work-redesign-platform.vercel.app

# 또는
vercel open
```

### 3-2. 기본 기능 테스트

```
1. 랜딩 페이지 로드 확인
2. "워크샵 시작" 버튼 클릭
3. Step 1-2-3 진행
4. 파일 업로드 테스트
5. AI 분석 테스트
6. WebSocket 연결 확인 (실시간 업데이트)
```

### 3-3. 로그 확인

```bash
# Railway 로그 (실시간)
railway logs

# Vercel 로그
vercel logs
```

**✅ 전체 시스템 작동 확인!**

---

## 🔄 일상적인 수정 및 배포

### 시나리오 1: 프론트엔드 UI 수정

```bash
# 1. 코드 수정
code frontend/src/components/workshop/Step5.tsx

# 2. 로컬 테스트
cd frontend
npm run dev
# → http://localhost:3000 확인

# 3. 커밋 & 푸시
git add .
git commit -m "feat: Step 5 UI 개선"
git push origin main

# → Vercel이 자동으로 감지하고 배포 (1-2분)
# → https://work-redesign-platform.vercel.app 자동 업데이트
```

### 시나리오 2: 백엔드 API 수정

```bash
# 1. 코드 수정
code backend/src/services/ai-analysis.service.ts

# 2. 로컬 테스트
cd backend
npm run dev

# 3. 커밋 & 푸시
git add .
git commit -m "fix: AI 분석 최적화"
git push origin main

# → Railway가 자동으로 감지하고 배포 (2-3분)
# → https://your-backend.up.railway.app 자동 업데이트
```

### 시나리오 3: 환경 변수 변경

```bash
# Railway 환경 변수 변경
railway variables set ENABLE_AI_CACHE=true

# Vercel 환경 변수 변경
vercel env add NEXT_PUBLIC_FEATURE_FLAG production
# → 입력: true

# 재배포 (Vercel은 수동 재배포 필요)
vercel --prod
```

---

## 🔙 롤백 (문제 발생 시)

### Railway 롤백

```bash
# 방법 1: CLI
railway rollback

# 방법 2: 대시보드
# → railway.app → Deployments → 이전 버전 선택 → "Redeploy"
```

### Vercel 롤백

```bash
# 방법 1: CLI
vercel rollback

# 방법 2: 대시보드
# → vercel.com → Deployments → 이전 버전 선택 → "Promote to Production"
```

---

## 📊 모니터링

### Railway 모니터링

```bash
# 실시간 로그
railway logs

# 메트릭 확인
railway metrics
# → CPU, Memory, Network 사용량

# 배포 히스토리
railway deployments
```

### Vercel Analytics (무료)

```typescript
// frontend/pages/_app.tsx에 추가
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

---

## 💰 비용 확인

### Railway 비용

```bash
# Railway 대시보드
→ Usage → Current Usage

# 예상 비용 확인
→ Billing → Usage History
```

### Vercel 비용

```bash
# Vercel 대시보드
→ Settings → Usage
→ Billing → Invoices
```

**알림 설정**:
- Railway: Settings → Notifications → Budget alerts
- Vercel: Settings → Notifications → Usage alerts

---

## 🎯 체크리스트

배포 완료 후 확인:

- [ ] Railway 백엔드 배포 성공
- [ ] PostgreSQL 연결 확인
- [ ] Redis 연결 확인
- [ ] Vercel 프론트엔드 배포 성공
- [ ] API 연결 확인 (CORS 설정)
- [ ] WebSocket 연결 확인
- [ ] 파일 업로드 테스트
- [ ] AI 분석 테스트
- [ ] 로그 수집 확인
- [ ] 환경 변수 모두 설정
- [ ] 커스텀 도메인 설정 (선택)

---

## 🔧 트러블슈팅

### 문제 1: CORS 에러

```bash
# Railway CORS 설정 확인
railway variables get CORS_ORIGIN

# Vercel URL과 일치하는지 확인
# 틀리면 업데이트:
railway variables set CORS_ORIGIN=https://your-app.vercel.app
```

### 문제 2: 데이터베이스 연결 실패

```bash
# DATABASE_URL 확인
railway variables get DATABASE_URL

# Prisma migrate 재실행
railway run npx prisma migrate deploy
```

### 문제 3: 빌드 실패

```bash
# 로그 확인
railway logs

# 로컬에서 빌드 테스트
cd backend
npm run build

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### 문제 4: AI API 에러

```bash
# Anthropic API Key 확인
railway variables get ANTHROPIC_API_KEY

# 올바른 키로 업데이트
railway variables set ANTHROPIC_API_KEY=sk-ant-your-key
```

---

## 📞 도움말

### Railway 지원
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Vercel 지원
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Status: https://vercel-status.com

---

## 🎉 완료!

이제 다음이 가능합니다:

✅ **Git push → 자동 배포** (1-2분)
✅ **실시간 로그 모니터링**
✅ **원클릭 롤백**
✅ **비용 추적**
✅ **무중단 배포**

**다음 단계**:
1. 커스텀 도메인 설정 (선택)
2. Sentry 에러 트래킹 추가 (선택)
3. 베타 테스터 초대
4. 사용 데이터 수집

수고하셨습니다! 🚀
