#!/usr/bin/env ts-node

/**
 * 대규모 팀 & 조직 구조화 정도별 고급 페르소나 시뮬레이션
 *
 * 팀 규모: 5명(소), 30명(중), 50명(대)
 * 구조화 정도: 비구조화, 반구조화, 고도구조화
 */

import * as dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.ANTHROPIC_API_KEY || '';
const anthropic = new Anthropic({ apiKey });

interface AdvancedPersona {
  id: string;
  name: string;
  role: string;
  jobFunction: string;
  teamSize: number;
  organizationStructure: '비구조화' | '반구조화' | '고도구조화';
  teamDigitalMaturity: string;
  kpiClearness: string; // KPI 명확성
  workProcessStandardization: string; // 업무 표준화 정도
  decisionMakingSpeed: string; // 의사결정 속도
  challenges: string[];
  automationReadiness: string; // 자동화 준비도
}

const advancedPersonas: AdvancedPersona[] = [
  // === 대규모 팀 (30명) ===
  {
    id: 'L1',
    name: '정현수',
    role: '글로벌마케팅본부 본부장',
    jobFunction: '마케팅',
    teamSize: 30,
    organizationStructure: '고도구조화',
    teamDigitalMaturity: '중급',
    kpiClearness: '매우 명확 - 분기별 OKR, 개인별 KPI 설정',
    workProcessStandardization: '높음 - ISO 인증, 프로세스 문서화',
    decisionMakingSpeed: '느림 - 여러 단계 승인 필요',
    challenges: [
      '30명 팀원 간 협업 도구 통일 어려움',
      '부서별 사일로 현상으로 정보 공유 제한',
      '변화에 대한 저항이 큼 (특히 중간관리자층)',
      '전사 시스템과의 연계 필수'
    ],
    automationReadiness: '중간 - 프로세스는 명확하나 실행력 부족'
  },
  {
    id: 'L2',
    name: '김태준',
    role: '스마트제조혁신센터 센터장',
    jobFunction: '제조',
    teamSize: 35,
    organizationStructure: '반구조화',
    teamDigitalMaturity: '중급',
    kpiClearness: '보통 - 생산성 지표는 있으나 혁신 지표 불명확',
    workProcessStandardization: '중간 - 주요 프로세스만 표준화',
    decisionMakingSpeed: '보통 - 현장 재량권 일부 있음',
    challenges: [
      '3교대 근무로 교육/워크샵 참여 어려움',
      '현장 작업자와 엔지니어 간 디지털 격차',
      '레거시 시스템과 신기술 통합 복잡',
      '안전/품질 규정 준수하며 자동화 필요'
    ],
    automationReadiness: '높음 - 스마트팩토리 전환 진행 중'
  },

  // === 초대규모 팀 (50명) ===
  {
    id: 'XL1',
    name: '이승연',
    role: 'R&D센터 센터장',
    jobFunction: 'R&D',
    teamSize: 50,
    organizationStructure: '고도구조화',
    teamDigitalMaturity: '고급',
    kpiClearness: '매우 명확 - 특허, 논문, 제품화 지표',
    workProcessStandardization: '높음 - Stage-Gate 프로세스',
    decisionMakingSpeed: '느림 - 투자심의위원회 승인 필요',
    challenges: [
      '50명의 다양한 전문분야 조율 어려움',
      '장기 프로젝트와 단기 성과 압박의 균형',
      '외부 협력사/대학과의 협업 관리',
      '지적재산권 보호하며 자동화 추진'
    ],
    automationReadiness: '높음 - 이미 많은 도구 활용 중'
  },
  {
    id: 'XL2',
    name: '박성민',
    role: 'IT서비스본부 본부장',
    jobFunction: 'Staff',
    teamSize: 45,
    organizationStructure: '비구조화',
    teamDigitalMaturity: '고급',
    kpiClearness: '불명확 - 정성적 목표 위주',
    workProcessStandardization: '낮음 - 애자일/스크럼 자율 운영',
    decisionMakingSpeed: '빠름 - 현장 자율성 높음',
    challenges: [
      '프로젝트별로 다른 방법론 사용',
      '팀 간 기술 스택 파편화',
      'Shadow IT 현상 빈번',
      '전사 거버넌스와 충돌'
    ],
    automationReadiness: '매우 높음 - 자체 자동화 도구 개발 가능'
  },

  // === 조직 구조화 특화 케이스 ===
  {
    id: 'S1',
    name: '윤미라',
    role: '신사업개발팀 팀장',
    jobFunction: '전략기획',
    teamSize: 8,
    organizationStructure: '비구조화',
    teamDigitalMaturity: '중급',
    kpiClearness: '매우 불명확 - 탐색 단계',
    workProcessStandardization: '매우 낮음 - 실험적 접근',
    decisionMakingSpeed: '매우 빠름 - 즉각 피봇',
    challenges: [
      '업무 정의 자체가 유동적',
      '성과 측정 기준 부재',
      '팀원별 역할 경계 모호',
      '실패 용인 문화 필요'
    ],
    automationReadiness: '낮음 - 표준화할 프로세스 자체가 없음'
  },
  {
    id: 'S2',
    name: '최동욱',
    role: '품질관리부 부장',
    jobFunction: '품질',
    teamSize: 12,
    organizationStructure: '고도구조화',
    teamDigitalMaturity: '초급',
    kpiClearness: '매우 명확 - 불량률, 고객클레임',
    workProcessStandardization: '매우 높음 - ISO 9001/14001',
    decisionMakingSpeed: '매우 느림 - 품질 매뉴얼 준수',
    challenges: [
      '규정 준수와 혁신의 딜레마',
      '문서화 작업 과중',
      '변경 시 모든 절차 재승인 필요',
      '감사 대응으로 보수적 접근'
    ],
    automationReadiness: '중간 - 프로세스는 명확하나 변화 저항 큼'
  },

  // === 혼합형 복잡 케이스 ===
  {
    id: 'C1',
    name: '한지민',
    role: '디지털전환추진단 단장',
    jobFunction: 'DX',
    teamSize: 25,
    organizationStructure: '반구조화',
    teamDigitalMaturity: '고급',
    kpiClearness: '보통 - 정량+정성 혼합',
    workProcessStandardization: '중간 - 핵심만 표준화',
    decisionMakingSpeed: '빠름 - 권한 위임',
    challenges: [
      '전사 부서 간 이해관계 조정',
      '레거시와 신기술 병존',
      'Change Agent 역할의 부담',
      '단기 성과와 장기 전략 균형'
    ],
    automationReadiness: '매우 높음 - 전사 자동화 주도'
  }
];

// 워크샵 프롬프트 생성 (고급 버전)
function generateAdvancedPrompt(persona: AdvancedPersona): string {
  return `당신은 ${persona.name} ${persona.role}입니다.

=== 조직 현황 ===
- 팀 규모: ${persona.teamSize}명
- 조직 구조: ${persona.organizationStructure}
- 디지털 성숙도: ${persona.teamDigitalMaturity}
- KPI 명확성: ${persona.kpiClearness}
- 업무 표준화: ${persona.workProcessStandardization}
- 의사결정: ${persona.decisionMakingSpeed}
- 자동화 준비도: ${persona.automationReadiness}

=== 주요 도전과제 ===
${persona.challenges.map(c => `- ${c}`).join('\n')}

=== 평가 요청 ===
SK 아카데미의 35분 AI 자동화 워크샵을 평가해주세요:

1. **팀 규모 관점**: ${persona.teamSize}명 조직에 35분 워크샵이 적절한가?
2. **구조화 관점**: ${persona.organizationStructure} 조직에서 실제 적용 가능한가?
3. **실무 적용**: 워크샵 내용을 어떻게 조직에 적용할 것인가?
4. **예상 장애물**: 도입 시 가장 큰 장애물은?
5. **개선 제안**: 워크샵 개선 방향은?

각 항목을 2-3문장으로 구체적으로 답변해주세요.`;
}

// 시뮬레이션 실행
async function runAdvancedSimulation() {
  console.log('\n🚀 고급 페르소나 시뮬레이션 시작\n');
  console.log('='.repeat(60));
  console.log(`총 ${advancedPersonas.length}개 페르소나 | Claude 4.5 Haiku 사용\n`);

  const results = [];

  for (const persona of advancedPersonas) {
    console.log(`\n📊 시뮬레이션: ${persona.name} (${persona.role})`);
    console.log(`   팀 규모: ${persona.teamSize}명 | 구조화: ${persona.organizationStructure}`);

    const prompt = generateAdvancedPrompt(persona);

    try {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      const response = message.content[0].type === 'text'
        ? message.content[0].text
        : 'No response';

      console.log(`   ✅ 완료 (${message.usage.output_tokens} 토큰)`);

      results.push({
        persona,
        response,
        usage: message.usage,
        timestamp: new Date().toISOString(),
      });

    } catch (error: any) {
      console.log(`   ❌ 실패: ${error.message}`);
      results.push({
        persona,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    // Rate limiting 방지
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 결과 저장
  const outputDir = '/Users/crystal/Desktop/new/1-Projects/Work Redesign';

  // JSON 저장
  const jsonPath = path.join(outputDir, '고급_페르소나_시뮬레이션_결과.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n📄 JSON 저장: ${jsonPath}`);

  // 마크다운 리포트 생성
  let markdown = `# 고급 페르소나 시뮬레이션 결과

**실행 일시**: ${new Date().toLocaleString('ko-KR')}
**총 페르소나**: ${results.length}개
**관점**: 팀 규모 및 조직 구조화 정도별 분석

---

`;

  results.forEach((result, idx) => {
    const { persona, response, error, usage } = result;

    markdown += `## ${idx + 1}. ${persona.name} - ${persona.role}

### 조직 프로필
- **직무**: ${persona.jobFunction}
- **팀 규모**: ${persona.teamSize}명
- **조직 구조**: ${persona.organizationStructure}
- **디지털 성숙도**: ${persona.teamDigitalMaturity}
- **자동화 준비도**: ${persona.automationReadiness}

### 조직 특성
- **KPI 명확성**: ${persona.kpiClearness}
- **업무 표준화**: ${persona.workProcessStandardization}
- **의사결정**: ${persona.decisionMakingSpeed}

### 주요 도전과제
${persona.challenges.map(c => `- ${c}`).join('\n')}

### 워크샵 평가
${error ? `❌ 시뮬레이션 실패: ${error}` : response}

${usage ? `**토큰 사용**: Input ${usage.input_tokens} | Output ${usage.output_tokens}` : ''}

---

`;
  });

  // 통계 요약
  const successful = results.filter(r => !r.error).length;
  const totalTokens = results
    .filter(r => r.usage)
    .reduce((sum, r) => sum + r.usage.input_tokens + r.usage.output_tokens, 0);

  markdown += `## 📊 시뮬레이션 통계

- **성공**: ${successful}/${results.length}
- **총 토큰 사용**: ${totalTokens.toLocaleString()}
- **예상 비용**: $${(totalTokens / 1000000 * 6).toFixed(2)}

### 팀 규모별 분포
- **소규모 (< 15명)**: ${advancedPersonas.filter(p => p.teamSize < 15).length}개
- **중규모 (15-35명)**: ${advancedPersonas.filter(p => p.teamSize >= 15 && p.teamSize <= 35).length}개
- **대규모 (> 35명)**: ${advancedPersonas.filter(p => p.teamSize > 35).length}개

### 구조화 정도별 분포
- **비구조화**: ${advancedPersonas.filter(p => p.organizationStructure === '비구조화').length}개
- **반구조화**: ${advancedPersonas.filter(p => p.organizationStructure === '반구조화').length}개
- **고도구조화**: ${advancedPersonas.filter(p => p.organizationStructure === '고도구조화').length}개

`;

  const mdPath = path.join(outputDir, '고급_페르소나_시뮬레이션_리포트.md');
  fs.writeFileSync(mdPath, markdown, 'utf-8');
  console.log(`📄 리포트 저장: ${mdPath}`);

  console.log('\n✅ 고급 페르소나 시뮬레이션 완료!\n');
}

// 실행
runAdvancedSimulation().catch(console.error);