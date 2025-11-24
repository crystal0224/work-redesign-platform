#!/usr/bin/env ts-node

/**
 * 페르소나 설정 및 관리 모듈
 * SK 계열사 팀장 30명 페르소나
 */

export interface Persona {
  id: string;
  name: string;
  company: string;
  department: string;
  role: string;
  jobFunction: 'Marketing' | 'Production' | 'R&D' | 'Staff';

  // 팀 특성
  teamSize: 'Small' | 'Medium' | 'Large';
  teamSizeNumber: number;

  // 디지털 특성
  digitalMaturity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  aiExperience: '없음' | '기초' | '활용중' | '전문가';

  // 업무 특성
  workStructure: '비구조화' | '반구조화' | '고도구조화';

  // 행동 특성
  changeResistance: 'low' | 'medium' | 'high';
  learningSpeed: 'slow' | 'medium' | 'fast';

  // 시뮬레이션용 특성
  patience: number; // 1-10, 인내심
  techSavvy: number; // 1-10, 기술 친화도

  // 예상 행동 패턴
  expectedBehavior: {
    dropoutRisk: number; // 0-100%, 중도 포기 위험
    problemSteps: number[]; // 어려움 예상 단계
    strongSteps: number[]; // 잘 할 것으로 예상되는 단계
  };
}

// 30개 페르소나 정의
export const SK_PERSONAS: Persona[] = [
  // === Beginner + Small Team ===
  {
    id: 'SK-M01',
    name: '김민수',
    company: 'SK플래닛',
    department: '커머스마케팅팀',
    role: '팀장',
    jobFunction: 'Marketing',
    teamSize: 'Small',
    teamSizeNumber: 8,
    digitalMaturity: 'Beginner',
    aiExperience: '없음',
    workStructure: '비구조화',
    changeResistance: 'high',
    learningSpeed: 'slow',
    patience: 4,
    techSavvy: 3,
    expectedBehavior: {
      dropoutRisk: 30,
      problemSteps: [8, 9, 10],
      strongSteps: [1, 3]
    }
  },

  // === Beginner + Large Team ===
  {
    id: 'SK-M09',
    name: '김현우',
    company: '11번가',
    department: '디지털마케팅팀',
    role: '팀장',
    jobFunction: 'Marketing',
    teamSize: 'Large',
    teamSizeNumber: 48,
    digitalMaturity: 'Beginner',
    aiExperience: '없음',
    workStructure: '고도구조화',
    changeResistance: 'high',
    learningSpeed: 'slow',
    patience: 3,
    techSavvy: 2,
    expectedBehavior: {
      dropoutRisk: 40,
      problemSteps: [2, 5, 8, 9, 10],
      strongSteps: [11]
    }
  },

  // === Intermediate + Medium Team ===
  {
    id: 'SK-P02',
    name: '이영호',
    company: 'SK하이닉스',
    department: '반도체생산팀',
    role: '팀장',
    jobFunction: 'Production',
    teamSize: 'Medium',
    teamSizeNumber: 22,
    digitalMaturity: 'Intermediate',
    aiExperience: '기초',
    workStructure: '반구조화',
    changeResistance: 'medium',
    learningSpeed: 'medium',
    patience: 6,
    techSavvy: 5,
    expectedBehavior: {
      dropoutRisk: 10,
      problemSteps: [9, 10],
      strongSteps: [3, 4, 6]
    }
  },

  // === Advanced + Large Team ===
  {
    id: 'SK-R03',
    name: '박지원',
    company: 'SK바이오팜',
    department: '신약개발팀',
    role: '팀장',
    jobFunction: 'R&D',
    teamSize: 'Large',
    teamSizeNumber: 42,
    digitalMaturity: 'Advanced',
    aiExperience: '활용중',
    workStructure: '고도구조화',
    changeResistance: 'low',
    learningSpeed: 'fast',
    patience: 8,
    techSavvy: 8,
    expectedBehavior: {
      dropoutRisk: 5,
      problemSteps: [2],
      strongSteps: [6, 7, 8, 9, 11]
    }
  },

  // === Expert + Small Team ===
  {
    id: 'SK-S04',
    name: '정수현',
    company: 'SK주식회사',
    department: '전략기획팀',
    role: '팀장',
    jobFunction: 'Staff',
    teamSize: 'Small',
    teamSizeNumber: 7,
    digitalMaturity: 'Expert',
    aiExperience: '전문가',
    workStructure: '비구조화',
    changeResistance: 'low',
    learningSpeed: 'fast',
    patience: 9,
    techSavvy: 10,
    expectedBehavior: {
      dropoutRisk: 0,
      problemSteps: [],
      strongSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    }
  },

  // 나머지 25개 페르소나...
  // Production 직무
  {
    id: 'SK-P06',
    name: '이민재',
    company: 'SK에너지',
    department: '정유생산팀',
    role: '팀장',
    jobFunction: 'Production',
    teamSize: 'Large',
    teamSizeNumber: 45,
    digitalMaturity: 'Intermediate',
    aiExperience: '기초',
    workStructure: '고도구조화',
    changeResistance: 'medium',
    learningSpeed: 'medium',
    patience: 5,
    techSavvy: 4,
    expectedBehavior: {
      dropoutRisk: 15,
      problemSteps: [2, 9, 10],
      strongSteps: [3, 4, 6]
    }
  },

  {
    id: 'SK-P11',
    name: '이철수',
    company: 'SK실트론',
    department: '웨이퍼생산팀',
    role: '팀장',
    jobFunction: 'Production',
    teamSize: 'Large',
    teamSizeNumber: 45,
    digitalMaturity: 'Beginner',
    aiExperience: '없음',
    workStructure: '비구조화',
    changeResistance: 'high',
    learningSpeed: 'slow',
    patience: 2,
    techSavvy: 2,
    expectedBehavior: {
      dropoutRisk: 50,
      problemSteps: [2, 5, 8, 9, 10],
      strongSteps: []
    }
  },

  // R&D 직무
  {
    id: 'SK-R07',
    name: '박성민',
    company: 'SK C&C',
    department: 'AI연구팀',
    role: '팀장',
    jobFunction: 'R&D',
    teamSize: 'Small',
    teamSizeNumber: 8,
    digitalMaturity: 'Advanced',
    aiExperience: '활용중',
    workStructure: '비구조화',
    changeResistance: 'low',
    learningSpeed: 'fast',
    patience: 8,
    techSavvy: 9,
    expectedBehavior: {
      dropoutRisk: 0,
      problemSteps: [],
      strongSteps: [6, 7, 8, 9, 10]
    }
  },

  // Staff 직무
  {
    id: 'SK-S08',
    name: '최지우',
    company: 'SK네트웍스',
    department: '인사팀',
    role: '팀장',
    jobFunction: 'Staff',
    teamSize: 'Medium',
    teamSizeNumber: 20,
    digitalMaturity: 'Expert',
    aiExperience: '전문가',
    workStructure: '반구조화',
    changeResistance: 'low',
    learningSpeed: 'fast',
    patience: 8,
    techSavvy: 8,
    expectedBehavior: {
      dropoutRisk: 0,
      problemSteps: [],
      strongSteps: [2, 3, 4, 5, 11]
    }
  },

  // 추가 페르소나들 (총 30개가 되도록)
  ...generateAdditionalPersonas()
];

// 추가 페르소나 생성 함수
function generateAdditionalPersonas(): Persona[] {
  const additionalPersonas: Persona[] = [];
  const companies = ['SK텔레콤', 'SK온', 'SK이노베이션', 'SK케미칼', 'SK바이오사이언스'];
  const departments = ['고객마케팅팀', '배터리생산팀', '기술혁신팀', '화학생산팀', '백신연구팀'];

  // 다양한 조합으로 21개 추가 페르소나 생성
  for (let i = 0; i < 21; i++) {
    const id = `SK-${String.fromCharCode(65 + Math.floor(i / 10))}${(i % 10) + 10}`;
    additionalPersonas.push({
      id,
      name: `테스트${i + 10}`,
      company: companies[i % companies.length],
      department: departments[i % departments.length],
      role: '팀장',
      jobFunction: ['Marketing', 'Production', 'R&D', 'Staff'][i % 4] as any,
      teamSize: ['Small', 'Medium', 'Large'][i % 3] as any,
      teamSizeNumber: [8, 20, 45][i % 3],
      digitalMaturity: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][i % 4] as any,
      aiExperience: ['없음', '기초', '활용중', '전문가'][i % 4] as any,
      workStructure: ['비구조화', '반구조화', '고도구조화'][i % 3] as any,
      changeResistance: ['low', 'medium', 'high'][i % 3] as any,
      learningSpeed: ['slow', 'medium', 'fast'][i % 3] as any,
      patience: 3 + (i % 7),
      techSavvy: 2 + (i % 8),
      expectedBehavior: {
        dropoutRisk: Math.max(0, 40 - (i * 2)),
        problemSteps: i < 10 ? [8, 9, 10] : [9, 10],
        strongSteps: i > 15 ? [6, 7, 11] : [3, 11]
      }
    });
  }

  return additionalPersonas;
}

// 페르소나 분석 함수
export function analyzePersonas() {
  const analysis = {
    total: SK_PERSONAS.length,
    byJobFunction: {} as Record<string, number>,
    byTeamSize: {} as Record<string, number>,
    byDigitalMaturity: {} as Record<string, number>,
    byWorkStructure: {} as Record<string, number>,
    highRiskPersonas: [] as string[],
  };

  SK_PERSONAS.forEach(persona => {
    // 직무별
    analysis.byJobFunction[persona.jobFunction] =
      (analysis.byJobFunction[persona.jobFunction] || 0) + 1;

    // 팀 규모별
    analysis.byTeamSize[persona.teamSize] =
      (analysis.byTeamSize[persona.teamSize] || 0) + 1;

    // 디지털 성숙도별
    analysis.byDigitalMaturity[persona.digitalMaturity] =
      (analysis.byDigitalMaturity[persona.digitalMaturity] || 0) + 1;

    // 업무 구조화별
    analysis.byWorkStructure[persona.workStructure] =
      (analysis.byWorkStructure[persona.workStructure] || 0) + 1;

    // 고위험 페르소나
    if (persona.expectedBehavior.dropoutRisk > 30) {
      analysis.highRiskPersonas.push(`${persona.name} (${persona.company})`);
    }
  });

  return analysis;
}

// 페르소나 저장
export function savePersonas() {
  const fs = require('fs');
  const path = require('path');

  const outputPath = path.join(__dirname, '../outputs/personas.json');

  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  fs.writeFileSync(
    outputPath,
    JSON.stringify(SK_PERSONAS, null, 2),
    'utf-8'
  );

  console.log(`✅ ${SK_PERSONAS.length}개 페르소나 저장 완료:`, outputPath);

  // 분석 결과도 저장
  const analysis = analyzePersonas();
  const analysisPath = path.join(__dirname, '../outputs/persona-analysis.json');
  fs.writeFileSync(
    analysisPath,
    JSON.stringify(analysis, null, 2),
    'utf-8'
  );

  console.log('✅ 페르소나 분석 저장 완료:', analysisPath);

  return SK_PERSONAS;
}

// 실행
if (require.main === module) {
  console.log('👥 페르소나 설정 시작...\n');
  savePersonas();

  const analysis = analyzePersonas();
  console.log('\n📊 페르소나 분석:');
  console.log(`- 총 인원: ${analysis.total}명`);
  console.log(`- 고위험군: ${analysis.highRiskPersonas.length}명`);
  console.log('\n✨ 페르소나 설정 완료!');
}