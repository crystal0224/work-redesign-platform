# Anthropic API 설정 및 문제 해결 가이드

Work Redesign Platform의 페르소나 시뮬레이션을 위한 Anthropic Claude API 완벽 가이드입니다.

## 목차
1. [API 키 설정](#api-키-설정)
2. [검증 단계](#검증-단계)
3. [비용 추정](#비용-추정)
4. [일반적인 오류 및 해결책](#일반적인-오류-및-해결책)
5. [대체 실행 방법](#대체-실행-방법)
6. [문제 해결 체크리스트](#문제-해결-체크리스트)

---

## API 키 설정

### 1단계: Anthropic 콘솔에서 API 키 발급받기

#### A. 콘솔 접속
```bash
# 브라우저에서 다음 URL 접속
https://console.anthropic.com/account/keys
```

#### B. 계정 생성/로그인
1. 상단 우측의 "Sign In" 버튼 클릭
2. Google/GitHub 계정 또는 이메일로 회원가입
3. 이메일 인증 완료

#### C. API 키 생성
1. 좌측 메뉴에서 "API Keys" 선택
2. "Create Key" 버튼 클릭
3. 키 이름 입력 (예: "Work Redesign Platform")
4. "Create Key" 버튼 클릭
5. **생성된 API 키를 안전한 장소에 복사** (다시 볼 수 없습니다!)

**예시 API 키 형식:**
```
sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 2단계: API 키 설정 방법

총 3가지 방법으로 API 키를 설정할 수 있습니다. 보안 수준이 높은 순서대로 설명합니다.

#### 방법 1️⃣: 환경 변수 설정 (가장 안전 - 추천 ⭐)

**Linux/Mac에서:**
```bash
# 현재 터미널 세션에만 적용
export ANTHROPIC_API_KEY=sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 스크립트 실행
npx ts-node scripts/persona-simulation.ts
```

**영구적으로 설정하려면 (Linux/Mac):**
```bash
# 홈 디렉토리의 .bashrc 또는 .zshrc 파일 열기
nano ~/.zshrc  # Mac의 경우

# 파일 끝에 다음 줄 추가
export ANTHROPIC_API_KEY="sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 변경사항 적용
source ~/.zshrc
```

**Windows PowerShell에서:**
```powershell
# 현재 세션에만 적용
$env:ANTHROPIC_API_KEY = "sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
npm run dev

# 영구적으로 설정 (관리자 권한 필요)
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx", "User")
```

**Windows 명령 프롬프트에서:**
```batch
# 현재 세션에만 적용
set ANTHROPIC_API_KEY=sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
npm run dev

# 영구적으로 설정 (시스템 환경 변수)
setx ANTHROPIC_API_KEY "sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### 방법 2️⃣: .env 파일 사용 (개발 환경 - 편리함)

**단계:**
1. 프로젝트 루트의 `.env.example` 파일을 복사하여 `.env` 파일 생성
```bash
cp .env.example .env
```

2. `.env` 파일을 텍스트 에디터로 열기
```bash
# VS Code에서
code .env

# 또는 Nano 에디터
nano .env
```

3. `ANTHROPIC_API_KEY` 값 수정
```env
# 이전
ANTHROPIC_API_KEY=sk-ant-api-your-key-here

# 수정 후
ANTHROPIC_API_KEY=sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

4. 파일 저장 (Ctrl+S 또는 Cmd+S)

5. 스크립트 실행
```bash
npx ts-node scripts/persona-simulation.ts
```

**⚠️ 중요 보안 주의사항:**
- `.env` 파일은 `.gitignore`에 포함되어 있습니다 (Git에 커밋되지 않음)
- 실수로 API 키가 GitHub에 올라가면 즉시 콘솔에서 해당 키를 삭제하세요
- 팀과 협업할 때는 `.env.example`만 공유하고, 실제 API 키는 절대 공유하지 마세요

#### 방법 3️⃣: 직접 코드에 입력 (비추천 ⚠️ - 보안 위험)

```typescript
// ❌ 절대 이렇게 하지 마세요!
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: 'sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx', // 하드코딩 금지!
});
```

**만약 코드에 API 키를 하드코딩했다면:**
1. Anthropic 콘솔에서 해당 키 삭제
2. 새로운 API 키 생성
3. 코드에서 API 키 제거
4. Git 히스토리에서도 제거 필요 (커밋된 경우)

---

### 3단계: 보안 모범 사례

#### ✅ DO (해야 할 것)
```bash
# ✅ 환경 변수 사용
export ANTHROPIC_API_KEY="sk-ant-v1-..."
npm run dev

# ✅ .env 파일 사용 (.gitignore에 포함됨)
cp .env.example .env
# .env 수정 후
npm run dev

# ✅ 1Password, LastPass 같은 비밀번호 관리자 사용
# ✅ 팀원과는 .env.example만 공유
```

#### ❌ DON'T (하지 말아야 할 것)
```bash
# ❌ 하드코딩된 API 키
apiKey: 'sk-ant-v1-...'

# ❌ Slack/Discord/이메일로 API 키 공유
# ❌ GitHub에 API 키 커밋
# ❌ .env 파일을 GitHub에 올리기
# ❌ 공개된 코드 저장소에 API 키 노출
```

#### 주기적 보안 점검
```bash
# 1개월마다 수행할 것
# 1. 콘솔 접속 후 API 키 목록 확인
# 2. 사용하지 않는 키 삭제
# 3. 마지막 사용 날짜 확인
# 4. 필요시 새로운 키로 교체

# Git 히스토리에서 실수로 커밋된 API 키 찾기
git log -p | grep -i "ANTHROPIC_API_KEY"
git log -p | grep -i "sk-ant"
```

---

## 검증 단계

### 단계 1: API 키 유효성 검사

#### A. 환경 변수 확인
```bash
# Linux/Mac
echo $ANTHROPIC_API_KEY

# Windows PowerShell
$env:ANTHROPIC_API_KEY

# Windows CMD
echo %ANTHROPIC_API_KEY%
```

**예상 출력:**
```
sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### B. 간단한 스크립트로 테스트

파일: `test-api-key.ts`
```typescript
import * as dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

// .env 파일 로드
dotenv.config();

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY가 설정되지 않았습니다!');
  process.exit(1);
}

console.log('✅ API 키가 로드되었습니다');
console.log(`   키 형식: ${apiKey.substring(0, 15)}...`);

const anthropic = new Anthropic({ apiKey });

async function testAPI() {
  try {
    console.log('\n🔍 API 연결 테스트 중...\n');

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'API 연결 테스트입니다. "성공"이라고만 대답해주세요.',
        },
      ],
    });

    const response = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log('✅ API 연결 성공!\n');
    console.log('Claude 응답:', response);
    console.log('\n📊 토큰 사용량:');
    console.log(`   Input: ${message.usage.input_tokens}`);
    console.log(`   Output: ${message.usage.output_tokens}`);
    console.log(`   합계: ${message.usage.input_tokens + message.usage.output_tokens}`);

  } catch (error: any) {
    console.error('❌ API 연결 실패!\n');
    console.error('오류:', error.message);

    // 오류 분석
    if (error.status === 401) {
      console.error('\n💡 해결책: API 키가 잘못되었습니다. 콘솔에서 확인하세요.');
    } else if (error.status === 429) {
      console.error('\n💡 해결책: Rate limit에 도달했습니다. 잠시 후 다시 시도하세요.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 해결책: 인터넷 연결을 확인하세요.');
    }

    process.exit(1);
  }
}

testAPI();
```

**실행:**
```bash
npx ts-node test-api-key.ts
```

#### C. Curl 명령어로 테스트 (선택사항)

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: sk-ant-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 100,
    "messages": [
      {"role": "user", "content": "테스트"}
    ]
  }'
```

**성공 응답 예시:**
```json
{
  "id": "msg_xxxxxxxxxxxxx",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "안녕하세요! 테스트 메시지입니다."
    }
  ],
  "model": "claude-3-5-sonnet-20241022",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 8,
    "output_tokens": 15
  }
}
```

---

### 단계 2: API 할당량 및 한도 확인

#### A. 콘솔에서 확인
1. https://console.anthropic.com/account/keys 접속
2. 좌측 메뉴에서 "Usage" 선택
3. 현재 월의 토큰 사용량 확인

**확인 항목:**
- 현재 월의 입력/출력 토큰 사용량
- API 호출 횟수
- 이전 달 통계

#### B. Rate Limit 정보
```markdown
기본 Rate Limit (무료 계정):
- 요청당 최대 토큰: 100,000
- 분당 최대 요청: 50개
- 시간당 최대 요청: 20,000개

프로 구독 (선택사항):
- 더 높은 한도
- 전담 지원
- 우선순위 처리
```

#### C. 스크립트에서 확인하기

토큰 사용량은 응답 객체에 포함됩니다:

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1000,
  messages: [{ role: 'user', content: 'Hi' }],
});

console.log('입력 토큰:', message.usage.input_tokens);
console.log('출력 토큰:', message.usage.output_tokens);
console.log('총 토큰:', message.usage.input_tokens + message.usage.output_tokens);
```

---

### 단계 3: 예제 Curl 명령어

#### A. 기본 메시지 생성
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Work Redesign Platform의 페르소나 시뮬레이션에 대해 설명해주세요."
      }
    ]
  }'
```

#### B. 시스템 프롬프트 포함
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "system": "당신은 업무 자동화 전문가입니다. 한국 기업의 상황을 이해하고 실무적인 조언을 제공합니다.",
    "messages": [
      {
        "role": "user",
        "content": "우리 마케팅팀의 반복 작업을 자동화하고 싶습니다. 어떻게 시작할까요?"
      }
    ]
  }'
```

#### C. 다중 턴 대화
```bash
# 1번째 요청
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Python으로 자동화 스크립트를 어떻게 짜나요?"}
    ]
  }' > response1.json

# 2번째 요청 (이전 응답 포함)
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Python으로 자동화 스크립트를 어떻게 짜나요?"},
      {"role": "assistant", "content": "[이전 응답 텍스트]"},
      {"role": "user", "content": "에러 핸들링은 어떻게 하나요?"}
    ]
  }'
```

---

## 비용 추정

### 모델 가격표 (2024년 11월 기준)

#### Claude 3.5 Sonnet (추천 모델)
```
입력 (Input):   $3.00 / 1M 토큰
출력 (Output): $15.00 / 1M 토큰

예시:
- 입력 1,000 토큰: $0.003
- 출력 1,000 토큰: $0.015
- 합계: $0.018 (약 25원)
```

#### Claude 3 Opus (고성능)
```
입력 (Input):   $15.00 / 1M 토큰
출력 (Output): $75.00 / 1M 토큰

예시:
- 입력 1,000 토큰: $0.015
- 출력 1,000 토큰: $0.075
- 합계: $0.09 (약 120원)
```

#### Claude 3 Haiku (경제적)
```
입력 (Input):   $0.25 / 1M 토큰
출력 (Output):  $1.25 / 1M 토큰

예시:
- 입력 1,000 토큰: $0.00025
- 출력 1,000 토큰: $0.00125
- 합계: $0.0015 (약 2원)
```

---

### 12개 페르소나 시뮬레이션 비용 추정

#### 페르소나당 토큰 사용량 분석

**페르소나 시뮬레이션 프롬프트:**
```
- 시스템 프롬프트: ~500 토큰
- 페르소나 정보: ~1,500 토큰
- 질문들: ~1,500 토큰
- 총 입력: ~3,500 토큰

평균 응답 길이: ~2,000-3,000 토큰
```

#### 비용 계산 (Claude 3.5 Sonnet 기준)

**1개 페르소나당:**
```
입력 토큰:  3,500 × ($3.00 / 1,000,000) = $0.0105
출력 토큰:  2,500 × ($15.00 / 1,000,000) = $0.0375
소계: $0.048 (약 65원)
```

**12개 페르소나 전체:**
```
입력:   3,500 × 12 × ($3.00 / 1,000,000) = $0.126
출력:   2,500 × 12 × ($15.00 / 1,000,000) = $0.45
합계: $0.576 (약 780원)
```

#### 다른 모델과의 비교

| 모델 | 12개 페르소나 예상 비용 | 비고 |
|------|----------------------|------|
| **Haiku** | ~$0.07 (약 95원) | ⭐ 가장 저렴, 간단한 작업에 적합 |
| **Sonnet** | ~$0.58 (약 780원) | ⭐⭐⭐ 추천 (가성비 최고) |
| **Opus** | ~$2.88 (약 3,900원) | ⭐⭐ 고성능 필요 시 |

---

### 비용 최적화 팁

#### 1️⃣ Haiku 모델 사용으로 비용 90% 절감

```typescript
// .env에서 모델 변경
ANTHROPIC_MODEL=claude-3-5-haiku-20241022  // 비용 90% 감소

// 코드에서 동적으로 설정
const model = process.env.NODE_ENV === 'production'
  ? 'claude-3-5-haiku-20241022'    // 프로덕션: 비용 우선
  : 'claude-3-5-sonnet-20241022';  // 개발: 성능 우선
```

#### 2️⃣ Prompt Caching으로 비용 90% 절감

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  system: [
    {
      type: "text",
      text: "당신은 업무 자동화 전문가입니다...",
      cache_control: { type: "ephemeral" }  // 캐싱 활성화
    }
  ],
  messages: [
    { role: "user", content: "..." }
  ]
});
```

**캐싱 효과:**
- 첫 요청: 3,500 입력 토큰 요금 청구
- 2-100번째 요청: 3,500 입력 토큰의 10%만 청구 (350 토큰)
- 연속 12개 페르소나: 약 70% 비용 절감

#### 3️⃣ 배치 처리로 Rate Limit 활용

```typescript
// ❌ 이전: 순차 처리 (느림)
for (const persona of personas) {
  const result = await runPersonaSimulation(persona);
  await sleep(1000); // 1초 대기
}

// ✅ 개선: 병렬 처리 (3개씩, 빠름)
const chunk = 3;
for (let i = 0; i < personas.length; i += chunk) {
  const batch = personas.slice(i, i + chunk);
  await Promise.all(batch.map(p => runPersonaSimulation(p)));
  await sleep(1000); // 배치 사이 대기
}
```

#### 4️⃣ 불필요한 토큰 제거

```typescript
// ❌ 이전: 모든 정보 포함
const prompt = `
당신은 ${persona.name}입니다.
배경: ${persona.background}
고민: ${persona.painPoints.join('\n')}
기대: ${persona.expectations.join('\n')}
우려: ${persona.concerns.join('\n')}
...
`;

// ✅ 개선: 필수 정보만 포함
const prompt = `
당신은 ${persona.name} (${persona.jobFunction})입니다.
고민: 반복 작업 자동화
질문: 워크샵 경험 평가
`;
```

---

### 월간 예산 계획 예시

```markdown
## 월간 비용 추정 (전체 시뮬레이션 기준)

### 시나리오 1: Sonnet 모델 (권장)
- 일 1회 실행: 780원 × 30일 = 23,400원
- 주 2회 실행: 780원 × 8주 = 6,240원
- 월 1회 실행: 780원 = 780원

### 시나리오 2: Haiku 모델 (경제적)
- 일 1회 실행: 95원 × 30일 = 2,850원
- 주 2회 실행: 95원 × 8주 = 760원
- 월 1회 실행: 95원 = 95원

### 시나리오 3: 캐싱 + Sonnet (최적화)
- 첫 실행: 780원
- 2-30회 추가 실행: 780원 × 0.3 × 29 = 6,786원
- 월 총합: ~7,566원
```

---

## 일반적인 오류 및 해결책

### 401 인증 오류 (Authentication Error)

#### 증상
```
Error: 401 Unauthorized
"message": "Invalid API Key"
```

#### 원인 및 해결책

| 원인 | 해결책 |
|------|--------|
| 1. API 키가 설정되지 않음 | `echo $ANTHROPIC_API_KEY` 확인 |
| 2. API 키 형식 오류 | 키가 `sk-ant-v1-`로 시작하는지 확인 |
| 3. API 키가 만료됨 | 콘솔에서 새 키 생성 |
| 4. API 키가 삭제됨 | 콘솔에서 새 키 생성 |
| 5. 타이핑 실수 | 키를 다시 복사-붙여넣기 |

#### 단계별 해결 절차

```bash
# 1단계: API 키 확인
echo $ANTHROPIC_API_KEY

# 출력 예시: sk-ant-v1-xxxxxxxxxxxxx...
# 만약 비어있으면:
export ANTHROPIC_API_KEY="your-key-here"

# 2단계: .env 파일 확인
grep ANTHROPIC_API_KEY .env

# 3단계: 콘솔에서 API 키 상태 확인
# https://console.anthropic.com/account/keys
# - 키가 Active 상태인지 확인
# - 필요시 새 키 생성

# 4단계: 테스트 다시 실행
npx ts-node test-api-key.ts
```

#### 코드 예시

```typescript
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error(
    'ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다. ' +
    'https://console.anthropic.com/account/keys 에서 API 키를 생성하고, ' +
    'export ANTHROPIC_API_KEY="sk-ant-..." 로 설정해주세요.'
  );
}

if (!apiKey.startsWith('sk-ant-')) {
  throw new Error(
    'API 키 형식이 잘못되었습니다. ' +
    'sk-ant-v1-로 시작해야 합니다.'
  );
}

const anthropic = new Anthropic({ apiKey });
```

---

### 404 모델을 찾을 수 없음 (Model Not Found)

#### 증상
```
Error: 404 Model Not Found
"message": "Could not find model: claude-3-5-sonnet-xxxxx"
```

#### 원인 및 해결책

| 원인 | 해결책 |
|------|--------|
| 1. 모델 이름 오타 | 정확한 모델명 확인 |
| 2. 구형 모델 사용 | 최신 모델로 업데이트 |
| 3. 모델이 아직 활성화 안 됨 | 며칠 후 다시 시도 |

#### 사용 가능한 모델 목록

```bash
# 최신 모델 (권장)
claude-3-5-sonnet-20241022    # 가성비 최고
claude-3-5-haiku-20241022     # 가장 빠르고 저렴
claude-3-opus-20250219        # 고성능

# 이전 버전 (비추천)
claude-3-sonnet-20240229      # ❌ 더 이상 권장 안 함
claude-3-haiku-20240307       # ❌ 더 이상 권장 안 함
```

#### 수정 방법

```typescript
// ❌ 틀린 예
ANTHROPIC_MODEL=claude-3-5-sonnet-latest  // 존재하지 않음
ANTHROPIC_MODEL=claude-3.5-sonnet         // 형식 오류
ANTHROPIC_MODEL=sonnet-3.5-20241022       // 순서 오류

// ✅ 올바른 예
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
ANTHROPIC_MODEL=claude-3-opus-20250219
```

```bash
# .env 파일 수정
sed -i '' 's/ANTHROPIC_MODEL=.*/ANTHROPIC_MODEL=claude-3-5-sonnet-20241022/' .env

# 확인
grep ANTHROPIC_MODEL .env
```

---

### 429 Rate Limit 초과

#### 증상
```
Error: 429 Too Many Requests
"message": "Rate limit exceeded"
```

#### 원인 및 해결책

| 원인 | 해결책 |
|------|--------|
| 1. 너무 빠른 요청 | 요청 사이에 대기 시간 추가 |
| 2. 병렬 요청 과다 | 순차 처리로 변경 |
| 3. 토큰 한도 초과 | max_tokens 감소 |
| 4. API 구독 플랜 업그레이드 필요 | Pro 플랜 검토 |

#### 수정 방법

```typescript
// ❌ 이전: 너무 빠른 요청
for (const persona of personas) {
  const result = await runPersonaSimulation(persona);
  // 대기 없음 - Rate limit 위반!
}

// ✅ 개선: 요청 사이 대기
for (const persona of personas) {
  const result = await runPersonaSimulation(persona);

  // 1초 대기
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// ✅ 더 나은 방법: 지수 백오프
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429) {
        const delayMs = Math.pow(2, i) * 1000; // 1초, 2초, 4초...
        console.log(`Rate limit, ${delayMs}ms 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
}

// 사용
const result = await retryWithBackoff(
  () => runPersonaSimulation(persona)
);
```

---

### 네트워크 타임아웃 (Network Timeout)

#### 증상
```
Error: ECONNREFUSED or ETIMEDOUT
Could not connect to api.anthropic.com
```

#### 원인 및 해결책

| 원인 | 해결책 |
|------|--------|
| 1. 인터넷 연결 불안정 | WiFi 재연결, 이더넷 사용 |
| 2. 방화벽 차단 | 방화벽 설정 확인 |
| 3. VPN 문제 | VPN 끄기 또는 다른 서버로 |
| 4. 요청 타임아웃 너무 짧음 | timeout 값 증가 |

#### 진단 명령어

```bash
# 1. 인터넷 연결 확인
ping -c 3 8.8.8.8

# 2. DNS 확인
nslookup api.anthropic.com

# 3. API 서버 연결 확인
curl -I https://api.anthropic.com

# 4. 경로 추적
traceroute api.anthropic.com  # Linux/Mac
tracert api.anthropic.com     # Windows
```

#### 타임아웃 설정 증가

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 60 * 1000,  // 60초 (기본값: 10초)
  maxRetries: 3,       // 최대 3회 재시도
});
```

---

### 기타 오류

#### 토큰 한도 초과
```
Error: Prompt is too long
"message": "This model's maximum context length is X tokens"

해결책:
1. 프롬프트 길이 단축
2. max_tokens 값 감소
3. 더 큰 모델 사용
```

#### 메모리 부족
```
Error: JavaScript heap out of memory

해결책:
1. Node 메모리 제한 증가
   node --max-old-space-size=4096 script.js
2. 배치 크기 감소
3. 동시 요청 수 제한
```

---

## 대체 실행 방법

### 방법 1️⃣: 환경 변수로 스크립트 실행

#### Linux/Mac
```bash
# 방법 A: 한 줄 명령어
ANTHROPIC_API_KEY=sk-ant-v1-... npx ts-node scripts/persona-simulation.ts

# 방법 B: .env 파일 + 명령어
export $(cat .env | grep -v '#' | xargs)
npx ts-node scripts/persona-simulation.ts

# 방법 C: dotenv 사용
npx dotenv -e .env npx ts-node scripts/persona-simulation.ts
```

#### Windows
```powershell
# PowerShell
$env:ANTHROPIC_API_KEY="sk-ant-v1-..."
npx ts-node scripts/persona-simulation.ts

# 또는
(Get-Content .env | Select-String "^ANTHROPIC_API_KEY=" | ForEach-Object { $_ -split '=' })[1] | Set-Variable -Name api_key
$env:ANTHROPIC_API_KEY = $api_key
npx ts-node scripts/persona-simulation.ts
```

---

### 방법 2️⃣: 다양한 모델로 실행 비교

```bash
# Haiku로 빠르게 테스트 (비용 90% 절감)
ANTHROPIC_MODEL=claude-3-5-haiku-20241022 \
npm run simulate

# Sonnet으로 프로덕션 실행 (균형잡힌 성능)
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022 \
npm run simulate

# Opus로 최고 품질 (비용 5배)
ANTHROPIC_MODEL=claude-3-opus-20250219 \
npm run simulate
```

**모델별 특성:**
```
Haiku:  빠름, 저비용, 단순 작업 최적
Sonnet: 균형잡힘, 가성비 최고, 대부분의 작업 권장
Opus:   최고 성능, 복잡한 분석 필요 시
```

---

### 방법 3️⃣: 배치 처리 vs 순차 처리

#### A. 순차 처리 (안전, 느림)

```typescript
async function runSequential(personas) {
  const results = [];

  for (const persona of personas) {
    console.log(`실행 중: ${persona.name}`);
    const result = await runPersonaSimulation(persona);
    results.push(result);

    // Rate limit 방지를 위해 1초 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

// 소요 시간: 12 페르소나 × (30초 + 1초 대기) ≈ 6분
```

#### B. 배치 처리 (빠름, 조정 필요)

```typescript
async function runBatch(personas, batchSize = 3) {
  const results = [];

  for (let i = 0; i < personas.length; i += batchSize) {
    const batch = personas.slice(i, i + batchSize);

    console.log(`배치 ${i / batchSize + 1} 실행 (${batch.map(p => p.name).join(', ')})`);

    // 배치 내 요청 병렬 실행
    const batchResults = await Promise.all(
      batch.map(persona => runPersonaSimulation(persona))
    );

    results.push(...batchResults);

    // 배치 사이 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

// 소요 시간: 4 배치 × (30초 + 1초 대기) ≈ 2분 (3배 빠름!)
```

#### C. 적응형 처리 (최적화)

```typescript
async function runAdaptive(personas) {
  const results = [];
  let failureCount = 0;

  for (const persona of personas) {
    try {
      const result = await runPersonaSimulation(persona);
      results.push(result);

      // 성공 시: 대기 시간 단축
      await new Promise(resolve => setTimeout(resolve, 500));
      failureCount = 0;

    } catch (error: any) {
      if (error.status === 429) {
        // Rate limit: 지수 백오프
        const delayMs = Math.pow(2, failureCount) * 1000;
        console.log(`Rate limit, ${delayMs}ms 대기...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        failureCount++;
      } else {
        throw error;
      }
    }
  }

  return results;
}
```

---

### 방법 4️⃣: Docker 환경에서 실행

#### Dockerfile 예시

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 의존성 복사 및 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# TypeScript 컴파일
RUN npm run build

# API 키를 환경 변수로 전달
# docker run -e ANTHROPIC_API_KEY=sk-ant-... ...

# 페르소나 시뮬레이션 실행
CMD ["node", "dist/scripts/persona-simulation.js"]
```

#### 실행 명령어

```bash
# 이미지 빌드
docker build -t work-redesign:latest .

# 컨테이너 실행
docker run \
  -e ANTHROPIC_API_KEY=sk-ant-v1-xxxxxxxxxxxx \
  -e ANTHROPIC_MODEL=claude-3-5-sonnet-20241022 \
  -v $(pwd)/results:/app/results \
  work-redesign:latest

# Docker Compose 사용
docker-compose up --build
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  persona-simulator:
    build: .
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      ANTHROPIC_MODEL: ${ANTHROPIC_MODEL:-claude-3-5-sonnet-20241022}
      NODE_ENV: production
    volumes:
      - ./results:/app/results
    restart: on-failure
```

---

## 문제 해결 체크리스트

### 빠른 진단 (5분)

```bash
# 1. Node.js 설치 확인
node --version  # v18 이상 필요

# 2. npm 설치 확인
npm --version   # 9.0 이상 권장

# 3. 의존성 설치
npm install

# 4. API 키 확인
echo $ANTHROPIC_API_KEY

# 5. .env 파일 확인
cat .env | grep ANTHROPIC_API_KEY

# 6. 간단한 테스트
npx ts-node test-api-key.ts
```

---

### 단계별 디버깅 가이드

#### 문제: "ANTHROPIC_API_KEY가 설정되지 않음"

```bash
# Step 1: 환경 변수 확인
echo $ANTHROPIC_API_KEY
# 결과가 비어있으면 → Step 2로

# Step 2: .env 파일 확인
cat .env | grep ANTHROPIC_API_KEY
# ANTHROPIC_API_KEY=sk-ant-v1-... 있는지 확인

# Step 3: 경로 확인
pwd
ls -la .env

# Step 4: 파일 로딩 확인
node -e "require('dotenv').config(); console.log(process.env.ANTHROPIC_API_KEY)"

# Step 5: 터미널 재시작 및 재시도
# (또는 새 터미널 창 열기)
```

#### 문제: "401 Unauthorized"

```bash
# Step 1: 키 형식 확인
echo $ANTHROPIC_API_KEY | cut -c1-20
# 결과: sk-ant-v1-... 이어야 함

# Step 2: 키 길이 확인
echo $ANTHROPIC_API_KEY | wc -c
# 일반적으로 100자 이상

# Step 3: 특수 문자 확인
echo $ANTHROPIC_API_KEY | od -c | head -5
# 공백이나 개행 문자 있는지 확인

# Step 4: 콘솔에서 키 재생성
# https://console.anthropic.com/account/keys
# → 기존 키 삭제
# → 새 키 생성
# → 터미널에서 다시 설정

# Step 5: 캐시 제거 후 재시도
npm cache clean --force
npm install
```

#### 문제: "429 Rate Limit"

```bash
# Step 1: 현재 요청 속도 확인
# 로그를 보고 요청 간 시간 확인

# Step 2: 대기 시간 증가
# 코드에서 setTimeout 값을 1000ms → 2000ms로

# Step 3: 병렬 요청 제거
# Promise.all 제거, 순차 처리로 변경

# Step 4: API 사용량 확인
# https://console.anthropic.com/account/usage

# Step 5: 배치 크기 감소
# batchSize: 3 → 1
```

---

### 상세 로깅 활성화

#### A. 환경 변수로 활성화

```bash
# DEBUG 모드
DEBUG=* npm run simulate

# Verbose 로깅
LOG_LEVEL=debug npm run simulate

# 특정 모듈만 로깅
DEBUG=anthropic:* npm run simulate
```

#### B. 코드에서 로깅 추가

```typescript
import * as dotenv from 'dotenv';
dotenv.config();

// API 키 로깅 (마지막 8글자만 표시)
const apiKey = process.env.ANTHROPIC_API_KEY;
const maskedKey = apiKey
  ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 8)}`
  : 'NOT SET';
console.log(`API Key: ${maskedKey}`);

// 모델 로깅
console.log(`Model: ${process.env.ANTHROPIC_MODEL}`);

// 요청 로깅
const anthropic = new Anthropic({ apiKey });

// 요청 전 로깅
console.log('📤 Sending request...');
console.log(`   Model: claude-3-5-sonnet`);
console.log(`   Input tokens: 3500`);
console.log(`   Max output: 8000`);

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 8000,
  messages: [{ role: 'user', content: 'test' }],
});

// 응답 로깅
console.log('📥 Received response');
console.log(`   Output tokens: ${message.usage.output_tokens}`);
console.log(`   Total tokens: ${message.usage.input_tokens + message.usage.output_tokens}`);
console.log(`   Stop reason: ${message.stop_reason}`);
```

#### C. 파일에 로그 저장

```typescript
import * as fs from 'fs';

function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync('api-debug.log', logEntry);
  console.log(message);
}

logToFile('API 시뮬레이션 시작');
logToFile(`API Key: ${maskedKey}`);
logToFile(`Model: ${process.env.ANTHROPIC_MODEL}`);

try {
  const message = await anthropic.messages.create({...});
  logToFile(`✅ 성공: ${message.usage.output_tokens} 토큰 사용`);
} catch (error) {
  logToFile(`❌ 오류: ${error.message}`);
}
```

---

### 로그 파일 위치

```bash
# 일반 로그
logs/api.log
logs/simulation.log

# 에러 로그
logs/error.log

# 디버그 로그
logs/debug.log

# 최근 로그 보기
tail -f logs/simulation.log

# 에러만 필터링
grep ERROR logs/api.log

# 특정 시간대 로그
grep "2024-11-22" logs/api.log
```

---

### 성능 모니터링

```typescript
// 소요 시간 측정
const startTime = Date.now();

try {
  const message = await anthropic.messages.create({...});
  const endTime = Date.now();

  console.log(`
  ⏱️  성능 통계:
  - 소요 시간: ${endTime - startTime}ms
  - 입력 토큰: ${message.usage.input_tokens}
  - 출력 토큰: ${message.usage.output_tokens}
  - 토큰/초: ${(message.usage.output_tokens / (endTime - startTime) * 1000).toFixed(2)}
  `);
} catch (error) {
  console.error(`실패: ${error.message}`);
}
```

---

## 추가 리소스

### 공식 문서
- [Anthropic API 문서](https://docs.anthropic.com)
- [Claude API 레퍼런스](https://docs.anthropic.com/reference)
- [Console 사용 가이드](https://console.anthropic.com)

### 커뮤니티
- [Anthropic Discord](https://discord.gg/anthropic)
- [GitHub Issues](https://github.com/anthropics/anthropic-sdk-python/issues)

### 업데이트 확인
```bash
# 최신 SDK 버전 확인
npm view @anthropic-ai/sdk@latest version

# 업데이트
npm install @anthropic-ai/sdk@latest
```

---

## 요약

### ✅ 체크리스트
- [ ] API 키 발급받았나요?
- [ ] API 키를 환경 변수 또는 .env에 설정했나요?
- [ ] `npx ts-node test-api-key.ts`로 테스트했나요?
- [ ] 비용 추정을 검토했나요?
- [ ] 에러 해결책을 이해했나요?

### 🚀 다음 단계
1. 페르소나 시뮬레이션 실행
2. 결과 분석
3. 비용 및 성능 모니터링
4. 필요시 모델/파라미터 조정

### 📞 문제 발생 시
1. 이 가이드의 해당 섹션 참고
2. 로그 파일 확인
3. 공식 문서 확인
4. 콘솔에서 API 키 상태 확인

---

**마지막 업데이트:** 2024년 11월 22일
**문서 버전:** 1.0
**대상 SDK:** @anthropic-ai/sdk >= 0.12.0
