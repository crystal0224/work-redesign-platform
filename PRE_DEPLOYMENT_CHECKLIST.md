# 🎯 배포 전 체크리스트 (다음 주 배포용)

> **배포 예정**: 다음 주 (12월 첫째 주)
> **목표**: 한 번에 문제없이 배포 성공

---

## 📅 지금 ~ 배포 전까지 해야 할 일

### ✅ 오늘 (지금 바로)

#### 1. 현재 작업 커밋
```bash
git add .
git commit -m "chore: Railway/Vercel 배포 설정 추가

- Railway 배포 설정 (railway.json, nixpacks.toml)
- Vercel 배포 설정 (vercel.json)
- AI 캐싱 서비스 추가 (비용 최적화)
- 배포 가이드 문서 작성
- 3월 교육과정 로드맵 수립
"
git push origin main
```

#### 2. 계정 미리 만들기 (5분)
```bash
# Railway 계정 생성
→ https://railway.app
→ "Login with GitHub" 클릭
→ 가입 완료

# Vercel 계정 생성
→ https://vercel.com
→ "Sign Up with GitHub" 클릭
→ 가입 완료

# ✅ 완료 후 메모: 계정 생성 완료
```

#### 3. Anthropic API Key 준비 (5분)
```bash
# Anthropic Console
→ https://console.anthropic.com
→ "Create API Key" 클릭
→ 키 복사해서 안전한 곳에 저장

# ⚠️ 주의: .env 파일에 절대 커밋하지 말 것!
# 임시 저장 위치: 1Password, LastPass, 또는 로컬 메모장
```

---

### 🔧 이번 주 중 (배포 전까지)

#### 1. 로컬 환경에서 미리 테스트

##### A. 백엔드 빌드 테스트
```bash
cd backend

# TypeScript 빌드 테스트
npm run build

# 빌드 성공 확인
ls dist/
# → server.js 파일이 있어야 함

# 만약 에러 발생하면 지금 수정!
```

##### B. Prisma 마이그레이션 테스트
```bash
cd backend

# 마이그레이션 파일 확인
ls prisma/migrations/

# 새 마이그레이션 생성 (변경사항 있으면)
npx prisma migrate dev --name add_production_indexes

# 프로덕션 마이그레이션 시뮬레이션
npx prisma migrate deploy --preview-feature
```

##### C. 프론트엔드 프로덕션 빌드 테스트
```bash
cd frontend

# 프로덕션 빌드
npm run build

# 빌드 결과 확인
ls .next/
# → .next 폴더가 생성되어야 함

# 에러 없이 빌드 완료되는지 확인!
```

##### D. 환경 변수 체크
```bash
# .env.production.template 복사
cp .env.production.template backend/.env.production

# 필수 변수들 채우기 (실제 값 말고 테스트용)
# - DATABASE_URL: postgresql://test:test@localhost:5432/test
# - REDIS_URL: redis://localhost:6379
# - ANTHROPIC_API_KEY: sk-ant-test (실제 키 말고 형식만)
# - JWT_SECRET: test-secret-minimum-32-characters-long

# 환경 변수로 앱 실행 테스트
cd backend
npm run build
NODE_ENV=production node dist/server.js

# 에러 없이 시작되는지 확인!
```

---

#### 2. Dependencies 정리 (선택적)

```bash
# 사용하지 않는 패키지 제거
cd backend
npm prune --production

cd frontend
npm prune --production

# 보안 취약점 확인
npm audit

# Critical 취약점 있으면 수정
npm audit fix
```

---

#### 3. 코드 품질 확인

```bash
# Linting
cd backend && npm run lint
cd frontend && npm run lint

# Type checking
cd backend && npm run type-check
cd frontend && npm run type-check

# 테스트 (있다면)
cd backend && npm test
cd frontend && npm test
```

---

## 🚀 배포 당일 (다음 주)

### Phase 1: Railway 백엔드 배포 (30분)

#### Step 1: Railway 프로젝트 생성
```bash
# CLI 설치 (한 번만)
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
cd /Users/crystal/Desktop/work-redesign-platform
railway init
# → 프로젝트 이름: work-redesign-backend

# ✅ 완료 확인: Railway 프로젝트 생성됨
```

#### Step 2: 데이터베이스 추가
```bash
# PostgreSQL 추가
railway add postgresql
# → 자동으로 DATABASE_URL 생성됨

# Redis 추가
railway add redis
# → 자동으로 REDIS_URL 생성됨

# ✅ 완료 확인: railway.app 대시보드에서 DB 2개 보임
```

#### Step 3: 환경 변수 설정
```bash
# 필수 환경 변수 추가
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set ANTHROPIC_API_KEY=실제_API_키
railway variables set JWT_SECRET=실제_시크릿_32자이상
railway variables set ENABLE_AI_CACHE=true
railway variables set AI_CACHE_TTL_SECONDS=86400
railway variables set ENABLE_BATCH_PROCESSING=true

# ✅ 완료 확인: railway variables 명령어로 확인
railway variables
```

#### Step 4: 첫 배포
```bash
cd backend

# 배포
railway up

# 배포 로그 실시간 확인
railway logs

# 예상 로그:
# ✓ Building...
# ✓ Running build command: npm run build
# ✓ Build completed
# ✓ Starting deployment...
# ✓ Deployment successful
# ✓ Service is running on https://xxx.up.railway.app

# ✅ 완료 확인: 200 OK 응답
curl https://your-backend.up.railway.app/health
```

#### Step 5: 데이터베이스 마이그레이션
```bash
# Railway 환경에서 마이그레이션 실행
railway run npx prisma migrate deploy

# 성공 메시지 확인:
# ✓ Migration applied successfully

# ✅ 완료 확인: 에러 없이 완료
```

#### Step 6: 배포된 URL 확인 및 저장
```bash
railway domain

# 출력 예시:
# https://work-redesign-backend-production-xxxx.up.railway.app

# ⚠️ 이 URL을 복사해두세요! (Vercel 설정에 필요)
```

---

### Phase 2: Vercel 프론트엔드 배포 (20분)

#### Step 1: Vercel 프로젝트 생성
```bash
# CLI 설치 (한 번만)
npm install -g vercel

# 로그인
vercel login

# 프로젝트 초기화
cd frontend
vercel

# 질문 답변:
# ? Set up and deploy? Y
# ? Which scope? (본인 계정)
# ? Link to existing project? N
# ? Project name? work-redesign-platform
# ? Directory? ./
# ? Override settings? N

# ✅ 완료 확인: Preview URL 생성됨
```

#### Step 2: 환경 변수 설정
```bash
# Production 환경 변수 추가

# 1. API URL
vercel env add NEXT_PUBLIC_API_URL production
# → 입력: https://your-backend.up.railway.app (Railway URL)

# 2. WebSocket URL
vercel env add NEXT_PUBLIC_WS_URL production
# → 입력: wss://your-backend.up.railway.app (Railway URL, https를 wss로)

# 3. App Name
vercel env add NEXT_PUBLIC_APP_NAME production
# → 입력: Work Redesign Platform

# ✅ 완료 확인: vercel env ls 로 확인
vercel env ls
```

#### Step 3: 프로덕션 배포
```bash
# 프로덕션 배포
vercel --prod

# 배포 진행 확인:
# ✓ Inspecting...
# ✓ Building...
# ✓ Uploading...
# ✓ Deploying...
# ✓ Success!

# 출력 예시:
# https://work-redesign-platform.vercel.app

# ✅ 완료 확인: 브라우저로 접속해서 페이지 뜨는지 확인
```

#### Step 4: Railway CORS 설정 업데이트
```bash
# Vercel URL을 Railway에 등록
railway variables set CORS_ORIGIN=https://work-redesign-platform.vercel.app

# Railway 자동 재배포 대기 (1-2분)

# ✅ 완료 확인: 프론트엔드에서 API 호출 되는지 확인
```

---

### Phase 3: 통합 테스트 (10분)

#### 체크리스트
```bash
# 브라우저에서 열기
open https://work-redesign-platform.vercel.app

# 테스트 항목:
□ 랜딩 페이지 로드
□ 워크샵 시작 버튼 클릭
□ Step 1 진행
□ Step 2 업무 영역 입력
□ Step 3 파일 업로드 (샘플 파일)
□ Step 4 AI 업무 추출
□ Step 5 AI 컨설팅 대화
□ WebSocket 실시간 업데이트 확인
□ 브라우저 콘솔에 에러 없음
□ Network 탭에서 API 호출 성공 (200 OK)

# ✅ 모두 통과하면 배포 성공!
```

---

## ⚠️ 예상 문제점과 해결책

### 문제 1: Railway 빌드 실패

**증상**:
```
Error: Build failed
npm ERR! Missing script: "build"
```

**해결책**:
```bash
# backend/package.json 확인
{
  "scripts": {
    "build": "tsc",  // ← 이 스크립트 있는지 확인
    "start": "node dist/server.js"
  }
}

# 없으면 추가 후 커밋 & 푸시
git add backend/package.json
git commit -m "fix: Add build script"
git push

# Railway 재배포
railway up
```

---

### 문제 2: Prisma 마이그레이션 실패

**증상**:
```
Error: Migration failed
P3009: Migrate found failed migrations
```

**해결책**:
```bash
# 방법 1: 마이그레이션 초기화 (개발 환경만!)
railway run npx prisma migrate reset --force

# 방법 2: 수동 마이그레이션
railway run npx prisma db push --accept-data-loss

# ⚠️ 프로덕션에서는 신중하게!
```

---

### 문제 3: CORS 에러

**증상**:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**해결책**:
```bash
# 1. Railway CORS 설정 확인
railway variables get CORS_ORIGIN

# 2. Vercel URL과 정확히 일치하는지 확인
# 틀리면 업데이트:
railway variables set CORS_ORIGIN=https://work-redesign-platform.vercel.app

# 3. 프로토콜 확인 (https:// 포함)
# 4. 슬래시 제거 (끝에 / 없어야 함)

# 5. Railway 재배포 대기 (자동, 1-2분)
```

---

### 문제 4: API 연결 안됨

**증상**:
```
Failed to fetch
Network Error
```

**해결책**:
```bash
# 1. Railway 서비스 상태 확인
railway status

# 2. 로그 확인
railway logs

# 3. Health check 테스트
curl https://your-backend.up.railway.app/health

# 4. Vercel 환경 변수 확인
vercel env ls

# 5. NEXT_PUBLIC_API_URL이 정확한지 확인
# 6. 잘못되었으면 다시 설정
vercel env rm NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL production
# → 올바른 Railway URL 입력

# 7. Vercel 재배포
vercel --prod
```

---

### 문제 5: 환경 변수 오타

**증상**:
```
Error: ANTHROPIC_API_KEY is not defined
```

**해결책**:
```bash
# Railway 변수 확인
railway variables

# 오타 찾기:
# - ANTRHOPIC_API_KEY ❌
# - ANTHROPIC_API_KEY ✅

# 잘못된 변수 삭제
railway variables delete ANTRHOPIC_API_KEY

# 올바른 변수 추가
railway variables set ANTHROPIC_API_KEY=sk-ant-xxx

# 자동 재배포 대기
```

---

## 📋 최종 체크리스트 (배포 당일)

### 배포 전
- [ ] 로컬 빌드 테스트 완료 (`npm run build`)
- [ ] Railway 계정 생성 완료
- [ ] Vercel 계정 생성 완료
- [ ] Anthropic API Key 준비
- [ ] JWT Secret 생성 (32자 이상)
- [ ] 현재 코드 모두 커밋 & 푸시

### Railway 배포
- [ ] Railway 프로젝트 생성
- [ ] PostgreSQL 추가
- [ ] Redis 추가
- [ ] 환경 변수 설정 (10개)
- [ ] Backend 배포 성공
- [ ] 마이그레이션 완료
- [ ] Health check 200 OK
- [ ] 배포 URL 복사

### Vercel 배포
- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정 (3개)
- [ ] 프로덕션 배포 성공
- [ ] Railway CORS 설정
- [ ] 페이지 로드 확인

### 통합 테스트
- [ ] 전체 워크플로우 테스트
- [ ] API 호출 성공
- [ ] WebSocket 연결
- [ ] 에러 없음
- [ ] 배포 성공 🎉

---

## 🎯 미리 준비할 것 정리

### 1. 지금 바로 (5분)
```bash
# 계정 생성
→ Railway.app 가입
→ Vercel.com 가입
→ Anthropic Console API Key 발급

# 완료!
```

### 2. 이번 주 중
```bash
# 로컬 테스트
cd backend && npm run build
cd frontend && npm run build

# 문제 있으면 지금 수정
```

### 3. 배포 당일 준비물
```
✅ Anthropic API Key
✅ JWT Secret (32자 이상 랜덤 문자열)
✅ 인터넷 연결
✅ 1시간 여유 시간
✅ 이 체크리스트!
```

---

## 💡 시간 절약 팁

### 배포 순서 최적화
```bash
# ⏱️ 총 소요 시간: 1시간

# 1. Railway 설정 (10분)
→ 프로젝트 생성, DB 추가, 환경 변수

# 2. Railway 배포 (15분)
→ 배포 시작, 빌드 대기, 마이그레이션

# 3. Vercel 설정 (5분)
→ 프로젝트 생성, 환경 변수

# 4. Vercel 배포 (10분)
→ 배포 시작, 빌드 대기

# 5. 통합 테스트 (10분)
→ 전체 기능 테스트

# 6. 문제 해결 버퍼 (10분)
→ 만약의 사태 대비
```

---

## 📞 긴급 연락처

### Railway 지원
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Vercel 지원
- Docs: https://vercel.com/docs
- Help: https://vercel.com/help

---

## 🎉 배포 성공 후

### 1. URL 공유
```
프론트엔드: https://work-redesign-platform.vercel.app
백엔드: https://your-backend.up.railway.app
```

### 2. 모니터링 설정
```bash
# Railway 대시보드
→ Metrics 확인
→ Logs 모니터링

# Vercel 대시보드
→ Analytics 확인
```

### 3. 다음 단계
- [ ] 베타 테스터 초대
- [ ] 피드백 수집
- [ ] 개선 작업
- [ ] 3월 교육 준비

---

**마지막 조언**:
- 🕐 **시간 여유 있을 때 배포하세요** (급하게 하면 실수 생김)
- 📝 **이 체크리스트 옆에 두고 하나씩 체크**
- 🆘 **막히면 바로 로그 확인** (`railway logs`, `vercel logs`)
- 💬 **문제 생기면 언제든 물어보세요!**

Good luck! 🚀
