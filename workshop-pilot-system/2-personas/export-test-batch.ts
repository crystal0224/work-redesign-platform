#!/usr/bin/env ts-node

/**
 * 테스트용 처음 3명의 페르소나를 JSON으로 추출
 */

import * as fs from 'fs';
import * as path from 'path';
import { PERSONAS_V3 } from './personas-v3';

const outputPath = path.join(__dirname, '../image-generator/personas-test.json');

// 처음 3명만 추출
const testPersonas = PERSONAS_V3.slice(0, 3);

// JSON으로 변환
const jsonData = JSON.stringify(testPersonas, null, 2);

// 파일로 저장
fs.writeFileSync(outputPath, jsonData, 'utf-8');

console.log(`✅ Test batch exported: ${testPersonas.length} personas`);
console.log(`📄 Output: ${outputPath}`);
console.log('\n👥 Test personas:');
testPersonas.forEach((p, i) => {
  console.log(`  ${i + 1}. ${p.id} - ${p.name} (${p.age}세, ${p.role}, ${p.company})`);
});
