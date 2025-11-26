#!/usr/bin/env ts-node

import { PERSONAS_V3, Persona } from './2-personas/personas-v3';

// 검증 결과 타입
interface ValidationResult {
  passed: boolean;
  message: string;
  affectedPersonas?: string[];
}

interface PersonaStats {
  id: string;
  yearsInRole: number;
  age: number;
  teamSize: number;
  seniorCount?: number;
  juniorCount?: number;
  dailyWorkflowLength: number;
  weeklyRoutineLength: number;
  collaborationLength: number;
  painPointsCount: number;
  totalTextLength: number;
  missingFields: string[];
}

// 검증 함수들
function validateYearsInRole(personas: Persona[]): ValidationResult {
  const outOfRange = personas.filter(p => {
    const years = p.leaderProfile.yearsInRole;
    return years < 0.5 || years > 1.5;
  });

  return {
    passed: outOfRange.length === 0,
    message: `신임 팀장 기준 (0.5~1.5년) - ${30 - outOfRange.length}/30 통과`,
    affectedPersonas: outOfRange.map(p => `${p.id}: ${p.leaderProfile.yearsInRole}년`)
  };
}

function validateAge(personas: Persona[]): ValidationResult {
  const outOfRange = personas.filter(p => p.age < 35 || p.age > 49);

  return {
    passed: outOfRange.length === 0,
    message: `나이대 (35-49세) - ${30 - outOfRange.length}/30 통과`,
    affectedPersonas: outOfRange.map(p => `${p.id}: ${p.age}세`)
  };
}

function validateTeamComposition(personas: Persona[]): ValidationResult {
  const issues: string[] = [];

  personas.forEach(p => {
    const { seniorCount, juniorCount } = p.team;

    // seniorCount, juniorCount 필드 누락 체크
    if (seniorCount === undefined || juniorCount === undefined) {
      issues.push(`${p.id}: seniorCount 또는 juniorCount 필드 누락`);
      return;
    }

    // 합계 체크
    const sum = seniorCount + juniorCount;
    if (sum !== p.team.size) {
      issues.push(`${p.id}: 팀 구성 불일치 (senior:${seniorCount} + junior:${juniorCount} = ${sum}, but team.size:${p.team.size})`);
    }
  });

  return {
    passed: issues.length === 0,
    message: `팀 구성 일치 - ${30 - issues.length}/30 통과`,
    affectedPersonas: issues
  };
}

function validateWorkflowLengths(personas: Persona[]): ValidationResult {
  const issues: string[] = [];

  personas.forEach(p => {
    const dailyLen = p.work.dailyWorkflow?.length || 0;
    const weeklyLen = p.work.weeklyRoutine?.length || 0;
    const collabLen = p.work.collaboration?.length || 0;

    if (dailyLen < 200) {
      issues.push(`${p.id}: dailyWorkflow 너무 짧음 (${dailyLen}자, 최소 200자)`);
    }
    if (weeklyLen < 150) {
      issues.push(`${p.id}: weeklyRoutine 너무 짧음 (${weeklyLen}자, 최소 150자)`);
    }
    if (collabLen < 100) {
      issues.push(`${p.id}: collaboration 너무 짧음 (${collabLen}자, 최소 100자)`);
    }
  });

  return {
    passed: issues.length === 0,
    message: `업무 흐름 텍스트 길이 - ${30 - Math.ceil(issues.length / 3)}/30 통과`,
    affectedPersonas: issues
  };
}

function validatePainPoints(personas: Persona[]): ValidationResult {
  const insufficient = personas.filter(p => {
    const count = p.work.painPoints?.length || 0;
    return count < 5;
  });

  return {
    passed: insufficient.length === 0,
    message: `painPoints 개수 (최소 5개) - ${30 - insufficient.length}/30 통과`,
    affectedPersonas: insufficient.map(p => `${p.id}: ${p.work.painPoints?.length || 0}개`)
  };
}

function validateMissingFields(personas: Persona[]): ValidationResult {
  const issues: string[] = [];

  personas.forEach(p => {
    const missing: string[] = [];

    if (p.age === undefined) missing.push('age');
    if (p.team.seniorCount === undefined) missing.push('seniorCount');
    if (p.team.juniorCount === undefined) missing.push('juniorCount');
    if (!p.work.dailyWorkflow) missing.push('dailyWorkflow');
    if (!p.work.weeklyRoutine) missing.push('weeklyRoutine');
    if (!p.work.collaboration) missing.push('collaboration');
    if (!p.leaderProfile.promotionReason) missing.push('promotionReason');

    if (missing.length > 0) {
      issues.push(`${p.id}: ${missing.join(', ')}`);
    }
  });

  return {
    passed: issues.length === 0,
    message: `필수 필드 존재 - ${30 - issues.length}/30 통과`,
    affectedPersonas: issues
  };
}

function calculatePersonaStats(personas: Persona[]): PersonaStats[] {
  return personas.map(p => {
    const missingFields: string[] = [];

    if (p.age === undefined) missingFields.push('age');
    if (p.team.seniorCount === undefined) missingFields.push('seniorCount');
    if (p.team.juniorCount === undefined) missingFields.push('juniorCount');
    if (!p.work.dailyWorkflow) missingFields.push('dailyWorkflow');
    if (!p.work.weeklyRoutine) missingFields.push('weeklyRoutine');
    if (!p.work.collaboration) missingFields.push('collaboration');
    if (!p.leaderProfile.promotionReason) missingFields.push('promotionReason');

    const dailyLen = p.work.dailyWorkflow?.length || 0;
    const weeklyLen = p.work.weeklyRoutine?.length || 0;
    const collabLen = p.work.collaboration?.length || 0;
    const totalLen = dailyLen + weeklyLen + collabLen;

    return {
      id: p.id,
      yearsInRole: p.leaderProfile.yearsInRole,
      age: p.age,
      teamSize: p.team.size,
      seniorCount: p.team.seniorCount,
      juniorCount: p.team.juniorCount,
      dailyWorkflowLength: dailyLen,
      weeklyRoutineLength: weeklyLen,
      collaborationLength: collabLen,
      painPointsCount: p.work.painPoints?.length || 0,
      totalTextLength: totalLen,
      missingFields
    };
  });
}

function compareTextLengths(stats: PersonaStats[]): string[] {
  const p001 = stats.find(s => s.id === 'P001');
  if (!p001) return ['P001을 찾을 수 없습니다'];

  const baselineLength = p001.totalTextLength;
  const threshold = baselineLength * 0.8;

  const tooShort = stats.filter(s => s.totalTextLength < threshold);

  return tooShort.map(s => {
    const percentage = ((s.totalTextLength / baselineLength) * 100).toFixed(1);
    return `${s.id}: ${s.totalTextLength}자 (${percentage}% of P001)`;
  });
}

// 메인 검증 실행
function main() {
  console.log('## 페르소나 품질 검증 결과\n');

  const results = [
    validateYearsInRole(PERSONAS_V3),
    validateAge(PERSONAS_V3),
    validateTeamComposition(PERSONAS_V3),
    validateWorkflowLengths(PERSONAS_V3),
    validatePainPoints(PERSONAS_V3),
    validateMissingFields(PERSONAS_V3)
  ];

  // 통과한 검증
  console.log('### ✅ 통과한 검증');
  results.forEach(r => {
    if (r.passed) {
      console.log(`- ${r.message}`);
    }
  });
  console.log('');

  // 문제 발견
  console.log('### ⚠️ 문제 발견');
  const hasIssues = results.some(r => !r.passed);
  if (hasIssues) {
    results.forEach(r => {
      if (!r.passed) {
        console.log(`- ${r.message}`);
        r.affectedPersonas?.forEach(p => console.log(`  - ${p}`));
      }
    });
  } else {
    console.log('- 문제 없음');
  }
  console.log('');

  // 페르소나별 상세 통계
  const stats = calculatePersonaStats(PERSONAS_V3);
  console.log('### 📊 페르소나별 상세 통계');
  console.log('| ID | yearsInRole | age | teamSize | senior+junior | dailyWorkflow | weeklyRoutine | collaboration | painPoints | 총텍스트 | 누락필드 |');
  console.log('|----|-------------|-----|----------|---------------|---------------|---------------|---------------|------------|----------|----------|');

  stats.forEach(s => {
    const teamComp = (s.seniorCount !== undefined && s.juniorCount !== undefined)
      ? `${s.seniorCount}+${s.juniorCount}`
      : 'N/A';
    const missing = s.missingFields.length > 0 ? s.missingFields.join(',') : '-';
    console.log(`| ${s.id} | ${s.yearsInRole} | ${s.age} | ${s.teamSize} | ${teamComp} | ${s.dailyWorkflowLength} | ${s.weeklyRoutineLength} | ${s.collaborationLength} | ${s.painPointsCount} | ${s.totalTextLength} | ${missing} |`);
  });
  console.log('');

  // 텍스트 길이 비교
  console.log('### 📏 텍스트 길이 비교 (P001 기준)');
  const shortPersonas = compareTextLengths(stats);
  if (shortPersonas.length === 0) {
    console.log('- 모든 페르소나가 P001 대비 80% 이상 텍스트 길이를 유지합니다.');
  } else {
    console.log('- 80% 미만인 페르소나:');
    shortPersonas.forEach(p => console.log(`  - ${p}`));
  }
  console.log('');

  // 최종 평가
  console.log('### 🎯 최종 평가');
  const passedCount = results.filter(r => r.passed).length;
  const totalTests = results.length;
  console.log(`- 검증 항목 통과율: ${passedCount}/${totalTests} (${((passedCount/totalTests)*100).toFixed(1)}%)`);

  const personasWithIssues = new Set<string>();
  results.forEach(r => {
    if (!r.passed && r.affectedPersonas) {
      r.affectedPersonas.forEach(msg => {
        const id = msg.split(':')[0];
        personasWithIssues.add(id);
      });
    }
  });

  if (personasWithIssues.size > 0) {
    console.log(`- 수정 필요 페르소나 (${personasWithIssues.size}개): ${Array.from(personasWithIssues).join(', ')}`);
  } else {
    console.log('- 수정 필요 페르소나: 없음');
  }
}

main();
