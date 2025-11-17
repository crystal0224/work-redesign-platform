# Work Redesign Platform 🚀

SK 신임 팀장을 위한 AI 기반 업무 재설계 워크샵 도구

## 📋 프로젝트 개요

### 🎯 목표
- **35분 내** 업무 재설계 완료
- **칸반 보드** 중심의 직관적 UI
- **즉시 사용 가능한** 자동화 도구 제공
- **Claude AI** 기반 지능형 분석

### 👥 타겟 사용자
- **Primary**: SK 그룹 신임 팀장 (연 500명)
- **Secondary**: 기존 팀장 및 파트장
- **Tertiary**: SK 아카데미 교육 담당자

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────┐
│                Frontend                     │
│         Next.js 14 + TypeScript            │
│        Tailwind CSS + shadcn/ui            │
└─────────────────┬───────────────────────────┘
                  │ HTTPS / WebSocket
┌─────────────────┴───────────────────────────┐
│              Backend API                    │
│       Express + Socket.io + TypeScript     │
└─────────────────┬───────────────────────────┘
                  │
     ┌────────────┼────────────────┐
     │            │                │
┌────┴────┐  ┌───┴────┐      ┌────┴────┐
│PostgreSQL│  │ Redis  │      │   S3    │
│   RDS    │  │ Cache  │      │ Storage │
└─────────┘  └────────┘      └─────────┘
```

---

## 🚀 빠른 시작

### 1. 환경 설정
```bash
# 저장소 클론
git clone <repository-url>
cd work-redesign-platform

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 API 키 등 설정

# 전체 의존성 설치
npm run setup
```

### 2. 개발 환경 실행

#### Option A: Docker 사용 (추천)
```bash
# 데이터베이스 및 캐시 시작
docker-compose up -d postgres redis

# 애플리케이션 시작
npm run dev
```

#### Option B: 로컬 개발
```bash
# PostgreSQL, Redis가 로컬에 설치되어 있어야 함
npm run migrate  # 데이터베이스 마이그레이션
npm run seed     # 초기 데이터 생성
npm run dev      # 개발 서버 시작
```

### 3. 접속
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:4000
- **API 문서**: http://localhost:4000/docs (Swagger)

---

## 📁 프로젝트 구조

```
work-redesign-platform/
├── frontend/                    # Next.js 14 프론트엔드
│   ├── src/
│   │   ├── app/                 # App Router 페이지
│   │   │   ├── page.tsx         # 랜딩 페이지
│   │   │   └── workshop/        # 워크샵 페이지들
│   │   │       ├── [sessionId]/
│   │   │       │   ├── domains/      # 도메인 정의
│   │   │       │   ├── upload/       # 자료 업로드
│   │   │       │   ├── analysis/     # AI 분석
│   │   │       │   ├── tasks/        # 칸반 보드
│   │   │       │   ├── agents/       # Agent 시나리오
│   │   │       │   ├── priority/     # 우선순위 선택
│   │   │       │   └── results/      # 결과물 다운로드
│   │   │       └── components/       # 워크샵 컴포넌트
│   │   ├── components/          # 공통 컴포넌트
│   │   │   ├── ui/              # shadcn/ui 컴포넌트
│   │   │   └── shared/          # 공유 컴포넌트
│   │   ├── lib/                 # 유틸리티 및 설정
│   │   ├── hooks/               # 커스텀 훅
│   │   └── store/               # 상태 관리 (Zustand)
│   └── package.json
├── backend/                     # Express.js 백엔드
│   ├── src/
│   │   ├── routes/              # API 라우트
│   │   ├── controllers/         # 비즈니스 로직
│   │   ├── models/              # 데이터베이스 모델
│   │   ├── services/            # 외부 서비스 연동
│   │   │   ├── ai/              # Claude API 연동
│   │   │   ├── files/           # 파일 처리
│   │   │   └── email/           # 이메일 발송
│   │   ├── middleware/          # 미들웨어
│   │   ├── database/            # DB 스키마 및 마이그레이션
│   │   └── utils/               # 유틸리티
│   └── package.json
├── docker-compose.yml           # Docker 설정
├── .env.example                 # 환경 변수 템플릿
└── README.md
```

---

## 🎨 핵심 기능

### 1. 📊 칸반 보드 (4개 컬럼)
- **백로그**: 정의된 업무들
- **진행중**: 현재 분석/수정 중인 업무
- **검토**: AI가 분석한 업무들
- **완료**: 확정된 업무들

### 2. 🤖 AI 분석 엔진 ✨ **NEW: Enhanced**
- **Claude 3.5 Sonnet** 기반 고급 업무 분석
- **실시간 채팅** 인터페이스
- **자동 업무 구조화** (12개 필드 검증)
- **한국어 시간 표현 전처리** (95-98% 정확도)
- **중복 업무 자동 제거** (90% 일관성)
- **ROI 기반 우선순위** 자동 계산

### 3. 📁 파일 처리
- **다중 형식 지원**: DOCX, XLSX, PDF, TXT
- **실시간 파싱**
- **한국어 문서 최적화**

### 4. ⚙️ 자동화 도구 생성
- **프롬프트 템플릿**
- **워크플로우 JSON** (n8n, Zapier)
- **Python 스크립트** 자동 생성
- **즉시 다운로드** 가능한 패키지

### 5. 🔍 고급 데이터 검증 ✨ **NEW**
- **Zod 타입 시스템** - 런타임 타입 안정성
- **Robust JSON 파싱** - 3단계 재시도 전략
- **자동 에러 복구** - 부분 실패 허용
- **상세한 로깅** - 디버깅 지원

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + React Query
- **Animation**: Framer Motion
- **DnD**: react-beautiful-dnd

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express + Socket.io
- **Language**: TypeScript
- **Database**: PostgreSQL + Redis
- **AI**: Anthropic Claude API
- **Storage**: AWS S3

### DevOps
- **Containerization**: Docker + Docker Compose
- **Monitoring**: DataDog + Sentry
- **Analytics**: Google Analytics

---

## 📊 11개 핵심 화면

| #  | 화면명 | 설명 | 소요시간 |
|----|--------|------|----------|
| 1  | 랜딩 페이지 | SK SSO 로그인, 워크샵 소개 | 2분 |
| 2  | 도메인 정의 | 3-5개 업무 영역 입력 | 3분 |
| 3  | 자료 업로드 | 파일/텍스트 업로드 | 5분 |
| 4  | AI 분석 대기 | 실시간 진행률 표시 | 2분 |
| 5  | 칸반 보드 | 업무 시각화 및 수정 | 8분 |
| 6  | AI 채팅 | 불명확 부분 해결 | 5분 |
| 7  | Agent 시나리오 | 자동화 방안 확인 | 4분 |
| 8  | 프롬프트 미리보기 | 생성된 도구 확인 | 2분 |
| 9  | 우선순위 선택 | Quick Win 선정 | 2분 |
| 10 | 결과물 다운로드 | ZIP 패키지 생성 | 1분 |
| 11 | 성과 추적 | 실행 계획 수립 | 1분 |

**총 소요시간: 35분**

---

## 🔧 개발 가이드

### 코드 스타일
```bash
# 린트 검사
npm run lint

# 코드 포맷팅
npm run format

# 타입 검사
npm run type-check
```

### 테스트
```bash
# 전체 테스트
npm run test

# 특정 테스트
npm run test:backend
npm run test:frontend

# 커버리지
npm run test:coverage
```

### 데이터베이스
```bash
# 마이그레이션 실행
npm run migrate

# 마이그레이션 생성
npm run migrate:create

# 시드 데이터 생성
npm run seed
```

---

## 🚀 배포 가이드

### Development
```bash
docker-compose up -d
```

### Production
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 실행
NODE_ENV=production docker-compose --profile production up -d
```

---

## 📈 성능 목표

| 메트릭 | 목표 | 현재 |
|--------|------|------|
| 페이지 로드 시간 | < 2초 | - |
| AI 분석 시간 | < 30초 | - |
| 워크샵 완료율 | > 80% | - |
| 가용성 | 99.9% | - |
| 동시 사용자 | 100명 | - |

---

## 🔒 보안

- **인증**: SK SSO 연동
- **권한**: JWT 토큰 기반
- **데이터 암호화**: AES-256
- **파일 업로드**: 바이러스 스캔
- **API 보안**: Rate Limiting

---

## 📞 지원

- **이슈 리포트**: GitHub Issues
- **문서**: `/docs` 폴더
- **API 문서**: http://localhost:4000/docs

---

## 🎯 로드맵

### Phase 1: MVP (완료 ✅)
- [x] 프로젝트 구조 설정
- [x] 8단계 워크샵 플로우
- [x] 칸반 보드 기본 기능
- [x] Claude API 연동
- [x] 업무 추출 시스템

### Phase 2: Enhancement (완료 ✅)
- [x] AI 채팅 인터페이스
- [x] 파일 업로드 및 파싱 (DOCX, PDF, XLSX)
- [x] 자동화 도구 생성 (프롬프트, n8n, Python)
- [x] 한국어 시간 표현 전처리
- [x] 중복 제거 시스템
- [x] Zod 타입 검증

### Phase 3: Quality Improvement (완료 ✅)
- [x] **P0**: Zod 타입 검증 시스템
- [x] **P0**: Robust JSON 파싱 (3단계 재시도)
- [x] **P1**: 한국어 시간 전처리 (85% → 95-98%)
- [x] **P1**: 중복 업무 제거 (75% → 90%)
- [x] 테스트 커버리지: 24/24 (100%)

### Phase 4: Advanced Features (계획 중)
- [ ] **P2**: 임베딩 기반 도메인 매칭
- [ ] **P3**: Hot Reload + 응답 캐싱
- [ ] 성능 최적화 (응답 시간 < 2초)
- [ ] 모니터링 및 분석
- [ ] 배포 자동화 (CI/CD)

---

**🏢 SK Academy 전용 도구**
**⚡ 35분 내 업무 재설계 완성**
**🤖 AI 기반 자동화 솔루션**