#!/usr/bin/env ts-node

/**
 * personas-v3.ts를 JSON으로 변환하여 Gemini API 이미지 생성에 사용
 */

import * as fs from 'fs';
import * as path from 'path';
import { PERSONAS_V3 } from './personas-v3';

const outputPath = path.join(__dirname, 'personas.json');

// JSON으로 변환 (들여쓰기 포함)
const jsonData = JSON.stringify(PERSONAS_V3, null, 2);

// 파일로 저장
fs.writeFileSync(outputPath, jsonData, 'utf-8');

console.log(`✅ Successfully exported ${PERSONAS_V3.length} personas to ${outputPath}`);
console.log(`📊 Total personas: ${PERSONAS_V3.length}`);

// 카테고리별 통계
const categories = PERSONAS_V3.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('\n📈 Breakdown by category:');
Object.entries(categories).forEach(([category, count]) => {
  console.log(`  - ${category}: ${count}`);
});

// 나이 범위
const ages = PERSONAS_V3.map(p => p.age);
const minAge = Math.min(...ages);
const maxAge = Math.max(...ages);
console.log(`\n👥 Age range: ${minAge}-${maxAge} years old`);

// 평균 팀 크기
const avgTeamSize = Math.round(
  PERSONAS_V3.reduce((sum, p) => sum + p.team.size, 0) / PERSONAS_V3.length
);
console.log(`👨‍👩‍👧‍👦 Average team size: ${avgTeamSize} members`);
