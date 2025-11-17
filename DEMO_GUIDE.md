# 🎯 11시 시연용 - 빠른 실행 가이드

## ⚡ 가장 빠른 방법 (원클릭)

```bash
cd /Users/crystal/Desktop/work-redesign-platform
./demo-start.sh
```

스크립트가 자동으로:
- ✅ .env 파일 생성 (없을 경우)
- ✅ API 키 확인
- ✅ 서버 2개 자동 실행

종료할 때:
```bash
./demo-stop.sh
```

---

## 📋 수동 실행 방법

### 1단계: 프로젝트 폴더 이동
```bash
cd /Users/crystal/Desktop/work-redesign-platform
```

### 2단계: 환경 변수 설정 (처음 1번만)
```bash
cp .env.example .env
```

그 다음 `.env` 파일을 열어서 **꼭** 수정해야 할 항목:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx  ← 여기에 실제 API 키 입력
```

### 3단계: 서버 실행 (2개 터미널 필요)

**터미널 1 - Workshop Server (핵심 API)**
```bash
cd /Users/crystal/Desktop/work-redesign-platform
PORT=3001 node workshop-server.js
```

**터미널 2 - Frontend (화면)**
```bash
cd /Users/crystal/Desktop/work-redesign-platform/frontend
npm run dev
```

### 4단계: 브라우저 접속
```
http://localhost:3000
```

---

## 🔧 트러블슈팅

### Q1. "포트가 이미 사용 중입니다" 에러

**해결:**
```bash
# 포트 3001 죽이기
lsof -ti:3001 | xargs kill

# 포트 3000 죽이기
lsof -ti:3000 | xargs kill
```

### Q2. "ANTHROPIC_API_KEY is not defined" 에러

**해결:**
```bash
# .env 파일 열기
nano .env

# 또는
code .env

# ANTHROPIC_API_KEY 행 찾아서 실제 키 입력
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### Q3. Frontend가 안 열려요

**원인:** npm install이 안 되어 있을 수 있습니다.

**해결:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📊 시연 시나리오

### 1. 랜딩 페이지 (/)
- SK 신임 팀장용 플랫폼 소개
- "시작하기" 버튼 클릭

### 2. 워크샵 시작 (/workshop/[sessionId]/domains)
- 3-5개 업무 도메인 입력
- 예: "고객 지원", "마케팅", "데이터 분석"

### 3. 자료 업로드 (/upload)
- 파일 업로드 (DOCX, PDF, XLSX) 또는
- 텍스트 직접 입력

### 4. AI 분석 중 (/analysis)
- 실시간 진행률 표시
- Claude AI가 업무 추출 중

### 5. 칸반 보드 (/tasks)
- 🎯 **핵심 시연 화면**
- 4개 컬럼: 백로그 / 진행중 / 검토 / 완료
- 드래그 앤 드롭으로 업무 이동
- 업무 클릭 → 상세 정보 확인

### 6. Agent 시나리오 (/agents)
- 자동화 가능한 업무 확인
- AI 프롬프트, n8n 워크플로우, Python 스크립트 미리보기

### 7. 우선순위 선택 (/priority)
- Quick Win 업무 선정
- ROI 기반 추천

### 8. 결과물 다운로드 (/results)
- ZIP 파일로 모든 자동화 도구 다운로드

---

## 🎨 시연 팁

### 준비 사항
1. ✅ Chrome 브라우저 사용 (DevTools 열어두기)
2. ✅ 샘플 파일 준비 (예: 업무 목록 DOCX)
3. ✅ API 키 미리 테스트

### 시연 중 강조 포인트
- **35분 내** 업무 재설계 완성
- **AI 기반** 자동 분석 (Claude 3.5 Sonnet)
- **95-98% 정확도** 한국어 시간 표현 인식
- **90% 일관성** 중복 업무 제거
- **즉시 다운로드** 가능한 자동화 도구

### 백업 플랜
- 인터넷 끊김: 로컬 mock 데이터 사용
- API 한도 초과: 미리 캡처한 스크린샷 보여주기

---

## 📸 스크린샷 캡처 (선택사항)

시연 전 미리 캡처해두면 좋은 화면들:
```bash
# 1. 랜딩 페이지
open http://localhost:3000

# 2. 칸반 보드 (핵심)
open http://localhost:3000/workshop/demo/tasks

# 3. AI 분석 결과
open http://localhost:3000/workshop/demo/analysis
```

---

## ✅ 시연 전 체크리스트

- [ ] .env 파일에 API 키 입력됨
- [ ] workshop-server.js 실행 중 (포트 3001)
- [ ] frontend 실행 중 (포트 3000)
- [ ] http://localhost:3000 접속 확인
- [ ] 샘플 파일 준비됨
- [ ] Chrome 브라우저 준비
- [ ] 인터넷 연결 확인

---

## 🚀 최종 확인

터미널에서 이렇게 보이면 성공:

**터미널 1:**
```
✅ Workshop server running on http://localhost:3001
🤖 Claude API connected
📁 Upload directory ready
```

**터미널 2:**
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

**브라우저:** `http://localhost:3000` 접속 → 랜딩 페이지 보임

---

**준비 완료! 화이팅! 🎉**
