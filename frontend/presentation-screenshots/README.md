# Work Re-design Platform 프레젠테이션 스크린샷 가이드

## 📸 스크린샷 사양
- **해상도**: 1920x1080 (Full HD)
- **비율**: 16:9 (프레젠테이션 최적화)
- **형식**: PNG (고품질)
- **생성일**: 2024-11-17

## 📂 파일 목록 및 설명

### 1. 랜딩 페이지 (Landing Page)
- **01_landing_home.png** - 메인 히어로 섹션
  - Work Re-design 플랫폼 소개
  - 주요 가치 제안
  - CTA 버튼

- **02_landing_features.png** - 주요 기능 소개
  - 3가지 핵심 기능 카드
  - 시각적 아이콘과 설명

### 2. 워크샵 플로우 (Workshop Flow)

#### Step 1: 워크샵 시작
- **03_workshop_step1_start.png**
  - 워크샵 소개 및 목적 설명
  - 미처 시도하지 못한 업무 입력
  - 글래스모피즘 디자인

#### Step 2: 업무 영역 정의
- **04_workshop_step2_domains.png**
  - 3개의 주요 업무 영역 입력
  - 예시: 고객 지원, 마케팅, 데이터 분석
  - 동적 추가/삭제 기능

#### Step 3: 업무 내용 입력
- **05_workshop_step3_input.png**
  - 파일 업로드 영역 (좌측)
  - 직접 입력 영역 (우측)
  - 통합 처리 방식

#### Step 4: AI 업무 추출 결과
- **06_workshop_step4_extraction.png**
  - 영역별 업무 카드 표시
  - 드래그앤드롭 재분류 기능
  - 자동화 가능성 표시 (High/Medium/Low)

#### Step 5: AI 자동화 컨설팅
- **07_workshop_step5_ai_consulting.png**
  - AI 채팅 인터페이스
  - 업무별 자동화 추천
  - 대화형 솔루션 설계

#### Step 6: 워크플로우 설계
- **08_workshop_step6_workflow.png**
  - n8n 스타일 워크플로우 비주얼라이제이션
  - Human/AI/Hybrid 노드 구분
  - 드래그앤드롭 워크플로우 구성

#### Step 7: 최종 결과
- **09_workshop_step7_results.png**
  - 자동화 솔루션 요약
  - 다운로드 옵션 (PDF, Excel, ZIP)
  - 구현 가이드

### 3. 칸반 보드
- **10_kanban_board.png**
  - 업무 관리 대시보드
  - To Do / In Progress / Done 컬럼
  - 실시간 업무 추적

## 🎨 디자인 특징

### 글래스모피즘 (Glassmorphism)
- 반투명 배경 (backdrop-blur)
- 부드러운 그림자 효과
- 애니메이션 그라디언트 배경

### 색상 팔레트
- Primary: Indigo (#4F46E5)
- Secondary: Purple (#9333EA)
- Accent: Blue (#3B82F6)
- Background: 그라디언트 (Blue-50 → Indigo-50 → Purple-50)

## 📊 프레젠테이션 활용 가이드

### PowerPoint/Keynote 사용법
1. 이미지를 슬라이드에 드래그앤드롭
2. 16:9 비율이므로 전체 화면 표시 가능
3. 필요시 crop 없이 바로 사용

### 추천 슬라이드 구성
1. **표지**: 플랫폼 소개
2. **문제 정의**: 현재 업무의 비효율성
3. **솔루션 소개**: Work Re-design 플랫폼
4. **주요 기능**: 랜딩 페이지 스크린샷
5. **워크샵 프로세스**: Step 1-7 순차 설명
6. **데모**: 실제 화면 시연
7. **효과**: 기대 효과 및 ROI
8. **다음 단계**: 도입 계획

### 발표 팁
- 각 스크린샷마다 2-3분 설명
- 실제 데모와 병행하여 진행
- Before/After 비교 강조
- ROI 및 시간 절감 효과 수치화

## 🔧 추가 커스터마이징

### 스크린샷 재생성
```bash
node capture-workshop-flow.js
```

### 특정 단계만 캡처
스크립트에서 원하는 단계만 선택적으로 실행 가능

### 해상도 변경
VIEWPORT 설정 수정:
- 4K: 3840x2160
- QHD: 2560x1440
- HD: 1280x720

## 📌 주의사항
- 실제 데이터가 포함된 경우 개인정보 마스킹 필요
- 프레젠테이션 전 최신 버전으로 업데이트 권장
- 저작권 및 라이선스 확인

## 🚀 다음 단계
1. 프레젠테이션 템플릿 작성
2. 발표 스크립트 준비
3. 실시간 데모 환경 구성
4. Q&A 대비 자료 준비