# 업무 추출 분석 프롬프트 - 구조 및 처리 흐름 분석

> **작성일**: 2025-01-17
> **대상 프롬프트**: `/prompts/task-extraction-prompt.md`
> **처리 코드**: `workshop-server.js` (analyzeTasks 함수)

---

## 📋 목차

1. [프롬프트 구조 분석](#1-프롬프트-구조-분석)
2. [데이터 흐름 및 처리 파이프라인](#2-데이터-흐름-및-처리-파이프라인)
3. [한국어 전처리 및 파싱](#3-한국어-전처리-및-파싱)
4. [의미 통합 메커니즘](#4-의미-통합-메커니즘)
5. [현재 한계점 및 개선 방향](#5-현재-한계점-및-개선-방향)

---

## 1. 프롬프트 구조 분석

### 1.1 전체 구조 (계층적 설계)

```
업무 추출 분석 프롬프트 (285줄)
│
├── [역할 정의] (3줄)
│   └── "10년 경력 업무 재설계 컨설턴트"
│
├── [📊 분석 대상] (8-17줄)
│   ├── 사용자 정의 업무 영역: {domains}
│   ├── 업로드된 문서 내용: {uploadedDocuments}
│   └── 팀장 직접 입력 내용: {manualInput}
│
├── [🎯 추출 기준] (21-42줄)
│   ├── 1. 반복성 (Repetitiveness)
│   ├── 2. 시간 임계값 (Time Threshold: 30분+)
│   ├── 3. 자동화 가능성 (Automation Potential)
│   └── 4. ROI 고려 (Return on Investment)
│
├── [🔍 분석 방법론] (45-70줄)
│   ├── 시간 표현 패턴 (12개 예시)
│   ├── 반복 키워드 (9개 예시)
│   ├── 프로세스 키워드 (16개 카테고리)
│   └── 도구 및 시스템 언급 (12개 예시)
│
├── [📋 출력 형식] (73-95줄)
│   └── Strict JSON Schema (12개 필드)
│
├── [필드별 상세 가이드] (97-162줄)
│   ├── 각 필드 정의 및 예시
│   ├── enum 값 명세
│   └── 계산식 (estimatedSavings 등)
│
├── [🎨 작업 지침] (165-188줄)
│   ├── 업무 추출 규칙
│   ├── 영역 분류 규칙
│   ├── 데이터 검증 규칙
│   └── 우선순위 정렬 규칙
│
├── [✅ 응답 규칙] (191-199줄)
│   └── 6가지 엄격한 제약 조건
│
├── [📝 예시 출력] (202-267줄)
│   └── 4개 실제 업무 예시 (완전한 JSON)
│
└── [⚠️ 주의사항] (270-280줄)
    └── 7가지 경고 사항
```

### 1.2 프롬프트 설계 원칙

#### A. **역할 기반 접근 (Role-Based Prompting)**
```markdown
당신은 **10년 경력의 업무 재설계 및 프로세스 최적화 컨설턴트**입니다.
```
- ✅ **효과**: Claude가 전문가 페르소나로 응답
- ✅ **이점**: 일관된 품질, 구조화된 분석

#### B. **명시적 제약 조건 (Explicit Constraints)**
```markdown
- 주 1회 이상 반복되는 업무만 추출
- 30분 이상 소요되는 업무 우선 추출
- JSON 배열만 응답 (```json 코드블록 사용 금지)
```
- ✅ **효과**: 노이즈 감소, 관련성 높은 업무만 추출
- ✅ **이점**: ROI 기반 필터링으로 실용성 향상

#### C. **Few-Shot Learning (예시 기반 학습)**
```json
[
  {
    "title": "일일 고객 문의 이메일 처리",
    "description": "매일 오전 9시 고객센터 메일함 확인 → ...",
    "timeSpent": 1.5,
    "estimatedSavings": 24,
    ...
  }
]
```
- ✅ **효과**: 출력 형식 일관성 보장
- ✅ **이점**: 4개의 완전한 예시로 다양한 케이스 커버

#### D. **Chain-of-Thought (단계적 사고 유도)**
```markdown
## 🔍 분석 방법론
### 문서에서 다음 패턴을 식별하세요:
#### 시간 표현 패턴
- "매일 9시", "오전/오후 X시"
...
```
- ✅ **효과**: AI가 체계적으로 문서를 분석
- ✅ **이점**: 누락 없이 패턴 매칭

---

## 2. 데이터 흐름 및 처리 파이프라인

### 2.1 전체 파이프라인

```
[Step 1] 사용자 입력
    ↓
[Step 2] 프론트엔드 (React)
    ├── Step 3: 업무 영역별 수동 입력
    │   └── manualTaskInput[domain] = "업무 내용..."
    └── 업무 영역별 통합
        └── combinedInput = "[영역명]\n업무1\n업무2"
    ↓
[Step 3] API 호출
    POST /api/workshops/:id/extract-tasks
    Body: { manualInput: combinedInput }
    ↓
[Step 4] 서버 전처리 (workshop-server.js)
    ├── 프롬프트 파일 로딩
    │   └── loadPromptTemplate() → 캐싱
    ├── 변수 치환
    │   ├── {domains} → domains.join(', ')
    │   ├── {uploadedDocuments} → documentText
    │   └── {manualInput} → manualInput
    └── System Prompt 생성
    ↓
[Step 5] Claude API 호출
    ├── Model: claude-3-5-sonnet-20241022
    ├── Max Tokens: 8000
    ├── Temperature: 0.3
    └── Messages: [{ role: 'user', content: userMessage }]
    ↓
[Step 6] 응답 처리
    ├── JSON 추출 (정규식)
    │   └── /\[[\s\S]*\]/.match()
    ├── JSON.parse()
    └── 데이터 검증
        └── filter(task => task.title && task.description && task.domain)
    ↓
[Step 7] 응답 반환
    {
      success: true,
      tasks: validTasks,
      count: validTasks.length
    }
    ↓
[Step 8] 프론트엔드 렌더링
    Step 4: 추출된 업무 목록 표시
```

### 2.2 코드 레벨 상세 흐름

#### A. 프롬프트 로딩 (캐싱 전략)

```javascript
// workshop-server.js:164-191

let cachedPromptTemplate = null;  // 글로벌 캐시

function loadPromptTemplate() {
  const promptPath = path.join(__dirname, 'prompts', 'task-extraction-prompt.md');

  if (fsSync.existsSync(promptPath)) {
    return fsSync.readFileSync(promptPath, 'utf-8');  // 동기 읽기
  }
  return null;  // Fallback으로 하드코딩 프롬프트 사용
}

function getPromptTemplate() {
  if (!cachedPromptTemplate) {
    cachedPromptTemplate = loadPromptTemplate();  // 최초 1회만 로딩
  }
  return cachedPromptTemplate;
}
```

**장점**:
- ✅ 파일 I/O 최소화 (서버 시작 후 첫 요청 시에만)
- ✅ 프롬프트 수정 시 서버 재시작으로 반영 가능
- ✅ Fallback 메커니즘으로 안정성 보장

**한계점**:
- ❌ Hot reload 미지원 (프롬프트 수정 후 자동 반영 안 됨)
- ❌ 파일 읽기 실패 시 에러 로깅만, 복구 로직 없음

#### B. 변수 치환 (Template String Replacement)

```javascript
// workshop-server.js:206-209

systemPrompt = promptTemplate
  .replace('{domains}', domains.join(', '))
  .replace('{uploadedDocuments}', documentText || '(업로드된 문서 없음)')
  .replace('{manualInput}', manualInput || '(직접 입력한 내용 없음)');
```

**장점**:
- ✅ 단순하고 명확한 로직
- ✅ Fallback 텍스트로 빈 입력 처리

**한계점**:
- ❌ 단순 문자열 치환 (고급 템플릿 엔진 미사용)
- ❌ 변수가 여러 번 나타날 경우 첫 번째만 치환
- ❌ 이스케이프 처리 없음 (특수문자 포함 시 문제 가능)

**개선 방안**:
```javascript
// 전역 치환 + 이스케이프
systemPrompt = promptTemplate
  .replace(/\{domains\}/g, domains.join(', '))
  .replace(/\{uploadedDocuments\}/g, escapeMarkdown(documentText || '(없음)'))
  .replace(/\{manualInput\}/g, escapeMarkdown(manualInput || '(없음)'));

function escapeMarkdown(text) {
  return text.replace(/[[\]{}]/g, '\\$&');  // 특수문자 이스케이프
}
```

#### C. JSON 추출 (정규식 기반)

```javascript
// workshop-server.js:265-269

const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
if (!jsonMatch) {
  console.error('JSON 형식 없음:', textContent.text.substring(0, 500));
  return [];
}
const tasks = JSON.parse(jsonMatch[0]);
```

**장점**:
- ✅ Claude가 추가 설명을 포함해도 JSON만 추출
- ✅ 간단하고 빠른 패턴 매칭

**한계점**:
- ❌ 중첩 배열 처리 취약 (가장 바깥 `[]`만 매칭)
- ❌ JSON이 여러 개일 경우 첫 번째만 추출
- ❌ Malformed JSON 시 에러만 발생 (복구 로직 없음)

**개선 방안**:
```javascript
// 더 robust한 JSON 추출
function extractJSON(text) {
  // 1. 코드블록 제거
  let cleaned = text.replace(/```json\n?|\n?```/g, '');

  // 2. 첫 [ 부터 마지막 ] 까지 추출
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');

  if (firstBracket === -1 || lastBracket === -1) {
    throw new Error('JSON 배열을 찾을 수 없습니다');
  }

  const jsonStr = cleaned.substring(firstBracket, lastBracket + 1);

  // 3. JSON 파싱 + 검증
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      throw new Error('배열 형식이 아닙니다');
    }
    return parsed;
  } catch (e) {
    // 4. 파싱 실패 시 Claude에게 재요청
    console.error('JSON 파싱 실패, 재시도 필요:', e.message);
    throw e;
  }
}
```

#### D. 데이터 검증 (기본 필드만)

```javascript
// workshop-server.js:274-280

const validTasks = tasks.filter(task => {
  return task.title && task.description && task.domain;
});

console.log(`✅ 검증 완료: ${validTasks.length}개 유효한 업무`);
```

**장점**:
- ✅ 빠른 기본 검증
- ✅ 최소한의 필수 필드 보장

**한계점**:
- ❌ **타입 검증 없음** (timeSpent가 문자열이어도 통과)
- ❌ **enum 검증 없음** (frequency="invalid" 허용)
- ❌ **범위 검증 없음** (timeSpent=-1, estimatedSavings=99999 허용)
- ❌ **필드 누락 검증 부족** (12개 필드 중 3개만 검사)

---

## 3. 한국어 전처리 및 파싱

### 3.1 현재 한국어 처리 현황

#### ✅ **잘 되고 있는 부분**

##### A. 프롬프트 레벨 한국어 패턴 인식

프롬프트에 **한국어 키워드 명시**:
```markdown
#### 시간 표현 패턴
- "매일 9시", "오전/오후 X시"
- "주 2회", "월말", "분기말"
- "소요 시간: X분/시간", "약 X시간 소요"
- "일 30분", "주 2시간", "월 5시간"

#### 반복 키워드
- "정기적으로", "매번", "항상", "지속적으로"
- "일일", "주간", "월간", "분기별", "연간"
```

**효과**:
- Claude는 프롬프트의 예시를 학습하여 유사 패턴 인식
- 한국어 문맥을 이해하고 의미 추출

##### B. 한국어 enum 매핑

프롬프트에서 **한국어-영어 매핑 명시**:
```markdown
#### 5. frequency (빈도)
- **Daily**: 매일 (주 5회 이상)
- **Weekly**: 주 단위 (주 1-4회)
- **Monthly**: 월 단위 (월 1-4회)
```

**효과**:
- "매일 9시" → frequency: "Daily"
- "주 2회" → frequency: "Weekly"
- 자동 변환 (추가 파싱 불필요)

##### C. 한국어 5W1H 기반 설명 생성

```markdown
"description": "구체적인 업무 절차 및 내용 (100-300자, 5W1H 포함: 누가, 무엇을, 언제, 어디서, 왜, 어떻게)"
```

**예시**:
```
입력: "매일 오전 고객 이메일 확인하고 답변"

출력: "매일 오전 9시 고객센터 메일함 확인 → 문의 유형별 분류 (일반/긴급/기술)
      → 템플릿 기반 답변 작성 → 발송 (평균 30건/일)"
```

#### ❌ **개선이 필요한 부분**

##### A. 한국어 시간 표현 파싱 미흡

**현재**: Claude가 프롬프트 예시를 보고 "추론"하지만, 명시적 파싱 로직 없음

```javascript
// 현재는 이런 파싱이 없음
입력: "일 30분", "주 2시간", "월 5시간"
→ timeSpent 계산 로직 없음 (Claude의 추정에 의존)
```

**문제 케이스**:
```
"매일 30분씩 보고서 작성"
→ timeSpent: 0.5 (✅ 올바름)

"주 2회, 각 1시간씩 회의"
→ timeSpent: 1 또는 2? (❌ 애매함)
```

**개선 방안**:
```javascript
// 한국어 시간 표현 전처리 함수
function parseKoreanTimeExpression(text) {
  const patterns = [
    { regex: /일\s*(\d+(?:\.\d+)?)\s*시간/g, multiplier: 1 },
    { regex: /일\s*(\d+)\s*분/g, multiplier: 1/60 },
    { regex: /주\s*(\d+(?:\.\d+)?)\s*시간/g, multiplier: 1/5 },  // 주 5일 기준
    { regex: /월\s*(\d+(?:\.\d+)?)\s*시간/g, multiplier: 1/20 }, // 월 20일 기준
  ];

  for (const { regex, multiplier } of patterns) {
    const match = text.match(regex);
    if (match) {
      const hours = parseFloat(match[1]) * multiplier;
      return hours;
    }
  }
  return null;  // 파싱 실패 시 Claude에게 위임
}

// 프롬프트에 시간 정규화 추가
systemPrompt += `
만약 시간 정보를 발견하면 다음과 같이 변환하세요:
- "일 30분" → timeSpent: 0.5
- "주 2시간" → timeSpent: 0.4 (주 5일 기준)
- "월 10시간" → timeSpent: 0.5 (월 20일 기준)
`;
```

##### B. 업무 영역 분류 정확도 문제

**현재**: 도메인이 완전히 일치해야만 매핑
```javascript
domains = ["고객 지원 및 CS 관리", "마케팅 캠페인 운영"]

입력: "고객 문의 처리"
→ domain: "고객 지원 및 CS 관리" (✅ 추론 성공)

입력: "CS 이메일 답변"
→ domain: "고객 지원 및 CS 관리" (✅ 추론 성공)

입력: "컴플레인 관리"
→ domain: "기타" (❌ 의미적으로는 CS에 속함)
```

**개선 방안**:
```javascript
// 의미 기반 도메인 매칭 (임베딩 활용)
async function findBestDomain(taskDescription, domains) {
  // 1. 간단한 키워드 매칭
  const keywordMap = {
    "고객 지원 및 CS 관리": ["고객", "CS", "문의", "컴플레인", "VOC", "응대"],
    "마케팅 캠페인 운영": ["마케팅", "광고", "캠페인", "프로모션", "CTR", "CVR"],
    // ...
  };

  for (const [domain, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(keyword => taskDescription.includes(keyword))) {
      return domain;
    }
  }

  // 2. 임베딩 유사도 (고급)
  // const similarity = await calculateSimilarity(taskDescription, domain);
  // return mostSimilarDomain;

  return "기타";
}
```

##### C. 중복 업무 통합 미흡

**현재**: 프롬프트에 "중복 통합" 명시했지만 정확도 낮음

```
입력 1: "매일 고객 이메일 확인"
입력 2: "일일 고객 문의 메일 처리"

→ 두 개의 별도 업무로 추출될 가능성 (❌)
```

**개선 방안**:
```javascript
// 후처리: 유사도 기반 중복 제거
function deduplicateTasks(tasks) {
  const deduplicated = [];

  for (const task of tasks) {
    const isDuplicate = deduplicated.some(existing => {
      // 1. 제목 유사도 (Levenshtein distance)
      const titleSimilarity = similarity(task.title, existing.title);

      // 2. 설명 유사도 (TF-IDF cosine similarity)
      const descSimilarity = cosineSimilarity(task.description, existing.description);

      // 3. 같은 도메인이면서 유사도 80% 이상
      return task.domain === existing.domain &&
             (titleSimilarity > 0.8 || descSimilarity > 0.7);
    });

    if (!isDuplicate) {
      deduplicated.push(task);
    }
  }

  return deduplicated;
}
```

---

## 4. 의미 통합 메커니즘

### 4.1 현재 의미 통합 방식

#### A. **Claude의 자연어 이해 (NLU)에 전적으로 의존**

```
[업로드된 문서] + [수동 입력] → Claude API → 통합된 업무 목록
                                    ↑
                            프롬프트가 "통합" 지시
```

**프롬프트 지시**:
```markdown
### 1. 업무 추출
- 위 모든 정보에서 개별 업무를 빠짐없이 추출하세요
- 중복된 업무는 통합하되, 서로 다른 관점의 업무는 별도로 유지하세요
```

**장점**:
- ✅ Claude의 강력한 NLU로 문맥 이해
- ✅ 복잡한 규칙 없이 자연스러운 통합

**한계점**:
- ❌ 통합 기준이 불명확 (Claude의 "판단"에 의존)
- ❌ 일관성 부족 (같은 입력도 다른 결과 가능)
- ❌ 디버깅 어려움 (왜 통합되었는지/안 되었는지 불명확)

### 4.2 의미 통합 시나리오 분석

#### Scenario 1: 완전 중복 (표현만 다름)

```
문서: "매일 오전 고객 이메일 확인 및 답변"
입력: "일일 고객 문의 메일 처리"

→ Claude 판단: 같은 업무 (✅ 통합 성공)
→ 결과: 1개 업무로 통합
```

#### Scenario 2: 부분 중복 (관점 다름)

```
문서: "고객 이메일 답변 작성 (일반 문의)"
입력: "긴급 고객 이슈 대응 (1시간 내)"

→ Claude 판단: 다른 업무 (✅ 별도 유지 정당)
→ 결과: 2개 업무로 분리
```

#### Scenario 3: 애매한 경우 (Claude 판단 불안정)

```
문서: "주간 매출 데이터 수집 및 정리"
입력: "매주 매출 보고서 작성"

→ Claude 판단:
   - 경우 1: 같은 업무 (데이터 정리 = 보고서 작성)
   - 경우 2: 다른 업무 (수집/정리 ≠ 작성)

→ 문제: 일관성 없음 (❌)
```

### 4.3 의미 통합 품질 검증 방법 (현재 없음)

**제안하는 검증 로직**:

```javascript
// 통합 품질 검증
function validateTaskIntegration(tasks) {
  const issues = [];

  // 1. 중복 의심 검사
  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const task1 = tasks[i];
      const task2 = tasks[j];

      // 같은 도메인, 같은 빈도, 유사한 제목
      if (task1.domain === task2.domain &&
          task1.frequency === task2.frequency &&
          similarity(task1.title, task2.title) > 0.6) {
        issues.push({
          type: 'potential_duplicate',
          tasks: [task1.title, task2.title],
          similarity: similarity(task1.title, task2.title)
        });
      }
    }
  }

  // 2. 과도한 세분화 검사
  const domainCounts = tasks.reduce((acc, task) => {
    acc[task.domain] = (acc[task.domain] || 0) + 1;
    return acc;
  }, {});

  for (const [domain, count] of Object.entries(domainCounts)) {
    if (count > 10) {  // 한 도메인에 10개 이상 업무
      issues.push({
        type: 'over_segmentation',
        domain: domain,
        count: count,
        suggestion: '너무 세분화되었을 수 있음. 통합 검토 필요'
      });
    }
  }

  return issues;
}
```

---

## 5. 현재 한계점 및 개선 방향

### 5.1 파싱 및 전처리 한계점

| 항목 | 현재 상태 | 한계점 | 개선 방향 |
|------|-----------|--------|-----------|
| **한국어 시간 표현** | Claude 추론에 의존 | 정확도 80-85% 추정 | 정규식 기반 전처리 추가 |
| **업무 영역 매핑** | 완전 일치만 인식 | "CS" ≠ "고객 지원" | 키워드 확장 + 임베딩 |
| **중복 업무 통합** | Claude 판단에 의존 | 일관성 부족 (70-75%) | 후처리 유사도 검사 |
| **JSON 파싱** | 단순 정규식 | Malformed JSON 취약 | Robust 파서 + 재시도 |
| **데이터 검증** | 3개 필드만 검사 | 타입/범위 미검증 | Zod/Joi 스키마 검증 |

### 5.2 한국어 전처리 개선 로드맵

#### Phase 1: 기본 전처리 (1-2일)

```javascript
// 1. 한국어 시간 표현 정규화
function normalizeKoreanTime(text) {
  const replacements = [
    [/(\d+)\s*시간\s*(\d+)\s*분/g, (_, h, m) => `${parseFloat(h) + parseFloat(m)/60}시간`],
    [/(\d+)\s*분/g, (_, m) => `${parseFloat(m)/60}시간`],
    [/주\s*(\d+)\s*회/g, (_, n) => `주간 ${n}회`],
  ];

  let normalized = text;
  for (const [pattern, replacement] of replacements) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
}

// 2. 업무 영역 키워드 확장
const domainKeywords = {
  "고객 지원 및 CS 관리": [
    "고객", "CS", "문의", "컴플레인", "VOC", "응대", "상담", "클레임",
    "customer", "support", "service"
  ],
  // ...
};

// 3. 프롬프트에 정규화 지시 추가
systemPrompt += `
입력 텍스트를 분석하기 전에 다음과 같이 정규화하세요:
- 시간 표현: "2시간 30분" → 2.5
- 빈도 표현: "주 2회" → "Weekly"
`;
```

#### Phase 2: 의미 기반 매칭 (3-5일)

```javascript
// 임베딩 기반 도메인 매칭 (OpenAI Embeddings 또는 한국어 BERT)
import { embed } from './embeddings';  // 가정

async function semanticDomainMatching(taskDescription, domains) {
  const taskEmbedding = await embed(taskDescription);
  const domainEmbeddings = await Promise.all(
    domains.map(domain => embed(domain))
  );

  // Cosine similarity 계산
  const similarities = domainEmbeddings.map((domainEmbed, i) => ({
    domain: domains[i],
    score: cosineSimilarity(taskEmbedding, domainEmbed)
  }));

  // 최고 유사도 도메인 선택 (threshold: 0.6)
  const best = similarities.sort((a, b) => b.score - a.score)[0];
  return best.score > 0.6 ? best.domain : "기타";
}
```

#### Phase 3: 통합 품질 향상 (1주)

```javascript
// 1. Claude에게 중복 체크 명시적 지시
systemPrompt += `
업무 추출 후 다음 중복 체크를 수행하세요:
1. 제목이 70% 이상 유사 → 통합
2. 같은 도메인 + 같은 빈도 + 유사한 설명 → 통합
3. 통합 시 더 상세한 설명을 채택

통합 로그를 주석으로 남기세요:
// MERGED: "일일 이메일 처리" + "매일 메일 확인" → "일일 고객 문의 이메일 처리"
`;

// 2. 후처리 검증
const integratedTasks = deduplicateTasks(tasks);
const validationIssues = validateTaskIntegration(integratedTasks);

if (validationIssues.length > 0) {
  console.warn('⚠️ 통합 품질 이슈 발견:', validationIssues);
  // 사용자에게 확인 요청 또는 자동 수정
}
```

### 5.3 프롬프트 구조 개선 방향

#### A. 현재 프롬프트 강점

| 강점 | 설명 | 효과 |
|------|------|------|
| ✅ **구조화** | 명확한 섹션 구분 (📊, 🎯, 🔍) | 가독성 ↑, 유지보수성 ↑ |
| ✅ **예시 중심** | 4개의 완전한 JSON 예시 | 출력 품질 ↑, 일관성 ↑ |
| ✅ **제약 명시** | 30분+ 반복 업무만 추출 | 노이즈 ↓, 관련성 ↑ |
| ✅ **ROI 기반** | estimatedSavings 계산 유도 | 실용성 ↑, 우선순위화 ↑ |

#### B. 개선 포인트

##### 1. **Chain-of-Thought 강화**

**현재**:
```markdown
## 🔍 분석 방법론
### 문서에서 다음 패턴을 식별하세요:
```

**개선**:
```markdown
## 🔍 분석 방법론 (단계별 수행)

### Step 1: 시간 표현 추출
1. 문서에서 시간 키워드 찾기: "매일", "주", "월", "분", "시간"
2. 각 키워드 주변 텍스트 추출 (앞뒤 10단어)
3. 시간 정보를 숫자로 변환
   - 예: "일 30분" → 0.5시간, "주 2회" → frequency=Weekly

### Step 2: 반복 업무 식별
1. 시간 정보가 있는 문장 중 동사 추출: "처리", "작성", "확인"
2. 동사가 있는 문장을 업무 후보로 등록
3. 업무 후보 중 반복 키워드 포함 여부 확인

### Step 3: 중복 제거
1. 모든 업무 후보 쌍별 비교 (title 기준)
2. Levenshtein distance < 3이면 통합 검토
3. 통합 시 더 상세한 설명 채택
```

##### 2. **Self-Consistency 추가**

```markdown
## 🔍 자가 검증 (Self-Check)

추출 완료 후 다음을 확인하세요:

### 필수 체크리스트
- [ ] 모든 업무는 30분 이상 소요됩니까?
- [ ] 모든 업무는 주 1회 이상 반복됩니까?
- [ ] timeSpent가 숫자입니까? (문자열 ❌)
- [ ] domain이 제공된 목록에 있습니까?
- [ ] 중복 업무가 없습니까?

### ROI 정합성 체크
- [ ] estimatedSavings = timeSpent × frequency_per_month × automation_rate?
- [ ] priority가 estimatedSavings와 일치합니까?
  - high: estimatedSavings >= 10
  - medium: 5 <= estimatedSavings < 10
  - low: estimatedSavings < 5

검증 실패 시 해당 업무를 수정하거나 제외하세요.
```

##### 3. **Few-Shot 예시 다양화**

현재 4개 예시를 8개로 확장:
- 다양한 도메인 (고객 지원, 마케팅, HR, IT, 재무)
- 다양한 빈도 (Daily, Weekly, Monthly, Ad-hoc)
- 다양한 자동화 레벨 (High, Medium, Low)
- 엣지 케이스 (시간 정보 없음, 도메인 애매함)

### 5.4 성능 및 안정성 개선

#### A. 에러 처리 강화

**현재**:
```javascript
try {
  const tasks = JSON.parse(jsonMatch[0]);
  return validTasks;
} catch (error) {
  console.error('Claude API 에러:', error);
  throw error;  // 그냥 다시 던짐
}
```

**개선**:
```javascript
try {
  const tasks = JSON.parse(jsonMatch[0]);
  return validTasks;
} catch (error) {
  console.error('파싱 에러:', error);

  // 재시도 로직
  if (retryCount < 3) {
    console.log(`재시도 ${retryCount + 1}/3...`);
    return await analyzeTasks(documentText, domains, manualInput, retryCount + 1);
  }

  // Fallback: 간단한 규칙 기반 추출
  console.warn('⚠️ AI 분석 실패, 규칙 기반 fallback 사용');
  return ruleBasedExtraction(documentText, domains, manualInput);
}
```

#### B. 캐싱 및 성능 최적화

```javascript
// 1. 프롬프트 템플릿 Hot Reload (선택적)
const chokidar = require('chokidar');

chokidar.watch('prompts/task-extraction-prompt.md')
  .on('change', () => {
    console.log('📄 프롬프트 파일 변경 감지, 캐시 무효화');
    cachedPromptTemplate = null;
  });

// 2. Claude API 응답 캐싱 (같은 입력 반복 시)
const responseCache = new Map();

async function analyzeTasks(documentText, domains, manualInput) {
  const cacheKey = hashInput(documentText + manualInput + domains.join(','));

  if (responseCache.has(cacheKey)) {
    console.log('📦 캐시된 응답 사용');
    return responseCache.get(cacheKey);
  }

  const result = await callClaudeAPI(...);
  responseCache.set(cacheKey, result);

  return result;
}
```

---

## 6. 향후 개선 우선순위

| 우선순위 | 개선 항목 | 예상 소요 | 예상 효과 |
|---------|----------|----------|----------|
| 🔴 **P0** | 타입 및 범위 검증 (Zod 스키마) | 4시간 | 데이터 품질 ↑↑ |
| 🔴 **P0** | JSON 파싱 Robust화 | 2시간 | 안정성 ↑↑ |
| 🟠 **P1** | 한국어 시간 표현 전처리 | 1일 | 정확도 ↑ (85% → 95%) |
| 🟠 **P1** | 중복 제거 후처리 | 1일 | 일관성 ↑ (75% → 90%) |
| 🟡 **P2** | 의미 기반 도메인 매칭 | 3일 | 매핑 정확도 ↑ |
| 🟡 **P2** | Chain-of-Thought 강화 | 1일 | 추출 품질 ↑ |
| 🟢 **P3** | Self-Consistency 체크 | 2일 | 신뢰도 ↑ |
| 🟢 **P3** | Hot Reload + 응답 캐싱 | 1일 | 개발 편의성 ↑ |

---

## 7. 결론 및 요약

### 7.1 현재 프롬프트 평가

| 평가 항목 | 점수 | 코멘트 |
|----------|------|--------|
| **프롬프트 구조** | ★★★★★ (5/5) | 명확하고 체계적 |
| **한국어 처리** | ★★★★☆ (4/5) | 패턴 인식 우수, 전처리 부족 |
| **의미 통합** | ★★★☆☆ (3/5) | Claude 의존, 일관성 부족 |
| **데이터 검증** | ★★☆☆☆ (2/5) | 기본 필드만 검사 |
| **에러 처리** | ★★☆☆☆ (2/5) | 재시도/fallback 없음 |
| **확장성** | ★★★★☆ (4/5) | 파일 기반, 유지보수 용이 |

### 7.2 핵심 강점

1. ✅ **체계적인 프롬프트 구조** - 섹션별 명확한 역할
2. ✅ **풍부한 예시** - Few-Shot Learning으로 품질 보장
3. ✅ **ROI 기반 우선순위** - 실용적인 업무 추출
4. ✅ **파일 기반 관리** - 버전 관리 및 수정 용이

### 7.3 개선 필요 영역

1. ❌ **타입 및 범위 검증 부족** → Zod 스키마 도입
2. ❌ **한국어 전처리 미흡** → 정규식 기반 정규화
3. ❌ **중복 통합 일관성 낮음** → 후처리 유사도 검사
4. ❌ **에러 복구 로직 없음** → 재시도 + fallback

### 7.4 제안하는 다음 단계

```
Phase 1 (즉시): 데이터 검증 강화
  ├── Zod 스키마 정의
  ├── 타입 체크 추가
  └── 범위 검증 추가

Phase 2 (1주 내): 한국어 전처리
  ├── 시간 표현 정규화
  ├── 키워드 확장
  └── 도메인 매칭 개선

Phase 3 (2주 내): 의미 통합 품질 향상
  ├── 후처리 중복 제거
  ├── 통합 품질 검증
  └── Chain-of-Thought 강화

Phase 4 (1개월 내): 고급 기능
  ├── 임베딩 기반 매칭
  ├── Hot Reload
  └── 응답 캐싱
```

---

**문서 끝**
