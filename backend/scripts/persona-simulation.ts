#!/usr/bin/env ts-node

/**
 * AI 페르소나 시뮬레이션 스크립트
 *
 * 12개 페르소나가 Work Redesign 워크샵을 경험하는 과정을 시뮬레이션합니다.
 * Claude API를 사용해 각 페르소나의 관점에서 워크샵 플로우를 평가합니다.
 */

import * as dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '../.env') });

// API 키 유효성 검사
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey || apiKey === 'sk-ant-api-your-key-here') {
  console.error('\n❌ ANTHROPIC_API_KEY가 설정되지 않았습니다!\n');
  console.error('다음 중 하나의 방법으로 API 키를 설정해주세요:\n');
  console.error('1. backend/.env 파일에 ANTHROPIC_API_KEY 설정');
  console.error('   ANTHROPIC_API_KEY=sk-ant-api-...\n');
  console.error('2. 환경 변수로 직접 전달');
  console.error('   ANTHROPIC_API_KEY=sk-ant-api-... npx ts-node scripts/persona-simulation.ts\n');
  console.error('API 키 발급: https://console.anthropic.com/account/keys\n');
  process.exit(1);
}

// Anthropic API 클라이언트 초기화
const anthropic = new Anthropic({
  apiKey,
});

// 페르소나 정의 (팀장 관점)
interface Persona {
  id: string;
  name: string;
  role: string; // 팀장 역할
  jobFunction: string;
  teamDigitalMaturity: string; // 팀의 AI/자동화 성숙도
  age: number;
  experience: number; // 경력
  teamContext: {
    teamSize: number; // 팀 규모
    teamComposition: string; // 팀 구성원 특성
    currentWorkStyle: string; // 현재 업무 방식
    toolsUsed: string[]; // 현재 사용 중인 도구
    automationExperience: string; // 자동화 경험 수준
  };
  painPoints: string[]; // 팀장 관점의 고민
  expectations: string[]; // 워크샵 기대사항
  concerns: string[]; // 우려사항
}

const personas: Persona[] = [
  // 마케팅 직군
  {
    id: 'P1',
    name: '김영희',
    role: '마케팅팀 팀장',
    jobFunction: '마케팅',
    teamDigitalMaturity: '초보',
    age: 37,
    experience: 15,
    teamContext: {
      teamSize: 5,
      teamComposition: '40대 중반 2명, 30대 초반 2명 - 대부분 전통 마케팅 경험자',
      currentWorkStyle: 'Excel/PPT 중심 수작업, 이메일로 파일 주고받기, 오프라인 회의',
      toolsUsed: ['Excel', 'PowerPoint', 'Email', '카카오톡'],
      automationExperience: '없음. "AI는 IT팀이나 쓰는 것"이라고 생각함',
    },
    painPoints: [
      '팀원들이 매달 같은 형식의 캠페인 보고서를 각자 수작업으로 작성',
      '성과 데이터를 각자 Excel에 따로 관리해서 팀장이 직접 취합해야 함',
      '팀원 중 나이 많은 분들은 새 도구 배우는 것을 부담스러워함',
      '반복 작업이 많아 팀원들 야근이 잦고 실수도 많음'
    ],
    expectations: [
      '팀원들도 쉽게 따라할 수 있는 자동화 방법이 있다면',
      '복잡한 코딩 없이 클릭 몇 번으로 가능하면 좋겠음',
      '35분 안에 우리 팀에 맞는 구체적인 플랜을 얻을 수 있을까?'
    ],
    concerns: [
      '팀원들이 "또 새로운 거 배워야 해?"라고 저항하지 않을까?',
      '도입했다가 실패하면 팀 분위기가 더 나빠질까 봐 걱정',
      'AI/자동화가 정말 우리 같은 전통 마케팅 팀에도 도움이 될까?'
    ]
  },
  {
    id: 'P2',
    name: '이민수',
    role: '디지털마케팅팀 팀장',
    jobFunction: '마케팅',
    teamDigitalMaturity: '중급',
    age: 32,
    experience: 7,
    teamContext: {
      teamSize: 6,
      teamComposition: '20대 후반~30대 초반, 디지털 네이티브 세대',
      currentWorkStyle: 'GA4/Meta Ads/Notion 활용, 일부 Zapier 자동화 시도',
      toolsUsed: ['Google Analytics', 'Meta Ads', 'Notion', 'Slack', 'Zapier', 'Google Sheets'],
      automationExperience: '일부 마케터가 Zapier로 간단한 자동화 구축, 하지만 체계적이지 않음',
    },
    painPoints: [
      '팀원마다 사용하는 도구와 자동화 방식이 달라 통합이 어려움',
      '데이터는 많이 모으는데 인사이트 도출은 여전히 수작업',
      'ChatGPT 활용은 개인적으로 하지만 팀 차원의 AI 활용 전략이 없음',
      '자동화 시도는 하지만 누가 떠나면 유지보수가 안 됨'
    ],
    expectations: [
      '팀 전체가 일관되게 사용할 수 있는 자동화 워크플로우',
      'AI가 우리 비즈니스 데이터를 분석해서 인사이트를 자동으로 제공',
      '팀원들의 산발적인 자동화를 체계화하고 싶음'
    ],
    concerns: [
      '팀원들의 디지털 수준이 제각각인데 모두 따라올 수 있을까?',
      '기존에 각자 만든 자동화 도구들과 충돌하지 않을까?',
      'AI 추천이 우리 산업/비즈니스 맥락을 제대로 이해할까?'
    ]
  },
  {
    id: 'P3',
    name: '박지원',
    jobFunction: '마케팅',
    digitalMaturity: '고급',
    age: 29,
    background: '마케팅 애널리스트, 4년차, Python/SQL/Tableau 사용',
    painPoints: [
      '분석 자동화 코드 짜는 시간이 실제 분석 시간보다 김',
      '반복 작업 자동화를 위한 도구 선택이 어려움'
    ],
    expectations: [
      'No-code로 자동화 파이프라인을 만들 수 있을까?',
      'AI가 최적의 자동화 아키텍처를 제안해줄까?'
    ],
    concerns: [
      '기술적으로 너무 단순하진 않을까?',
      '커스터마이징 여지가 있을까?'
    ]
  },

  // 제조 직군
  {
    id: 'P4',
    name: '최현진',
    jobFunction: '제조',
    digitalMaturity: '초보',
    age: 45,
    background: '공정 관리자, 20년차, 현장 중심 업무',
    painPoints: [
      '생산 일보를 손으로 작성해서 집계',
      '불량률 추이를 보려면 엑셀에 일일이 입력'
    ],
    expectations: [
      '현장 데이터 입력만 하면 자동으로 리포트가 나왔으면',
      'PC 앞에 앉지 않아도 스마트폰으로 확인 가능하면'
    ],
    concerns: [
      '현장 용어를 AI가 이해할까?',
      '제조 특성상 보안이 중요한데 괜찮을까?'
    ]
  },
  {
    id: 'P5',
    name: '박철수',
    jobFunction: '제조',
    digitalMaturity: '중급',
    age: 42,
    background: '스마트팩토리 매니저, 12년차, MES/PLC 운영',
    painPoints: [
      '데이터는 많은데 시스템이 제각각이라 통합이 어려움',
      '이상 감지는 되는데 원인 분석까지는 수작업'
    ],
    expectations: [
      'AI가 설비 데이터 패턴을 분석해서 예지보전 시점을 알려주면',
      '시스템 간 데이터 통합 자동화 방법을 제안받고 싶음'
    ],
    concerns: [
      'AI 분석 결과를 현장에서 신뢰할 수 있을까?',
      '실시간 데이터 처리가 가능할까?'
    ]
  },
  {
    id: 'P6',
    name: '김태영',
    jobFunction: '제조',
    digitalMaturity: '고급',
    age: 38,
    background: '생산기술 전문가, 10년차, Python/PLC/SCADA 전문',
    painPoints: [
      '공정 최적화 알고리즘을 직접 개발하는 데 시간이 너무 오래 걸림',
      '여러 설비의 데이터 포맷이 달라 전처리에 시간 소모'
    ],
    expectations: [
      'AI가 공정 최적화 로직을 제안해주면',
      '데이터 파이프라인 구축을 가이드 받을 수 있으면'
    ],
    concerns: [
      '제조 도메인 전문성이 충분할까?',
      'Edge computing 환경도 고려할까?'
    ]
  },

  // R&D 직군
  {
    id: 'P7',
    name: '김수연',
    jobFunction: 'R&D',
    digitalMaturity: '초보',
    age: 35,
    background: '실험 중심 연구원, 8년차, 실험 데이터는 수기 노트',
    painPoints: [
      '실험 결과를 일일이 엑셀에 옮겨 적음',
      '과거 실험 데이터를 찾는 게 어려움'
    ],
    expectations: [
      '실험 데이터 자동 기록 시스템이 있으면',
      'AI가 유사한 과거 실험을 찾아주면'
    ],
    concerns: [
      '실험은 자동화 어렵다고 생각해왔는데 정말 가능할까?',
      '우리 연구 분야를 AI가 이해할까?'
    ]
  },
  {
    id: 'P8',
    name: '이준호',
    jobFunction: 'R&D',
    digitalMaturity: '중급',
    age: 33,
    background: '시뮬레이션 엔지니어, 6년차, MATLAB/ANSYS 사용',
    painPoints: [
      '시뮬레이션 조건 설정을 매번 수작업',
      '결과 후처리 스크립트를 반복해서 수정'
    ],
    expectations: [
      '시뮬레이션 파라미터 최적화 자동화',
      '결과 분석 자동화 워크플로우'
    ],
    concerns: [
      'CAE 도구와 연동이 가능할까?',
      '우리 업무 특성상 복잡도가 높은데 35분 안에 이해할 수 있을까?'
    ]
  },
  {
    id: 'P9',
    name: '정다은',
    jobFunction: 'R&D',
    digitalMaturity: '고급',
    age: 31,
    background: '알고리즘 개발자, 5년차, Python/PyTorch/Docker 전문',
    painPoints: [
      'ML 모델 학습 파이프라인을 매번 처음부터 구축',
      '실험 관리와 버전 관리가 복잡함'
    ],
    expectations: [
      'MLOps 자동화 가이드',
      'AI가 최적의 실험 설계를 제안해주면'
    ],
    concerns: [
      '우리는 이미 충분히 자동화되어 있는데 더 배울 게 있을까?',
      '워크샵이 너무 기초적이진 않을까?'
    ]
  },

  // Staff 직군
  {
    id: 'P10',
    name: '윤서영',
    jobFunction: 'Staff',
    digitalMaturity: '초보',
    age: 40,
    background: 'HR 담당자, 12년차, 인사시스템 기본 기능만 사용',
    painPoints: [
      '월별 인력 현황 보고서 작성이 반복 작업',
      '퇴직률 분석을 엑셀로 수작업'
    ],
    expectations: [
      '보고서 자동 생성',
      '이직 위험 직원 조기 파악'
    ],
    concerns: [
      '개인정보 처리가 안전할까?',
      'HR 업무는 자동화하기 어렵다고 생각했는데...'
    ]
  },
  {
    id: 'P11',
    name: '강민철',
    jobFunction: 'Staff',
    digitalMaturity: '중급',
    age: 36,
    background: '재무 담당자, 9년차, ERP/Excel/매크로 활용',
    painPoints: [
      '월마감 시 여러 시스템에서 데이터 수집',
      '예산 대비 실적 분석 리포트를 매번 수작업'
    ],
    expectations: [
      'ERP 데이터 자동 통합',
      'AI 기반 예산 편차 분석'
    ],
    concerns: [
      '재무 데이터 정확성이 최우선인데 AI가 실수하진 않을까?',
      'ERP 시스템과 연동이 가능할까?'
    ]
  },
  {
    id: 'P12',
    name: '서하은',
    jobFunction: 'Staff',
    digitalMaturity: '고급',
    age: 32,
    background: '데이터 분석가, 5년차, Python/SQL/BI 도구 전문',
    painPoints: [
      '각 부서 요청 리포트를 일일이 맞춤 제작',
      '데이터 파이프라인 유지보수에 시간 소모'
    ],
    expectations: [
      '셀프 서비스 BI 구축 가이드',
      'AI 기반 자동 인사이트 도출'
    ],
    concerns: [
      '드디어 Staff 업무용 자동화 도구!',
      '기술적으로 충분히 깊이 있을까?'
    ]
  }
];

// 워크샵 단계별 시뮬레이션 프롬프트 생성
function generateWorkshopPrompt(persona: Persona): string {
  return `당신은 "${persona.name}" (${persona.age}세, ${persona.jobFunction} ${persona.digitalMaturity} 수준)입니다.

# 당신의 배경
${persona.background}

# 당신의 고민 (Pain Points)
${persona.painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

# 당신의 기대사항
${persona.expectations.map((e, i) => `${i + 1}. ${e}`).join('\n')}

# 당신의 우려사항
${persona.concerns.map((c, i) => `${i + 1}. ${c}`).join('\n')}

---

이제 당신은 "Work Redesign Platform" 워크샵에 참여합니다. 이 워크샵은 35분 동안 진행되며, AI를 활용해 반복 업무를 자동화하는 방법을 배우고 실제 자동화 계획을 수립하는 과정입니다.

워크샵은 다음 단계로 진행됩니다:

**Step 1-2: 시작 및 도메인 선택 (5분)**
- 워크샵 소개 및 목표 설명
- 자신의 업무 도메인 선택 (마케팅/제조/R&D/Staff)

**Step 3: 수작업 입력 (5분)**
- 현재 반복적으로 수작업하는 업무 3-5개 입력
- 각 업무의 소요 시간, 빈도, 어려움 등 상세 기록

**Step 4: AI 작업 추출 (7분)**
- AI가 입력한 수작업을 분석하여 자동화 가능한 세부 작업으로 분해
- 각 작업의 자동화 난이도, 예상 효과 등을 평가

**Step 5: AI 컨설팅 (8분)**
- 추출된 작업 중 하나를 선택하여 AI와 1:1 대화
- 자동화 방법, 필요한 도구, 구현 방법 등을 질문하고 답변 받음

**Step 6: 워크플로우 디자인 (7분)**
- AI가 제안한 내용을 바탕으로 자동화 워크플로우 시각화
- 단계별 실행 계획 수립

**Step 7: 결과 확인 및 다음 단계 (3분)**
- 워크샵 결과물 확인 (자동화 계획서, 워크플로우 다이어그램)
- 실제 구현을 위한 다음 단계 안내

---

**당신의 페르소나를 유지하면서** 이 워크샵을 경험한다고 상상하고, 다음 질문에 답변해주세요:

## 1. 도메인 선택 (Step 1-2)
워크샵 소개를 들었을 때 첫인상은 어땠나요? 자신의 업무 도메인(${persona.jobFunction})을 선택할 때 어떤 생각이 들었나요?

## 2. 수작업 입력 (Step 3)
현재 수작업하는 업무를 입력하라고 할 때:
- 어떤 업무들이 떠올랐나요? (구체적으로 3-5개 나열)
- 이 과정이 쉬웠나요, 어려웠나요? 왜 그런가요?
- 5분이라는 시간이 충분했나요?

## 3. AI 작업 추출 (Step 4)
AI가 당신이 입력한 수작업을 분석해서 자동화 가능한 세부 작업으로 쪼개주었습니다:
- AI의 분석 결과가 당신의 실제 업무를 잘 이해했다고 느꼈나요?
- 제안된 자동화 방법이 실현 가능해 보였나요?
- 놀라웠거나 유용했던 인사이트가 있었나요?
- 어떤 점이 부족하거나 아쉬웠나요?

## 4. AI 컨설팅 (Step 5)
AI와 1:1 대화를 통해 자동화 방법을 상담받았습니다:
- AI에게 어떤 질문을 했나요? (구체적으로 3-4개)
- AI의 답변이 도움이 되었나요? 구체적으로 어떤 부분이 좋았나요?
- AI가 이해하지 못한 부분이 있었나요?
- 이 과정에서 불편했거나 개선이 필요한 점은?

## 5. 워크플로우 디자인 (Step 6)
자동화 워크플로우를 시각적으로 설계하는 단계입니다:
- 제안된 워크플로우가 당신의 업무 프로세스에 맞았나요?
- 이 워크플로우를 실제로 구현할 수 있을 것 같나요?
- 난이도가 적절했나요? (너무 쉽거나 너무 어렵지 않았나요?)

## 6. 전체 경험 평가
워크샵을 끝까지 완료한 후:
- 전체적인 만족도는? (1-10점, 이유 포함)
- 가장 유용했던 단계는? 왜 그런가요?
- 가장 어려웠던 단계는? 왜 그런가요?
- 35분이라는 시간이 적절했나요?
- 실제로 이 워크샵 결과를 바탕으로 자동화를 시도해볼 의향이 있나요?
- 동료에게 이 워크샵을 추천하겠습니까? (NPS 0-10점)

## 7. 개선 제안
당신의 관점에서 이 워크샵을 개선하려면:
- UI/UX 측면에서 개선이 필요한 점은?
- 콘텐츠 측면에서 추가되었으면 하는 내용은?
- 당신과 같은 디지털 수준(${persona.digitalMaturity})의 사람들을 위한 특별한 고려사항은?
- 당신의 직무(${persona.jobFunction})에 특화된 기능이 필요한가요?

---

**중요**: 당신의 페르소나(배경, 디지털 수준, 고민, 기대, 우려)를 일관되게 유지하면서 답변해주세요. 실제로 이 사람이라면 어떻게 느끼고 반응할지 구체적이고 현실적으로 작성해주세요.`;
}

// AI 시뮬레이션 실행
async function runPersonaSimulation(persona: Persona): Promise<any> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎭 페르소나 시뮬레이션 시작: ${persona.name} (${persona.id})`);
  console.log(`   직무: ${persona.jobFunction} | 디지털 수준: ${persona.digitalMaturity}`);
  console.log(`${'='.repeat(60)}\n`);

  const prompt = generateWorkshopPrompt(persona);

  try {
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      temperature: 0.7, // 페르소나 다양성을 위해 약간 높은 temperature
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log(`✅ ${persona.name} 시뮬레이션 완료\n`);

    return {
      persona,
      timestamp: new Date().toISOString(),
      response,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    };
  } catch (error: any) {
    console.error(`❌ ${persona.name} 시뮬레이션 실패:`, error.message);
    return {
      persona,
      timestamp: new Date().toISOString(),
      error: error.message,
      response: null,
    };
  }
}

// 결과를 마크다운으로 포맷팅
function formatResultsAsMarkdown(results: any[]): string {
  let markdown = `# AI 페르소나 시뮬레이션 결과\n\n`;
  markdown += `**실행 일시**: ${new Date().toLocaleString('ko-KR')}\n`;
  markdown += `**총 페르소나 수**: ${results.length}\n\n`;
  markdown += `---\n\n`;

  // 각 페르소나별 결과
  results.forEach((result, index) => {
    const { persona, response, error, usage } = result;

    markdown += `## ${index + 1}. ${persona.name} (${persona.id})\n\n`;
    markdown += `- **직무**: ${persona.jobFunction}\n`;
    markdown += `- **디지털 수준**: ${persona.digitalMaturity}\n`;
    markdown += `- **나이**: ${persona.age}세\n`;
    markdown += `- **배경**: ${persona.background}\n\n`;

    if (error) {
      markdown += `### ❌ 시뮬레이션 실패\n\n`;
      markdown += `\`\`\`\n${error}\n\`\`\`\n\n`;
    } else {
      markdown += `### 워크샵 경험 피드백\n\n`;
      markdown += `${response}\n\n`;

      if (usage) {
        markdown += `**토큰 사용량**: Input ${usage.input_tokens} | Output ${usage.output_tokens}\n\n`;
      }
    }

    markdown += `---\n\n`;
  });

  // 요약 섹션
  markdown += `## 📊 시뮬레이션 요약\n\n`;

  const successful = results.filter(r => !r.error).length;
  const failed = results.filter(r => r.error).length;
  const totalInputTokens = results
    .filter(r => r.usage)
    .reduce((sum, r) => sum + r.usage.input_tokens, 0);
  const totalOutputTokens = results
    .filter(r => r.usage)
    .reduce((sum, r) => sum + r.usage.output_tokens, 0);

  markdown += `- **성공**: ${successful}명\n`;
  markdown += `- **실패**: ${failed}명\n`;
  markdown += `- **총 토큰 사용량**: ${totalInputTokens + totalOutputTokens} (Input: ${totalInputTokens}, Output: ${totalOutputTokens})\n\n`;

  // 직무별 분포
  markdown += `### 직무별 분포\n\n`;
  const byJobFunction = results.reduce((acc: any, r) => {
    const job = r.persona.jobFunction;
    acc[job] = (acc[job] || 0) + 1;
    return acc;
  }, {});
  Object.entries(byJobFunction).forEach(([job, count]) => {
    markdown += `- **${job}**: ${count}명\n`;
  });

  markdown += `\n### 디지털 수준별 분포\n\n`;
  const byMaturity = results.reduce((acc: any, r) => {
    const level = r.persona.digitalMaturity;
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});
  Object.entries(byMaturity).forEach(([level, count]) => {
    markdown += `- **${level}**: ${count}명\n`;
  });

  markdown += `\n---\n\n`;
  markdown += `## 다음 단계\n\n`;
  markdown += `1. 각 페르소나의 피드백을 분석하여 주요 이슈 파악\n`;
  markdown += `2. 디지털 수준별, 직무별 공통 패턴 도출\n`;
  markdown += `3. 우선순위가 높은 개선사항 선정\n`;
  markdown += `4. Phase 2 (사내 직원 섀도우 런) 준비\n\n`;

  return markdown;
}

// 메인 실행 함수
async function main() {
  console.log('\n🚀 AI 페르소나 시뮬레이션 시작\n');
  console.log(`총 ${personas.length}개 페르소나를 순차적으로 시뮬레이션합니다.\n`);

  const results: any[] = [];

  // 12개 페르소나 순차 실행
  for (const persona of personas) {
    const result = await runPersonaSimulation(persona);
    results.push(result);

    // API Rate Limit 방지를 위해 1초 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ 모든 페르소나 시뮬레이션 완료\n');

  // 결과를 마크다운으로 저장
  const markdown = formatResultsAsMarkdown(results);
  const outputDir = '/Users/crystal/Desktop/new/1-Projects/Work Redesign';
  const outputPath = path.join(outputDir, '페르소나_시뮬레이션_결과.md');

  fs.writeFileSync(outputPath, markdown, 'utf-8');
  console.log(`📄 결과 저장 완료: ${outputPath}\n`);

  // JSON 형식으로도 저장 (추가 분석용)
  const jsonPath = path.join(outputDir, '페르소나_시뮬레이션_결과.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`📄 JSON 저장 완료: ${jsonPath}\n`);

  console.log('🎉 시뮬레이션 완료!\n');
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

export { runPersonaSimulation, personas, formatResultsAsMarkdown };
