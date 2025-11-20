# Work Redesign Workshop V2 - Design Plan
## 5-Phase Strategic Workshop with AI Agents

---

## 📋 Executive Summary

### Vision
전략적 공백(Strategic Gap) 발견과 AI 자동화를 통합한 체계적 업무 재설계 워크샵

### Core Innovation
**두 축의 통합**:
1. **전략 축**: 무엇을 위해 일하는가? → 중요한데 못하는 일 발견
2. **실행 축**: 어떻게 시간을 만들까? → AI 자동화로 시간 확보

### Expected Outcomes
- 사용자의 전략적 업무 공백 발견
- 구체적 자동화 솔루션 제공 (코드 + 프롬프트)
- 10-15시간/주 시간 확보
- 즉시 실행 가능한 구현 패키지

---

## 🎯 Design Principles

### 1. Agent-Driven Architecture
각 Phase마다 **전문 Agent**가 사용자를 가이드
- Context Interviewer
- State Analyzer
- Strategic Gap Finder
- Automation Advisor
- Workflow Designer

### 2. Progressive Disclosure
단계별로 필요한 정보만 요청
- Phase 1: 큰 그림 (미션, 목표)
- Phase 2: 현재 상태 (무엇을 하고 있나)
- Phase 3: 갭 분석 (무엇을 못하고 있나)
- Phase 4: 자동화 전략 (어떻게 시간을 만들까)
- Phase 5: 구현 설계 (실제 구축)

### 3. Data Continuity
각 Phase의 출력이 다음 Phase의 입력
```
context.json → current_state.json → strategic_gaps.json → automation_plan.json → implementation/
```

### 4. Actionable Outputs
추상적 제안이 아닌 **즉시 실행 가능한 결과물**
- 실행 가능한 코드
- 복사 가능한 프롬프트
- 설정 파일
- 구현 가이드

### 5. Visual Clarity
복잡한 분석을 직관적으로 시각화
- 포트폴리오 차트
- 갭 매트릭스
- 워크플로우 다이어그램
- ROI 시뮬레이션

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────┐
│                   User Interface                     │
│              (Interactive Demo HTML)                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                  Agent Orchestrator                  │
│         (Manages phase transitions & context)        │
└─────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Phase 1    │  │   Phase 2    │  │   Phase 3    │
│  Context     │→ │ Current      │→ │  Gap         │
│  Interview   │  │ State        │  │  Analysis    │
└──────────────┘  └──────────────┘  └──────────────┘
        ↓                ↓                ↓
┌──────────────┐  ┌──────────────────────────────────┐
│   Phase 4    │  │          Phase 5                 │
│  Automation  │→ │       Workflow Design            │
│  Planning    │  │    (Implementation Package)      │
└──────────────┘  └──────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              Deliverable Generation                  │
│    (Code, Prompts, Config, Documentation)           │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
Phase 1 → context.json
          ├─ mission
          ├─ objectives[]
          ├─ role_responsibilities[]
          └─ success_vision

Phase 2 → current_state.json
          ├─ tasks[]
          ├─ time_allocation{}
          └─ patterns_detected[]

Phase 3 → strategic_gaps.json
          ├─ portfolio_analysis{}
          ├─ strategic_gaps[]
          └─ time_needed_total

Phase 4 → automation_plan.json
          ├─ automation_candidates[]
          ├─ scenarios[]
          └─ implementation_roadmap[]

Phase 5 → implementation_package/
          ├─ workflow_1/
          │   ├─ README.md
          │   ├─ scripts/
          │   ├─ prompts/
          │   └─ config/
          └─ workflow_2/
              └─ ...
```

---

## 📐 Detailed Phase Design

### Phase 1: Context Interview (10분)
**Agent**: Context Interviewer

#### Objectives
- 사용자의 미션과 목표 명확화
- 역할 책임 우선순위 파악
- 성공 비전 설정

#### User Journey
```
1. 환영 → Agent 소개
2. 미션 질문 → 자유 응답
3. 목표 탐색 → 3-5개 추출
4. 역할 우선순위 → 체크박스 + 순위
5. 도전 과제 → 현재 pain point
6. 비전 공유 → 6개월 후 모습
7. 요약 확인 → 사용자 승인
```

#### UI Components
- **Step Indicator**: "Phase 1 of 5"
- **Agent Avatar**: AI 컨설턴트 프로필
- **Conversational Interface**: 채팅 스타일 질문
- **Summary Card**: 입력 내용 실시간 요약
- **Progress Bar**: Phase 내 진행도

#### Inputs
- 미션 스테이트먼트 (텍스트)
- 핵심 목표 3-5개 (리스트)
- 역할 책임 우선순위 (1-5 순위)
- 이해관계자 (카테고리별)
- 현재 도전과제 (텍스트)
- 성공 비전 (텍스트)

#### Outputs
`context.json`:
```json
{
  "mission": "Drive 30% customer growth through data-driven campaigns",
  "objectives": [
    {
      "goal": "Increase new customer acquisition",
      "metric": "30% YoY growth",
      "priority": "high"
    }
  ],
  "role_responsibilities": [
    {
      "responsibility": "Strategic planning & direction",
      "priority_rank": 1,
      "time_allocation_ideal": 30
    }
  ],
  "stakeholders": {
    "upward": ["VP Marketing", "CEO"],
    "horizontal": ["Sales", "Product"],
    "downward": ["Marketing team (5 people)"]
  },
  "current_challenges": "Too much time on execution, not enough on strategy",
  "success_vision": "Team running autonomously, I focus on innovation",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

#### Agent Behavior Rules
1. **Be conversational**: 폼이 아닌 대화
2. **Probe vagueness**: "좋은 성과" → "얼마나? 어떤 지표로?"
3. **Show empathy**: 도전과제에 공감
4. **Time-box**: 10분 안에 핵심만
5. **Visual summary**: 입력 내용 카드로 시각화

---

### Phase 2: Current State Analysis (10분)
**Agent**: State Analyzer

#### Objectives
- 현재 업무 항목 전체 파악
- 시간 배분 가시화
- 패턴과 병목 지점 발견

#### User Journey
```
1. 입력 방식 선택 → 파일 업로드 or 텍스트 입력
2. 파일 업로드 → Drag & drop
3. AI 분석 진행 → 실시간 로그
4. 업무 항목 확인 → 리스트 검토
5. 수정/추가 → 편집 인터페이스
6. 포트폴리오 확인 → 차트로 시각화
7. 패턴 리뷰 → AI 발견 내용
```

#### UI Components
- **Upload Zone**: 드래그앤드롭 파일 업로드
- **Text Editor**: 마크다운 지원 텍스트 입력
- **Analysis Progress**: 실시간 분석 상태
- **Task Cards**: 추출된 업무 카드 뷰
- **Portfolio Charts**:
  - 도메인별 시간 배분 (파이 차트)
  - 유형별 분류 (바 차트)
  - 가치별 분포 (매트릭스)

#### Inputs
- 문서 파일 (PDF, DOCX, TXT, MD)
- 텍스트 직접 입력
- 사용자 수정/추가

#### Processing Logic
```python
1. 문서 파싱
   - PDF → 텍스트 추출
   - 구조화된 데이터 인식 (테이블, 리스트)

2. 업무 항목 추출
   - 동사 패턴 인식 ("작성", "분석", "관리")
   - 빈도 표현 추출 ("매주", "매일", "월 1회")
   - 시간 표현 추출 ("2시간", "하루")

3. 스코어링
   - mission_contribution: context.objectives와 대조
   - automation_potential: 반복성, 규칙성, API 가용성
   - strategic_value: 목표 기여도

4. 분류
   - 도메인 매핑 (context.role_responsibilities 참조)
   - 타입 분류 (strategic/tactical/operational/admin)

5. 패턴 탐지
   - 반복 작업 그룹핑
   - 데이터 수집 중복 발견
   - 컨텍스트 스위칭 빈도
```

#### Outputs
`current_state.json`:
```json
{
  "total_weekly_hours": 40,
  "tasks": [
    {
      "id": "task_001",
      "title": "Weekly performance dashboard",
      "description": "Collect GA4, Meta, Google Ads data, compile Excel, create Looker dashboard",
      "domain": "Performance Analysis",
      "type": "operational",
      "frequency": "weekly",
      "time_per_cycle_hours": 8,
      "time_per_week_hours": 8,
      "tools": ["GA4", "Meta Ads", "Google Ads", "Excel", "Looker"],
      "stakeholders": ["VP Marketing"],
      "process_steps": [
        "Export data from platforms",
        "Clean and normalize",
        "Create pivot tables",
        "Update dashboard",
        "Write commentary"
      ],
      "scores": {
        "mission_contribution": 3,
        "automation_potential": 5,
        "strategic_value": 3
      },
      "source": "uploaded_doc.pdf:23"
    }
  ],
  "time_allocation": {
    "by_domain": {
      "Digital Advertising": 15,
      "Performance Analysis": 8,
      "Content Marketing": 10,
      "Team Management": 5,
      "Meetings": 2
    },
    "by_type": {
      "strategic": 8,
      "tactical": 12,
      "operational": 18,
      "administrative": 2
    },
    "by_value": {
      "high_value": 10,
      "medium_value": 20,
      "low_value": 10
    }
  },
  "patterns_detected": [
    {
      "pattern": "repetitive_data_collection",
      "tasks": ["task_001", "task_005", "task_012"],
      "insight": "3 tasks manually collect from same APIs"
    },
    {
      "pattern": "high_context_switching",
      "tasks": ["task_003", "task_007"],
      "insight": "Switching between creative and analytical work 5x/day"
    }
  ],
  "timestamp": "2024-01-15T10:15:00Z"
}
```

#### Visual Output
```
YOUR CURRENT WORK PORTFOLIO
━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: 40h/week across 25 tasks

By Strategic Value:
██████ High (10h, 25%)  ⚠️ Should be 40%+
████████████ Medium (20h, 50%)
██████ Low (10h, 25%)  ⚠️ Automation target

By Work Type:
████ Strategic (8h, 20%)  ⚠️ Target: 30%
██████ Tactical (12h, 30%)
█████████ Operational (18h, 45%)  ⚠️ Too high
██ Admin (2h, 5%)

Top Time Consumers:
1. Campaign management (15h) - Medium value
2. Dashboard creation (8h) - High automation potential
3. Content creation (7h) - High value
4. Team meetings (5h) - Necessary overhead
5. Email management (3h) - Low value

🔍 Patterns Detected:
• 3 tasks involve manual data collection (can consolidate)
• High context switching between creative/analytical work
• Multiple approval bottlenecks (waiting time)
```

#### Agent Behavior Rules
1. **Be thorough**: 주요 업무 80% 캡처
2. **Infer smartly**: 명시되지 않은 정보 추정 (시간, 빈도)
3. **Ask clarifying questions**: 애매한 항목 질문
4. **Visual feedback**: 실시간 분석 로그 표시
5. **Validate**: 총 시간 합리성 체크 (35-50h)

---

### Phase 3: Strategic Gap Analysis (20분)
**Agent**: Strategic Gap Finder

#### Objectives
- 이상적 포트폴리오 vs 실제 포트폴리오 비교
- 중요한데 안 하고 있는 일 발견
- 필요한 시간 계산

#### User Journey
```
1. 포트폴리오 비교 → Ideal vs Actual 차트
2. 갭 탐색 → 각 목표별 필요 활동 체크
3. 우선순위 설정 → 사용자가 갭 선택
4. 벤치마크 확인 → 업계 표준 비교
5. 시간 계산 → 필요한 총 시간
6. 갭 리포트 확인 → 상세 분석 문서
```

#### UI Components
- **Comparison Chart**: Ideal vs Actual 포트폴리오
- **Gap Matrix**: 2x2 매트릭스 (중요도 x 현재 시간)
- **Objective Tree**: 목표 → 필요활동 → 현재상태
- **Benchmark Cards**: 업계 표준 vs 나
- **Time Calculator**: 필요 시간 시뮬레이터

#### Processing Logic
```python
1. 이상적 포트폴리오 계산
   role_level = infer_from_responsibilities()
   ideal = get_benchmark_portfolio(role_level)

2. 목표별 필요활동 추론
   for objective in context.objectives:
     required_activities = infer_required_activities(objective)
     current_activities = match_with_current_state(required_activities)
     gaps = required_activities - current_activities

3. 갭 우선순위 스코어링
   criticality = can_achieve_goal_without_this()
   impact = expected_contribution_to_goal()
   urgency = timeline_pressure()
   feasibility = ease_of_starting()

   priority_score = (criticality * 0.4) + (impact * 0.3) + (urgency * 0.2) + (feasibility * 0.1)

4. 벤치마크 비교
   industry_data = get_benchmark(industry, role_level)
   gaps_vs_benchmark = compare(current_state, industry_data)
```

#### Example Gap Discovery Logic
```
Objective: "Increase new customers 30%"

Required Activities Analysis:
✓ Advertising campaigns → DOING (15h/week)
✓ Landing page optimization → DOING (3h/week)
✗ Customer research interviews → NOT DOING ← GAP!
  └─ Reason: Top teams spend 6-8h/week
  └─ Impact: Direct insight into customer needs
  └─ Criticality: HIGH (cannot validate assumptions)

✗ Referral program → NOT DOING ← GAP!
  └─ Benchmark: 20% of new customers via referral (industry avg)
  └─ Current: 0%
  └─ Criticality: MEDIUM

✓ Competitive analysis → SPORADIC (1h/month) ← WEAK!
  └─ Should be: 4h/month
  └─ Missing: Competitive intelligence
```

#### Outputs
`strategic_gaps.json`:
```json
{
  "portfolio_analysis": {
    "current_allocation": {
      "strategic_work": 0.20,
      "execution_work": 0.45,
      "people_work": 0.125,
      "admin_work": 0.225
    },
    "ideal_allocation": {
      "strategic_work": 0.30,
      "execution_work": 0.40,
      "people_work": 0.15,
      "admin_work": 0.15
    },
    "gaps": {
      "strategic_work": -0.10,
      "execution_work": +0.05,
      "people_work": -0.025,
      "admin_work": +0.075
    }
  },
  "strategic_gaps": [
    {
      "id": "gap_001",
      "activity": "Customer deep-dive interviews",
      "category": "customer_research",
      "priority": "critical",
      "current_time": 0,
      "recommended_time": 4,
      "connected_objectives": ["obj_001"],
      "why_important": "Cannot understand customer needs without direct conversation. Current marketing based on assumptions.",
      "benchmark": {
        "top_20_percent": 8,
        "median": 4,
        "bottom_20_percent": 0,
        "your_position": "bottom_20_percent"
      },
      "impact_on_goals": {
        "new_customers_30": "direct",
        "customer_retention": "indirect"
      },
      "quick_start": "Schedule 2 customer calls this week, use AI to generate interview guide",
      "ai_assistance": [
        "Interview guide generation",
        "Auto transcription",
        "Pattern analysis",
        "Insight synthesis"
      ],
      "missing_because": "No time due to operational overload",
      "evidence": [
        "0 customer interviews in last quarter",
        "Marketing decisions based on internal assumptions",
        "No Voice-of-Customer data in last campaign"
      ]
    },
    {
      "id": "gap_002",
      "activity": "Weekly team 1:1 coaching",
      "category": "people_development",
      "priority": "high",
      "current_time": 0,
      "recommended_time": 3,
      "connected_objectives": ["obj_003"],
      "why_important": "Team capability objective requires structured development",
      "benchmark": {
        "manager_standard": "15-20% of time on directs"
      },
      "quick_start": "Schedule 30min bi-weekly with each team member",
      "ai_assistance": [
        "Coaching conversation guides",
        "Growth plan templates",
        "Progress tracking"
      ],
      "missing_because": "Perceived as nice-to-have, pushed by urgency"
    },
    {
      "id": "gap_003",
      "activity": "Systematic A/B testing",
      "category": "experimentation",
      "priority": "high",
      "current_time": 0.5,
      "recommended_time": 3,
      "connected_objectives": ["obj_001", "obj_002"],
      "why_important": "Data-driven optimization requires systematic testing",
      "current_maturity": "ad-hoc",
      "desired_maturity": "systematic",
      "gap_description": "Testing happens reactively, not proactively"
    }
  ],
  "opportunity_areas": [
    {
      "area": "Strategic partnerships",
      "potential_impact": "15-20% growth contribution",
      "current_state": "not explored",
      "time_needed": 4
    }
  ],
  "time_needed_total": 11,
  "timestamp": "2024-01-15T10:35:00Z"
}
```

#### Visual Output - Gap Report

```markdown
# STRATEGIC GAP ANALYSIS REPORT

## Executive Summary

You are **under-investing in strategic work** by 10 percentage points.

Current Portfolio vs Ideal:
┌─────────────────┬──────────┬─────────┬──────────┐
│ Category        │ Current  │ Ideal   │ Gap      │
├─────────────────┼──────────┼─────────┼──────────┤
│ Strategic       │ 20%      │ 30%     │ -10% ⚠️  │
│ Execution       │ 45%      │ 40%     │ +5%      │
│ People          │ 12.5%    │ 15%     │ -2.5%    │
│ Admin           │ 22.5%    │ 15%     │ +7.5% ⚠️ │
└─────────────────┴──────────┴─────────┴──────────┘

**Bottom Line**: Too much execution + admin, not enough strategy + people.

---

## 🚨 Critical Gaps Discovered

### Gap #1: Customer Research (CRITICAL)

**Current**: 0 hours/week
**Recommended**: 4 hours/week
**Priority**: Critical

**Why This Matters**:
Your #1 objective is "Increase new customers 30%". Without understanding current customers, you're marketing on assumptions.

**What You're Missing**:
- Deep understanding of customer pain points
- Real voice-of-customer data
- Insights for messaging/positioning
- Early churn signals

**Industry Benchmark**:
┌──────────────────┬───────────┐
│ Top 20%          │ 8h/week   │
│ Median           │ 4h/week   │
│ Bottom 20%       │ 0h/week   │ ← You are here
└──────────────────┴───────────┘

**Quick Start**:
1. Schedule 2 customer interviews this week
2. Use AI to generate interview guide
3. Record & auto-transcribe
4. Let AI extract patterns

**AI Can Help**:
- Generate research questions tailored to goals
- Transcribe interviews automatically
- Analyze patterns across interviews
- Synthesize insights into actions

---

### Gap #2: Team 1:1 Coaching (HIGH)

[Similar detailed breakdown]

---

### Gap #3: Systematic A/B Testing (HIGH)

[Similar detailed breakdown]

---

## Time Required

To close these critical gaps: **11 hours/week**

**Question**: Where will this time come from?
**Answer**: Let's find out in Phase 4 (Automation Planning) →
```

#### Agent Behavior Rules
1. **Evidence-based**: 갭을 구체적 증거로 뒷받침
2. **Prioritize ruthlessly**: Critical/High/Medium만
3. **Connect to goals**: 각 갭이 목표에 미치는 영향 명확히
4. **Benchmark context**: 업계 표준과 비교
5. **Actionable**: Quick start 제시

---

### Phase 4: Automation Planning (15분)
**Agent**: Automation Advisor

#### Objectives
- 자동화 가능한 업무 식별
- 시간 확보 시나리오 생성
- ROI 분석 및 우선순위 설정

#### User Journey
```
1. 자동화 후보 확인 → 스코어 기반 리스트
2. 시나리오 비교 → 3-4가지 접근법
3. 시나리오 선택 → 사용자 선택
4. ROI 시뮬레이션 → 투자 대비 효과
5. 로드맵 확인 → 주차별 실행 계획
6. 승인 → Phase 5로 진행
```

#### UI Components
- **Automation Scorecard**: 각 업무의 자동화 가능성
- **Scenario Comparison Table**: 시나리오 비교
- **ROI Calculator**: 시간 절감 계산기
- **Timeline Simulator**: 구현 일정 시뮬레이션
- **Priority Matrix**: 2x2 (ROI x Complexity)

#### Processing Logic
```python
1. 자동화 가능성 스코어링
   for task in current_state.tasks:
     feasibility = score_automation_feasibility(task)
     # Factors: repetitiveness, rule-based, API availability,
     #          human judgment needed, creativity required

     complexity = estimate_implementation_complexity(task)
     # 1-5 scale based on: tools needed, coding required,
     #                     integration points, skills needed

     time_roi = (task.time_per_week * 52) / implementation_hours

2. 시나리오 생성
   time_needed = strategic_gaps.time_needed_total

   scenarios = [
     generate_automation_first_scenario(time_needed),
     generate_delegation_first_scenario(time_needed),
     generate_hybrid_scenario(time_needed),
     generate_aggressive_scenario(time_needed)
   ]

3. 시나리오별 분석
   for scenario in scenarios:
     calculate_time_freed()
     calculate_implementation_timeline()
     calculate_effort_required()
     assess_risk_level()

4. 추천 로직
   recommended = max(scenarios, key=lambda s:
     (s.time_freed >= time_needed) * 0.4 +
     (1 / s.implementation_weeks) * 0.3 +
     (1 / s.complexity) * 0.2 +
     s.team_development_score * 0.1
   )
```

#### Automation Feasibility Scoring
```python
def score_automation(task):
    score = 0

    # Repetitiveness (0-25 points)
    if task.frequency in ['daily', 'weekly']:
        score += 25
    elif task.frequency == 'monthly':
        score += 15

    # Rule-based (0-25 points)
    if has_clear_rules(task.description):
        score += 25
    elif has_some_structure(task.description):
        score += 15

    # Data-driven (0-20 points)
    if uses_data_sources(task):
        score += 20

    # API availability (0-20 points)
    api_tools = count_api_enabled_tools(task.tools)
    score += min(api_tools * 5, 20)

    # Low human judgment (0-10 points)
    if not requires_creativity(task):
        score += 5
    if not requires_relationship(task):
        score += 5

    return min(score, 100)

def estimate_complexity(task):
    complexity = 1  # Start at easiest

    if requires_custom_code(task):
        complexity += 1
    if requires_multiple_integrations(task):
        complexity += 1
    if requires_ml_or_ai(task):
        complexity += 1
    if requires_infrastructure(task):
        complexity += 1

    return min(complexity, 5)
```

#### Outputs
`automation_plan.json`:
```json
{
  "time_needed_for_gaps": 11,
  "automation_candidates": [
    {
      "task_id": "task_001",
      "task_name": "Weekly performance dashboard",
      "current_time": 8,
      "automation_potential_score": 95,
      "feasibility_breakdown": {
        "repetitiveness": 25,
        "rule_based": 25,
        "data_driven": 20,
        "api_available": 20,
        "low_judgment": 10
      },
      "recommended_approach": "full_automation",
      "expected_time_after": 0.5,
      "time_savings": 7.5,
      "implementation": {
        "complexity": 2,
        "estimated_hours": 12,
        "roi_ratio": 32.5,
        "tools": ["Python", "GA4 API", "Meta API", "Google Ads API", "Looker API"],
        "skills_required": ["Basic Python", "API calls", "Cron jobs"],
        "timeline": "1-2 weeks"
      },
      "automation_approach": {
        "method": "scheduled_script",
        "trigger": "Monday 6 AM",
        "workflow": [
          "Fetch data from GA4/Meta/Google Ads APIs",
          "Clean and merge data",
          "Calculate KPIs",
          "Detect anomalies (AI)",
          "Generate insights (AI)",
          "Update Looker dashboard",
          "Send Slack summary"
        ],
        "human_involvement": "Review AI insights, add context (15min)",
        "failure_handling": "Slack alert if data fetch fails"
      },
      "benefits": [
        "Consistent execution (no human error)",
        "Runs overnight (faster)",
        "Frees 7.5h/week for customer research",
        "Same-day insights available"
      ],
      "risks": [
        "API changes require maintenance",
        "Initial setup time (12h)"
      ],
      "priority": "quick_win"
    }
  ],
  "scenarios": [
    {
      "id": "scenario_a",
      "name": "Automation-First",
      "description": "Maximize automation, minimal delegation",
      "time_freed": 11,
      "implementation_timeline": "2-3 weeks",
      "complexity": "medium",
      "effort_required": "moderate",
      "tasks": [
        {
          "task_id": "task_001",
          "action": "automate",
          "method": "Python script + APIs",
          "time_saved": 7.5
        },
        {
          "task_id": "task_005",
          "action": "automate",
          "method": "n8n workflow",
          "time_saved": 3.5
        }
      ],
      "breakdown": {
        "automated_tasks": 2,
        "delegated_tasks": 0,
        "eliminated_tasks": 0,
        "total_time_freed": 11
      },
      "pros": [
        "Permanent time savings",
        "Consistent quality",
        "No team dependencies"
      ],
      "cons": [
        "Technical setup required",
        "2-3 week timeline",
        "Maintenance needed"
      ]
    },
    {
      "id": "scenario_b",
      "name": "Delegation-First",
      "description": "Delegate to team, some automation",
      "time_freed": 11,
      "implementation_timeline": "1 week",
      "complexity": "low",
      "effort_required": "easy",
      "tasks": [
        {
          "task_id": "task_003",
          "action": "delegate",
          "delegate_to": "Senior team member",
          "time_saved": 4
        },
        {
          "task_id": "task_007",
          "action": "delegate",
          "delegate_to": "Junior team member",
          "time_saved": 3
        },
        {
          "task_id": "task_001",
          "action": "partial_automation",
          "method": "Looker Studio scheduled reports",
          "time_saved": 4
        }
      ],
      "breakdown": {
        "automated_tasks": 1,
        "delegated_tasks": 2,
        "eliminated_tasks": 0,
        "total_time_freed": 11
      },
      "pros": [
        "Fast implementation",
        "Team development",
        "Low technical barrier"
      ],
      "cons": [
        "Creates dependencies",
        "Requires training",
        "Not permanent (if person leaves)"
      ]
    },
    {
      "id": "scenario_c",
      "name": "Hybrid Approach",
      "description": "Mix automation + delegation + elimination",
      "time_freed": 13,
      "implementation_timeline": "2-3 weeks",
      "complexity": "medium",
      "effort_required": "moderate",
      "tasks": [
        {
          "task_id": "task_001",
          "action": "automate",
          "time_saved": 7.5
        },
        {
          "task_id": "task_005",
          "action": "automate",
          "time_saved": 3
        },
        {
          "task_id": "task_012",
          "action": "delegate",
          "time_saved": 2
        },
        {
          "task_id": "task_018",
          "action": "eliminate",
          "reason": "Low value, not contributing to goals",
          "time_saved": 0.5
        }
      ],
      "breakdown": {
        "automated_tasks": 2,
        "delegated_tasks": 1,
        "eliminated_tasks": 1,
        "total_time_freed": 13
      },
      "pros": [
        "Best balance of speed + results",
        "Exceeds time needed (2h buffer)",
        "Includes team development",
        "Eliminates waste"
      ],
      "cons": [
        "Multi-pronged effort",
        "Moderate complexity"
      ],
      "recommendation_reason": "Optimal balance. Frees 13h (need 11h = 2h buffer). Uses proven automation patterns. Includes team growth."
    },
    {
      "id": "scenario_d",
      "name": "Aggressive Transformation",
      "description": "Deep automation + process redesign",
      "time_freed": 18,
      "implementation_timeline": "4-6 weeks",
      "complexity": "high",
      "effort_required": "significant",
      "tasks": [
        {
          "task_id": "task_001",
          "action": "full_automation",
          "time_saved": 7.5
        },
        {
          "task_id": "task_005",
          "action": "full_automation",
          "time_saved": 3
        },
        {
          "task_id": "multiple",
          "action": "process_redesign",
          "description": "Redesign campaign workflow with AI agents",
          "time_saved": 6
        },
        {
          "task_id": "task_018",
          "action": "eliminate",
          "time_saved": 1.5
        }
      ],
      "breakdown": {
        "automated_tasks": 5,
        "delegated_tasks": 0,
        "eliminated_tasks": 2,
        "total_time_freed": 18
      },
      "pros": [
        "Maximum time freed",
        "Transforms entire workflow",
        "Long-term competitive advantage"
      ],
      "cons": [
        "Significant upfront investment",
        "4-6 week timeline",
        "Higher risk",
        "Requires technical expertise"
      ]
    }
  ],
  "recommended_scenario": "scenario_c",
  "implementation_roadmap": [
    {
      "week": 1,
      "focus": "Quick wins - Data automation",
      "tasks": [
        {
          "task": "Set up API credentials",
          "estimated_hours": 2
        },
        {
          "task": "Develop dashboard automation script",
          "estimated_hours": 8
        },
        {
          "task": "Test automation",
          "estimated_hours": 2
        }
      ],
      "deliverables": [
        "Dashboard automation running",
        "7.5h/week freed"
      ],
      "time_freed_cumulative": 7.5
    },
    {
      "week": 2,
      "focus": "Delegation setup",
      "tasks": [
        {
          "task": "Train team member on delegated task",
          "estimated_hours": 3
        },
        {
          "task": "Document process",
          "estimated_hours": 2
        },
        {
          "task": "Monitor first execution",
          "estimated_hours": 1
        }
      ],
      "deliverables": [
        "Delegated task running smoothly",
        "2h/week freed"
      ],
      "time_freed_cumulative": 9.5
    },
    {
      "week": 3,
      "focus": "Secondary automation + elimination",
      "tasks": [
        {
          "task": "Build monitoring automation (n8n)",
          "estimated_hours": 6
        },
        {
          "task": "Eliminate low-value task",
          "estimated_hours": 1
        },
        {
          "task": "Full system test",
          "estimated_hours": 2
        }
      ],
      "deliverables": [
        "All automations live",
        "13h/week total freed",
        "Can now invest in strategic gaps"
      ],
      "time_freed_cumulative": 13
    }
  ],
  "success_metrics": {
    "time_freed_target": 11,
    "time_freed_actual": 13,
    "buffer": 2,
    "strategic_work_increase": {
      "before": 8,
      "after": 21,
      "increase": 13
    },
    "portfolio_shift": {
      "strategic_work": {
        "before": 0.20,
        "after": 0.325,
        "target": 0.30,
        "status": "exceeded"
      }
    }
  },
  "timestamp": "2024-01-15T10:50:00Z"
}
```

#### Visual Output - Scenario Comparison

```markdown
# AUTOMATION SCENARIOS

You need **11 hours/week** to invest in strategic gaps.

I've found **18 automatable hours** in your current work.

Here are 4 approaches:

---

## 📊 Scenario Comparison

┌────────────────┬────────────┬──────────┬──────────┬──────────┐
│ Scenario       │ Time Freed │ Timeline │ Effort   │ Risk     │
├────────────────┼────────────┼──────────┼──────────┼──────────┤
│ A. Automation  │ 11h        │ 2-3 wks  │ Medium   │ Low      │
│ B. Delegation  │ 11h        │ 1 wk     │ Easy     │ Medium   │
│ C. Hybrid ⭐   │ 13h        │ 2-3 wks  │ Medium   │ Low      │
│ D. Aggressive  │ 18h        │ 4-6 wks  │ High     │ Medium   │
└────────────────┴────────────┴──────────┴──────────┴──────────┘

---

## 📋 Scenario A: Automation-First
**Time freed**: 11 hours (+0h buffer)
**Timeline**: 2-3 weeks
**Effort**: ⭐⭐⭐ Medium

**What we'll automate**:
1. ✅ Weekly dashboard (8h → 0.5h) = **7.5h saved**
   - Python script + APIs
   - Runs Monday 6 AM

2. ✅ Daily ad monitoring (5h → 1.5h) = **3.5h saved**
   - n8n workflow
   - Auto-alerts on anomalies

**Pros**:
✓ Permanent time savings
✓ Consistent quality
✓ No team dependencies

**Cons**:
✗ Technical setup (2-3 weeks)
✗ Requires maintenance

---

## 👥 Scenario B: Delegation-First
**Time freed**: 11 hours (+0h buffer)
**Timeline**: 1 week
**Effort**: ⭐⭐ Easy

**What we'll delegate**:
1. Campaign execution → Senior (4h)
2. Competitor monitoring → Junior (3h)
3. Dashboard → Partial automation (4h)

**Pros**:
✓ Fast implementation
✓ Team growth
✓ Low technical barrier

**Cons**:
✗ Creates dependencies
✗ Requires training
✗ Not permanent

---

## 🎨 Scenario C: Hybrid Approach ⭐ RECOMMENDED
**Time freed**: 13 hours (+2h buffer!)
**Timeline**: 2-3 weeks
**Effort**: ⭐⭐⭐ Medium

**Mix of actions**:
🤖 Automate:
  - Dashboard (7.5h saved)
  - Monitoring (3h saved)

👥 Delegate:
  - Creative production (2h saved)

✂️ Eliminate:
  - Low-value status meetings (0.5h saved)

**Pros**:
✓ Exceeds goal (2h buffer)
✓ Balanced approach
✓ Team development included
✓ Quick + sustainable wins

**Cons**:
✗ Multi-pronged effort
✗ Moderate complexity

**Why recommended**:
Best ROI. Achieves goal + buffer. Includes team growth. Uses proven patterns. Manageable timeline.

---

## 🚀 Scenario D: Aggressive Transformation
**Time freed**: 18 hours (+7h buffer!)
**Timeline**: 4-6 weeks
**Effort**: ⭐⭐⭐⭐⭐ High

**Deep changes**:
- Full automation (5 workflows)
- Process redesign with AI agents
- Eliminate 2 low-value tasks

**Pros**:
✓ Maximum time freed
✓ Transforms workflow
✓ Competitive advantage

**Cons**:
✗ Significant investment
✗ 4-6 week timeline
✗ Higher risk
✗ Needs technical expertise

---

## 💡 Recommendation: Scenario C (Hybrid)

**Rationale**:
- Frees 13h (need 11h) = comfortable buffer
- Achievable in 2-3 weeks
- Balances automation + team development
- Uses proven automation patterns
- Moderate effort, manageable risk

**3-Week Roadmap**:

Week 1: Dashboard automation
  → 7.5h freed ✓

Week 2: Delegation setup
  → 9.5h freed ✓

Week 3: Monitoring automation + elimination
  → 13h freed ✓ COMPLETE

**After 3 weeks, you can invest**:
- 4h → Customer research
- 3h → Team 1:1s
- 3h → A/B testing
- 2h → Innovation projects
- 1h → Buffer

---

Which scenario feels right?
(Or want me to customize one?)
```

#### Agent Behavior Rules
1. **Show tradeoffs**: 각 시나리오의 장단점 명확히
2. **Visualize impact**: ROI, 타임라인 차트로 표현
3. **Recommend confidently**: 데이터 기반 추천
4. **Allow customization**: 사용자가 조정 가능
5. **Be realistic**: 과장하지 않고 실현 가능한 계획

---

### Phase 5: Workflow Design (20분)
**Agent**: Workflow Designer

#### Objectives
- 선택된 자동화 업무의 상세 워크플로우 설계
- 실행 가능한 코드 생성
- AI 프롬프트 작성
- 구현 패키지 생성

#### User Journey
```
1. 업무 선택 → 1-3개 자동화 업무 선택
2. 심화 인터뷰 → 각 업무 상세 파악
3. 워크플로우 확인 → 다이어그램 검토
4. 구현 방식 선택 → No-code/Low-code/Code
5. 생성 진행 → 실시간 생성 로그
6. 패키지 확인 → 파일 구조 탐색
7. 다운로드 → ZIP 파일 다운로드
```

#### UI Components
- **Task Selector**: 자동화할 업무 선택 (1-3개)
- **Interview Dialog**: 심화 질문 대화창
- **Workflow Diagram**: Mermaid 플로우차트
- **Implementation Option**: No-code/Low-code/Code 선택
- **Generation Progress**: 파일 생성 실시간 로그
- **Package Explorer**: 생성된 파일 트리뷰
- **Download Button**: ZIP 다운로드

#### Deep-Dive Interview per Task

각 선택된 업무에 대해 상세 질문:

```
Agent Questions:
1. "이 업무를 처음부터 끝까지 단계별로 설명해주시겠어요?"
   → Extract: workflow steps

2. "어떤 도구나 시스템을 사용하나요?"
   → Extract: tools, integrations

3. "데이터는 어디서 가져오나요?"
   → Extract: data sources, triggers

4. "최종 결과물은 무엇인가요?"
   → Extract: outputs, deliverables

5. "과정에서 어떤 판단을 하시나요?"
   → Extract: decision points, business rules

6. "예외 상황이나 엣지 케이스는?"
   → Extract: error handling, exceptions

7. "반드시 사람이 확인해야 하는 부분은?"
   → Extract: human checkpoints

Example Extraction:
User: "매주 월요일에 GA4, 메타 광고, 구글 애즈에서 데이터를 다운로드하고,
       엑셀로 정리한 다음 Looker Studio 대시보드를 업데이트해요.
       이상한 데이터가 있으면 다시 확인하고, 마지막에 슬랙으로 공유합니다."

Extracted Workflow:
- Trigger: Monday morning
- Step 1: Fetch GA4 data (API)
- Step 2: Fetch Meta Ads data (API)
- Step 3: Fetch Google Ads data (API)
- Decision: Data complete?
  - No → Send error alert
  - Yes → Continue
- Step 4: Clean and merge data (Python/Excel)
- Step 5: Detect anomalies (rule-based + AI)
  - If anomaly → Flag for human review
- Step 6: Calculate KPIs
- Step 7: Generate insights (AI)
- Step 8: Update Looker dashboard (API)
- Step 9: Send Slack summary (Webhook)
- Human checkpoint: Review AI insights (15min)
```

#### Workflow Design Logic

```python
def design_workflow(task, interview_data):
    """
    Convert interview data into executable workflow
    """
    workflow = {
        "trigger": extract_trigger(interview_data),
        "steps": [],
        "decision_points": [],
        "human_checkpoints": [],
        "error_handling": []
    }

    # Extract sequential steps
    for step in interview_data.steps:
        workflow["steps"].append({
            "id": generate_step_id(),
            "name": step.name,
            "type": classify_step_type(step),  # fetch/process/decide/notify
            "automation": assess_automation_level(step),  # full/partial/manual
            "implementation": recommend_implementation(step)
        })

    # Identify decision points
    for decision in interview_data.decisions:
        workflow["decision_points"].append({
            "condition": decision.condition,
            "branches": decision.branches,
            "rule": formalize_rule(decision)
        })

    # Mark human checkpoints
    for checkpoint in interview_data.human_reviews:
        workflow["human_checkpoints"].append({
            "at_step": checkpoint.step_id,
            "reason": checkpoint.reason,
            "time_required": checkpoint.time
        })

    return workflow

def recommend_implementation(step):
    """
    Choose best implementation method
    """
    if step.type == "fetch_data" and has_api(step.source):
        return {
            "method": "api_call",
            "tool": "Python requests",
            "difficulty": "easy"
        }
    elif step.type == "process" and is_simple_transformation(step):
        return {
            "method": "pandas",
            "tool": "Python pandas",
            "difficulty": "easy"
        }
    elif step.type == "generate_insights":
        return {
            "method": "ai_prompt",
            "tool": "Claude API",
            "difficulty": "medium"
        }
    # ... more logic
```

#### Code Generation

**Python Script Template**:

```python
# scripts/main.py - Generated by Work Redesign Workshop
"""
{TASK_NAME} Automation

Description: {TASK_DESCRIPTION}

Workflow:
{WORKFLOW_STEPS}

Author: Work Redesign AI
Generated: {TIMESTAMP}
"""

import os
import logging
from dotenv import load_dotenv
from datetime import datetime
{ADDITIONAL_IMPORTS}

# Setup
load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class {TASK_CLASS_NAME}:
    """Main automation class for {TASK_NAME}"""

    def __init__(self):
        """Initialize with configuration"""
        self.config = self.load_config()
        logger.info(f"Initialized {TASK_NAME} automation")

    def load_config(self):
        """Load configuration from environment"""
        return {
            {CONFIG_ITEMS}
        }

    {GENERATED_METHODS}

    def run(self):
        """Main execution workflow"""
        try:
            logger.info("Starting {TASK_NAME} automation...")

            {WORKFLOW_IMPLEMENTATION}

            logger.info("✅ Automation complete!")
            return True

        except Exception as e:
            logger.error(f"❌ Automation failed: {str(e)}")
            self.send_error_alert(str(e))
            return False

    def send_error_alert(self, error_message):
        """Send error notification"""
        # Implement notification logic
        pass

if __name__ == "__main__":
    automation = {TASK_CLASS_NAME}()
    automation.run()
```

**Prompt Template**:

```markdown
# {TASK_NAME} - AI Insights Generation Prompt

## System Prompt

You are a {DOMAIN} expert analyzing {DATA_TYPE} data.
Your goal is to {PRIMARY_GOAL}.

## Context

Company: {COMPANY_NAME}
Product: {PRODUCT_DESCRIPTION}
Target Metrics: {TARGET_METRICS}
Previous Period: {PREVIOUS_INSIGHTS}

## Current Data

```json
{DATA_PLACEHOLDER}
```

## Task

Analyze the data and provide:

1. **Key Highlights** (3-5 bullets)
   - Most important changes vs last period
   - Notable achievements or concerns

2. **Trend Analysis**
   - Patterns observed
   - Progress toward goals

3. **Anomaly Detection**
   - Unexpected changes (±{ANOMALY_THRESHOLD}%)
   - Potential root causes

4. **Recommendations** (2-3 specific actions)
   - What to do differently
   - Opportunities to pursue

## Output Format

{OUTPUT_SCHEMA}

## Guidelines

- Be specific (use numbers)
- Focus on actionable insights
- Compare to benchmarks: {BENCHMARKS}
- Flag both opportunities and risks
- Suggest concrete next steps

## Examples

{EXAMPLE_OUTPUTS}
```

#### Package Structure Generation

```
implementation_package/
└── {task_name_slug}/
    ├── README.md                    # Overview & quick start
    ├── WORKFLOW.md                  # Detailed workflow diagram
    │
    ├── scripts/
    │   ├── main.py                  # Main automation script
    │   ├── data_fetcher.py          # Data collection module
    │   ├── processor.py             # Data processing
    │   ├── analyzer.py              # Analysis logic
    │   ├── notifier.py              # Notification sender
    │   ├── utils.py                 # Utility functions
    │   └── requirements.txt         # Python dependencies
    │
    ├── prompts/
    │   ├── analysis_prompt.md       # AI analysis prompt
    │   ├── summary_prompt.md        # Summary generation
    │   ├── anomaly_prompt.md        # Anomaly detection
    │   └── examples.json            # Example inputs/outputs
    │
    ├── config/
    │   ├── .env.example             # Environment variables template
    │   ├── config.yaml              # Configuration file
    │   ├── n8n_workflow.json        # n8n workflow (if applicable)
    │   └── zapier_template.json     # Zapier template (if applicable)
    │
    ├── docs/
    │   ├── setup_guide.md           # Step-by-step setup
    │   ├── api_setup.md             # API credentials guide
    │   ├── troubleshooting.md       # Common issues
    │   ├── maintenance.md           # Ongoing maintenance
    │   └── customization.md         # How to customize
    │
    ├── tests/
    │   ├── test_main.py             # Unit tests
    │   └── sample_data.json         # Test data
    │
    └── .github/
        └── workflows/
            └── automation.yml        # GitHub Actions workflow
```

#### README.md Template

```markdown
# {TASK_NAME} Automation

{ONE_LINE_DESCRIPTION}

## What This Does

{BULLET_LIST_OF_FEATURES}

**Time savings**: {CURRENT_TIME}h/week → {NEW_TIME}h/week (**{SAVINGS}h saved**)

## Quick Start

### Prerequisites

- [ ] Python 3.9+
- [ ] API access: {LIST_OF_APIS}
- [ ] {OTHER_REQUIREMENTS}

### Installation

1. **Clone this folder**
   ```bash
   cd implementation_package/{task_slug}
   ```

2. **Install dependencies**
   ```bash
   pip install -r scripts/requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp config/.env.example config/.env
   # Edit .env with your API keys
   ```

4. **Test run**
   ```bash
   python scripts/main.py
   ```

5. **Schedule automation**

   **Option A: Cron (Mac/Linux)**
   ```bash
   crontab -e
   # Add: {CRON_SCHEDULE} /path/to/python /path/to/main.py
   ```

   **Option B: GitHub Actions**
   - Push to GitHub
   - Workflow runs automatically (see .github/workflows/)

   **Option C: Cloud Function**
   - Deploy to AWS Lambda / Google Cloud Function
   - See docs/cloud_deployment.md

## How It Works

{WORKFLOW_DIAGRAM}

## Configuration

Edit `config/config.yaml`:

```yaml
{SAMPLE_CONFIG}
```

## Usage

### Manual run
```bash
python scripts/main.py
```

### With options
```bash
python scripts/main.py --date 2024-01-15 --dry-run
```

## Troubleshooting

{COMMON_ISSUES_AND_SOLUTIONS}

More help: See `docs/troubleshooting.md`

## Maintenance

- **Weekly**: {WEEKLY_TASKS}
- **Monthly**: {MONTHLY_TASKS}
- **Quarterly**: {QUARTERLY_TASKS}

## Customization

Want to modify? See `docs/customization.md`

## Support

Questions? Create an issue or contact {CONTACT}
```

#### Outputs

For each selected task, generate complete package as described above.

Update `automation_plan.json`:
```json
{
  "implemented_workflows": [
    {
      "task_id": "task_001",
      "task_name": "Weekly performance dashboard",
      "status": "complete",
      "package_location": "./implementation_package/weekly_dashboard/",
      "files_generated": 24,
      "estimated_time_savings": 7.5,
      "implementation_complexity": 2,
      "next_steps": [
        "1. Set up API credentials in .env",
        "2. Run test: python scripts/main.py --dry-run",
        "3. Schedule automation (cron/GitHub Actions)",
        "4. Monitor first 2 runs"
      ],
      "support_resources": [
        "docs/setup_guide.md",
        "docs/troubleshooting.md"
      ]
    }
  ]
}
```

#### Agent Behavior Rules
1. **Production-ready code**: 에러 핸들링, 로깅, 보안
2. **Clear documentation**: 단계별 가이드
3. **Realistic limitations**: 유지보수 필요성 명시
4. **Flexible options**: No-code/Low-code/Code 제공
5. **Test before delivery**: 생성된 코드 검증

---

## 🎨 Visual Design System

### Color Palette

```css
/* Primary */
--primary-600: #4F46E5;  /* Indigo - Main CTA */
--primary-500: #6366F1;  /* Lighter primary */
--primary-700: #4338CA;  /* Darker primary */

/* Secondary */
--secondary-500: #8B5CF6;  /* Purple - Accents */

/* Semantic Colors */
--success-500: #10B981;   /* Green - Completed, High automation */
--warning-500: #F59E0B;   /* Amber - Medium priority */
--danger-500: #EF4444;    /* Red - Critical gaps */
--info-500: #3B82F6;      /* Blue - Information */

/* Neutrals */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-600: #4B5563;
--gray-900: #111827;

/* Backgrounds */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-accent: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Typography

```css
/* Headings */
h1: 32px, font-weight: 700, letter-spacing: -0.02em
h2: 24px, font-weight: 600
h3: 20px, font-weight: 600
h4: 18px, font-weight: 600

/* Body */
body: 16px, font-weight: 400, line-height: 1.6
small: 14px
tiny: 12px

/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

### Components

#### Agent Avatar
```html
<div class="agent-avatar">
  <div class="avatar-circle">
    <span class="avatar-icon">🤖</span>
  </div>
  <div class="agent-info">
    <div class="agent-name">Context Interviewer</div>
    <div class="agent-role">Strategic Consultant</div>
  </div>
</div>
```

#### Progress Indicator
```html
<div class="progress-tracker">
  <div class="phase-step completed">
    <div class="step-number">1</div>
    <div class="step-label">Context</div>
  </div>
  <div class="phase-connector"></div>
  <div class="phase-step active">
    <div class="step-number">2</div>
    <div class="step-label">Current State</div>
  </div>
  <!-- ... -->
</div>
```

#### Data Card
```html
<div class="data-card">
  <div class="card-header">
    <h4 class="card-title">{Title}</h4>
    <span class="card-badge {type}">{Badge}</span>
  </div>
  <div class="card-body">
    {Content}
  </div>
  <div class="card-footer">
    {Actions}
  </div>
</div>
```

#### Chart Visualization
```html
<div class="chart-container">
  <div class="chart-header">
    <h4>{Chart Title}</h4>
    <div class="chart-legend">
      <!-- Legend items -->
    </div>
  </div>
  <div class="chart-body">
    <canvas id="chartCanvas"></canvas>
  </div>
</div>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { ... }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1025px) { ... }
```

### Mobile Adaptations

- Stack charts vertically
- Full-width cards
- Simplified navigation
- Larger touch targets (min 44px)
- Condensed data tables

---

## 🔧 Technical Specifications

### Data Formats

All JSON files follow consistent schema:

```typescript
interface BaseOutput {
  timestamp: string;  // ISO 8601
  version: string;    // Schema version
}

interface Context extends BaseOutput {
  mission: string;
  objectives: Objective[];
  role_responsibilities: RoleResponsibility[];
  stakeholders: Stakeholders;
  current_challenges: string;
  success_vision: string;
}

// ... (other interfaces)
```

### File Storage

```
/workshop_sessions/
  └── {session_id}/
      ├── context.json
      ├── current_state.json
      ├── strategic_gaps.json
      ├── automation_plan.json
      └── implementation_package/
          └── ...
```

### Agent Prompts Location

```
/prompts/
  ├── phase1_context_interviewer.md
  ├── phase2_state_analyzer.md
  ├── phase3_gap_finder.md
  ├── phase4_automation_advisor.md
  └── phase5_workflow_designer.md
```

---

## 🎯 Success Metrics

### User Engagement Metrics

- **Completion Rate**: % users who complete all 5 phases
- **Time Spent**: Average time per phase
- **Interaction Rate**: Messages per phase
- **Return Rate**: Users who come back to refine

### Outcome Metrics

- **Time Freed**: Average hours/week saved
- **Gaps Discovered**: Average strategic gaps per user
- **Implementation Rate**: % who download packages
- **Satisfaction**: NPS score

### Quality Metrics

- **Accuracy**: User validation of extracted tasks
- **Relevance**: User rating of gap discoveries
- **Usability**: Code package success rate

---

## 🚀 Implementation Phases

### Phase 1: Demo HTML Prototype (This Sprint)
- Build interactive HTML demo
- Hardcoded data flow
- Full UX walkthrough
- Stakeholder validation

### Phase 2: Backend Integration (Next Sprint)
- Real AI analysis
- Data persistence
- API endpoints
- File generation

### Phase 3: Production Polish (Future)
- User accounts
- Session management
- Analytics
- Optimization

---

## 📚 Appendix

### Agent Prompt Files

See `/prompts/` directory for complete agent prompts:
- `phase1_context_interviewer.md`
- `phase2_state_analyzer.md`
- `phase3_gap_finder.md`
- `phase4_automation_advisor.md`
- `phase5_workflow_designer.md`

### Sample Data

See `/sample_data/` for example outputs at each phase.

### Wireframes

See `/wireframes/` for detailed UI mockups.

---

**Document Version**: 1.0
**Last Updated**: 2024-01-15
**Author**: Work Redesign Workshop Team
