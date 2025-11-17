# Work Redesign Platform - Backend

## ✨ 주요 기능

### AI 기반 업무 분석 엔진
- **Claude 3.5 Sonnet** 통합
- **Zod 타입 검증** - 12개 필드 런타임 검증
- **Robust JSON 파싱** - 3단계 재시도 전략
- **한국어 시간 표현 전처리** - 10가지 패턴 지원
- **중복 업무 제거** - Levenshtein + Jaccard 알고리즘

### 파일 처리
- 다중 형식 지원: DOCX, XLSX, PDF, TXT
- 한국어 문서 최적화
- 실시간 파싱

### 자동화 도구 생성
- AI 프롬프트 템플릿
- n8n/Zapier 워크플로우 JSON
- Python 자동화 스크립트

---

## 🚀 빠른 시작

### 1. 환경 설정
```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 값들을 설정하세요
```

### 2. 데이터베이스 실행 (Docker Compose)
```bash
# Docker Desktop이 실행 중인지 확인 후
docker-compose up -d

# 데이터베이스 스키마 생성
npx prisma db push

# (선택사항) 초기 데이터 생성
npm run seed
```

### 3. 서버 실행
```bash
# 개발 모드
npm run dev

# 또는 프로덕션 빌드
npm run build
npm start
```

## 🗄️ 데이터베이스

### PostgreSQL
- **URL**: localhost:5432
- **Database**: work_redesign
- **User**: workredesign
- **Password**: password123

### Redis
- **URL**: localhost:6379

### pgAdmin (데이터베이스 관리)
- **URL**: http://localhost:5050
- **Email**: admin@workredesign.com
- **Password**: admin123

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 타입 체크
npm run type-check

# 린트
npm run lint
npm run lint:fix

# 테스트
npm test
npm run test:watch
npm run test:coverage

# 데이터베이스
npm run migrate
npm run db:generate
npm run db:studio

# 프로덕션 빌드
npm run build
```

## 🌐 API 엔드포인트

- **서버**: http://localhost:4000
- **API 문서**: http://localhost:4000/docs (개발 모드)
- **Health Check**: http://localhost:4000/health

## 📁 프로젝트 구조

```
src/
├── app.ts              # Express 앱 설정
├── server.ts           # 서버 진입점
├── config/             # 설정 파일들
├── controllers/        # 컨트롤러
├── middleware/         # 미들웨어
├── models/            # 데이터 모델
├── routes/            # 라우터
├── services/          # 비즈니스 로직
├── types/             # TypeScript 타입 정의
└── utils/             # 유틸리티 함수들
```

## 🔐 환경 변수

주요 환경 변수들:

```env
# 기본 설정
NODE_ENV=development
API_PORT=4000

# 데이터베이스
DATABASE_URL=postgresql://workredesign:password123@localhost:5432/work_redesign

# 보안
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key

# AI 서비스
ANTHROPIC_API_KEY=your_anthropic_api_key

# 파일 업로드
UPLOAD_PATH=./uploads/workshops
TEMPLATES_PATH=./generated_templates
```

## 🧪 테스트

### 단위 테스트
```bash
# Zod 검증 테스트
node test-zod-validation.js

# 한국어 시간 정규화 테스트
node test-time-normalization.js

# 중복 제거 테스트
node test-deduplication.js
```

**테스트 커버리지**: 24/24 (100%)
- Zod 검증: 8/8 ✅
- 시간 정규화: 10/10 ✅
- 중복 제거: 6/6 ✅

## 🚫 Docker 중지

```bash
# 컨테이너 중지
docker-compose down

# 볼륨까지 삭제
docker-compose down -v
```

## 🔍 문제 해결

### Docker 관련 문제
1. Docker Desktop이 실행 중인지 확인
2. `docker --version`으로 Docker 설치 확인
3. 포트 충돌 시 docker-compose.yml에서 포트 변경

### 데이터베이스 연결 문제
1. Docker 컨테이너 상태 확인: `docker-compose ps`
2. 로그 확인: `docker-compose logs postgres`
3. 데이터베이스 재시작: `docker-compose restart postgres`

### 의존성 문제
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```