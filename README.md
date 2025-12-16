# Work Redesign Platform

SK 신임 팀장을 위한 AI 기반 업무 재설계 워크샵 도구

## 프로젝트 개요

### 목표
- **35분 내** 업무 재설계 완료
- **칸반 보드** 중심의 직관적 UI
- **즉시 사용 가능한** 자동화 도구 제공
- **Claude AI** 기반 지능형 분석

### 타겟 사용자
- **Primary**: SK 그룹 신임 팀장 (연 500명)
- **Secondary**: 기존 팀장 및 파트장
- **Tertiary**: SK 아카데미 교육 담당자

---

## 빠른 시작

### 데모 실행 (가장 간단)

```bash
# 데모 모드 실행 (DB 불필요)
./demo-start.sh

# 브라우저에서 접속
# 메인: http://localhost:3000
# API:  http://localhost:3001

# 종료
./demo-stop.sh
```

### 개발 환경 실행

#### Option A: Docker 사용 (추천)
```bash
# PostgreSQL + Redis 시작
docker compose up -d postgres redis

# 환경 변수 설정
export REDIS_URL=redis://localhost:6379

# 개발 서버 시작
npm run dev
```

#### Option B: 로컬 개발
```bash
# PostgreSQL, Redis가 로컬에 설치되어 있어야 함
npm run migrate  # 데이터베이스 마이그레이션
npm run seed     # 초기 데이터 생성
npm run dev      # 개발 서버 시작
```

### 접속 주소
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:4000 (또는 데모 모드: 3001)
- **API 문서**: http://localhost:4000/docs (Swagger)

---

## 시스템 아키텍처

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

## 프로젝트 구조

```
work-redesign-platform/
├── frontend/                    # Next.js 14 프론트엔드
│   ├── src/
│   │   ├── app/                 # App Router 페이지
│   │   │   ├── page.tsx         # 랜딩 페이지
│   │   │   └── workshop/        # 워크샵 페이지들
│   │   ├── components/          # 공통 컴포넌트
│   │   ├── lib/                 # 유틸리티 및 설정
│   │   ├── hooks/               # 커스텀 훅
│   │   └── store/               # 상태 관리 (Zustand)
│   └── package.json
│
├── backend/                     # Express.js 백엔드
│   ├── src/
│   │   ├── routes/              # API 라우트
│   │   ├── controllers/         # 비즈니스 로직
│   │   ├── services/            # 외부 서비스 연동
│   │   │   └── ai/              # Claude API 연동
│   │   ├── middleware/          # 미들웨어
│   │   └── config/              # 설정 및 환경변수 검증
│   └── package.json
│
├── workshop-pilot-system/       # 파일럿 테스팅 시스템
│   ├── 2-personas/
│   │   └── personas-v3.ts       # 30명 Synthetic Users
│   ├── phases/                  # 파일럿 프로세스
│   ├── run-real-pilot.ts        # 5명 샘플 테스트
│   ├── run-real-pilot-parallel.ts # 30명 병렬 테스트
│   └── outputs/                 # 보고서 출력
│
├── docs/                        # 문서
│   ├── 1-persona-integration/   # 페르소나 통합 가이드
│   ├── 2-deployment/            # 배포 가이드
│   ├── 3-workshop-demo/         # 워크샵/데모 가이드
│   └── 4-testing/               # 테스팅 가이드
│
├── demo-start.sh                # 데모 실행 스크립트
├── demo-stop.sh                 # 데모 종료 스크립트
├── workshop-server.js           # 간단한 워크샵 서버 (데모용)
├── docker-compose.yml           # Docker 설정
└── package.json
```

---

## 핵심 기능

### 1. 칸반 보드 (4개 컬럼)
- **백로그**: 정의된 업무들
- **진행중**: 현재 분석/수정 중인 업무
- **검토**: AI가 분석한 업무들
- **완료**: 확정된 업무들

### 2. AI 분석 엔진
- **Claude 3.5 Sonnet** 기반 고급 업무 분석
- **실시간 채팅** 인터페이스
- **자동 업무 구조화** (12개 필드 검증)
- **한국어 시간 표현 전처리** (95-98% 정확도)
- **중복 업무 자동 제거** (90% 일관성)
- **ROI 기반 우선순위** 자동 계산
- **Redis 캐싱** - AI API 비용 50% 절감

### 3. 파일 처리
- **다중 형식 지원**: DOCX, XLSX, PDF, TXT
- **실시간 파싱**
- **한국어 문서 최적화**

### 4. 자동화 도구 생성
- **프롬프트 템플릿**
- **워크플로우 JSON** (n8n, Zapier)
- **Python 스크립트** 자동 생성
- **즉시 다운로드** 가능한 패키지

---

## 파일럿 테스팅 시스템

### 개요

**30명의 Synthetic Users로 실제 HRD 파일럿 테스팅을 재현**하여:
- 직무별, 성숙도별, 팀 규모별로 **어느 단계에서 막히는지** 파악
- **실제로 하기 힘든 부분** 사전 발견
- **추가 가이드가 필요한 지점** 식별

### Synthetic Users

| 항목 | 실제 사용자 테스트 | Synthetic Users |
|------|-------------------|-----------------|
| **소요 시간** | 3일 | 40분 |
| **비용** | $3,000+ | $1.50 |
| **반복 가능성** | 1-2회 | 무제한 |
| **세그먼트 통제** | 어려움 | 정밀 통제 |

### 30명 페르소나 구성

- **8개 부서**: 마케팅, 영업, HR, R&D, 재무, IT, 생산, 네트워크운영
- **4단계 디지털 성숙도**: Beginner → Intermediate → Advanced → Expert
- **300+ 데이터 포인트**: 팀 구성, 업무 특성, pain points, 사용 도구

### 실행 방법

```bash
# 5명 샘플 테스트
npm run pilot:real

# 30명 전체 테스트 (병렬)
npm run pilot:real:full

# UI/UX 분석 보고서
npm run pilot:report:uiux

# UI 재추출 (프론트엔드 변경 시)
npm run pilot:ui-extract
```

### 파일럿 프로세스

1. **사전 인터뷰**: 참가자 배경, 기대, 우려 파악
2. **워크샵 진행**: Playwright로 실제 브라우저 실행
3. **중간 체크인**: 각 단계 후 피드백 수집
4. **사후 인터뷰**: 전체 경험 회고
5. **퍼실리테이터 분석**: 막힘 지점, 이탈 위험, 개선사항 도출

상세 내용: [workshop-pilot-system/README.md](workshop-pilot-system/README.md)

---

## 기술 스택

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

### Testing
- **E2E**: Playwright
- **Unit**: Jest
- **Pilot Testing**: Synthetic Users + Claude AI

---

## 환경 변수

### Backend (.env)
```bash
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000

# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/work_redesign
REDIS_URL=redis://localhost:6379

# 인증
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# AI 캐싱
ENABLE_AI_CACHE=true
AI_CACHE_TTL=3600
```

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_APP_NAME=Work Redesign Platform
```

---

## 개발 가이드

### 코드 스타일
```bash
npm run lint        # 린트 검사
npm run format      # 코드 포맷팅
npm run type-check  # 타입 검사
```

### 테스트
```bash
npm run test                # 전체 테스트
npm run test:backend        # 백엔드 테스트
npm run test:frontend       # 프론트엔드 테스트
npm run test:coverage       # 커버리지
```

### 데이터베이스
```bash
npm run migrate     # 마이그레이션 실행
npm run seed        # 시드 데이터 생성
```

---

## 문서

| 폴더 | 내용 |
|------|------|
| [docs/1-persona-integration/](docs/1-persona-integration/) | 페르소나 데이터 통합 가이드 |
| [docs/2-deployment/](docs/2-deployment/) | 배포 가이드 (Railway/Vercel) |
| [docs/3-workshop-demo/](docs/3-workshop-demo/) | 워크샵 진행 및 데모 가이드 |
| [docs/4-testing/](docs/4-testing/) | 테스팅 전략 및 가이드 |
| [workshop-pilot-system/](workshop-pilot-system/) | 파일럿 테스팅 시스템 |

---

## 로드맵

### Phase 1-4: 완료
- [x] 8단계 워크샵 플로우
- [x] 칸반 보드 기본 기능
- [x] Claude API 연동
- [x] AI 채팅 인터페이스
- [x] 파일 업로드 및 파싱
- [x] 자동화 도구 생성
- [x] Zod 타입 검증
- [x] Redis 캐싱
- [x] Rate Limiting

### Phase 5: 파일럿 테스팅 (완료)
- [x] Synthetic Users 시스템 구축
- [x] 30명 페르소나 정의 (personas-v3)
- [x] 실제 파일럿 프로세스 구현
- [x] UI/UX 분석 보고서 자동화
- [x] 페르소나 카드 UI 개선

### Phase 6: 배포 (진행 중)
- [ ] Backend 배포 (Railway)
- [ ] Frontend 배포 (Vercel)
- [ ] 도메인 연결 및 SSL
- [ ] 모니터링 설정

---

## 지원

- **이슈 리포트**: GitHub Issues
- **문서**: [/docs](docs/) 폴더
- **API 문서**: http://localhost:4000/docs

---

**SK Academy 전용 도구**
**35분 내 업무 재설계 완성**
**AI 기반 자동화 솔루션**
