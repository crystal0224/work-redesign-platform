---
theme: default
class: text-center
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: slide-left
title: 파일럿 테스트 페르소나
---

<style>
.slidev-layout {
  font-size: 13px;
  padding: 2rem;
}

.slidev-layout h1 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.slidev-layout h2 {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.8rem;
  margin-bottom: 0.4rem;
}

.slidev-layout h3 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.6rem;
  margin-bottom: 0.3rem;
}

.persona-full {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  text-align: left;
  margin-top: 1rem;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 0.3rem;
  font-size: 0.7rem;
  font-weight: 500;
  margin-right: 0.3rem;
  margin-bottom: 0.3rem;
}

.dept-marketing { background: #fee2e2; color: #991b1b; }
.maturity-advanced { background: #3b82f6; color: white; }

.info-box {
  background: #f8fafc;
  padding: 0.8rem;
  border-radius: 0.4rem;
  margin-bottom: 0.8rem;
  border-left: 3px solid #3b82f6;
}

.info-box h3 {
  font-size: 0.85rem;
  margin-top: 0;
  margin-bottom: 0.4rem;
  color: #1e40af;
}

.info-box ul, .info-box p {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.75rem;
  line-height: 1.5;
}

.info-box li {
  margin-bottom: 0.2rem;
}

.pain-box {
  background: #fef2f2;
  border-left: 3px solid #ef4444;
  padding: 0.6rem;
  margin-bottom: 0.6rem;
  font-size: 0.75rem;
  line-height: 1.5;
}

.concern-box {
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  padding: 0.6rem;
  margin-bottom: 0.6rem;
  font-size: 0.75rem;
  line-height: 1.5;
}

.risk-badge {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border-radius: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.risk-low { background: #bfdbfe; color: #1e40af; }

.tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.3rem;
}

.tool-badge {
  background: #e0e7ff;
  color: #3730a3;
  padding: 0.15rem 0.4rem;
  border-radius: 0.2rem;
  font-size: 0.65rem;
  font-family: monospace;
}
</style>

# Work Redesign Platform
## 파일럿 테스트 페르소나

<div class="pt-4 text-sm opacity-70">
15명의 Synthetic Users 프로필
</div>

---
layout: default
---

<div class="persona-full">
<div>

# 👤 P001 김지훈

<span class="badge dept-marketing">SK플래닛</span>
<span class="badge dept-marketing">디지털마케팅팀 팀장</span>
<span class="badge maturity-advanced">Advanced</span>

<div class="info-box">

### 📋 기본 정보
- **경력**: 3년차 팀장
- **이전 역할**: 캠페인 기획자
- **팀 규모**: 8명
- **팀 구성**: 팀장 1명 + 캠페인 기획자 2명 + 콘텐츠 크리에이터 2명 + 데이터 분석가 2명 + 디자이너 1명

</div>

<div class="info-box">

### 💎 디지털 성숙도
- **팀 전체**: Advanced
- **분포**: Expert 2명(분석가) + Advanced 3명(기획자, 디자이너) + Intermediate 3명(크리에이터)

</div>

<div class="info-box">

### 🔧 업무 구조화
- **수준**: 반구조화
- **설명**: 캠페인별 담당은 정해져 있으나 세부 실행 프로세스는 팀원 재량

</div>

<div class="info-box">

### 👨‍💼 리더십 스타일
데이터 기반 의사결정, 팀원 자율성 존중

</div>

</div>
<div>

<div class="info-box">

### 🎯 주요 업무
- SNS 캠페인 기획 및 실행 (월 5-8개 캠페인)
- 고객 데이터 분석 및 타겟팅 전략 수립
- 크리에이티브 콘텐츠 제작 및 A/B 테스트
- 캠페인 성과 측정 및 주간 보고
- 마케팅 자동화 툴 운영 및 최적화

</div>

<div class="info-box">

### 🛠️ 사용 도구
<div class="tools">
<span class="tool-badge">Google Analytics</span>
<span class="tool-badge">Facebook Ads Manager</span>
<span class="tool-badge">HubSpot</span>
<span class="tool-badge">Figma</span>
<span class="tool-badge">Notion</span>
<span class="tool-badge">Slack</span>
</div>

</div>

<div class="pain-box">

### 😰 Pain Points
• **캠페인 성과 데이터 통합**: 수작업으로 통합하느라 주당 8시간 소요<br>
• **A/B 테스트 결과 공유**: 팀 전체 공유 및 의사결정 과정이 비효율적<br>
• **크리에이티브 에셋 관리**: 팀원별로 분산 저장되어 협업 시 찾기 어려움

</div>

<div class="concern-box">

### 💭 워크샵 우려사항
• 마케팅 특성상 창의성을 중시하는데 프로세스가 너무 정형화되면 제약이 될까?<br>
• 팀원별로 디지털 수준 차이가 있는데 하나의 솔루션을 모두에게 적용하기 어려울 듯

</div>

<div class="info-box">

### 📊 예상 워크샵 행동
- **초기 태도**: 중립
- **이탈 위험도**: <span class="risk-badge risk-low">Low (10%)</span>
- **어려움 예상 단계**: Step 2 (프로세스 분석)
- **강점 단계**: Step 3-11 (대부분 단계)

</div>

</div>
</div>

---
layout: end
class: text-center
---

# 감사합니다

<div class="pt-4 text-sm opacity-50">
Work Redesign Platform | Pilot Testing with Synthetic Users
</div>
