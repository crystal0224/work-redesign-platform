#!/usr/bin/env ts-node

/**
 * 3명 페르소나로 빠른 테스트
 */

import { skPersonas, WORKSHOP_STAGES, simulateWorkshopStage } from './sk-workshop-simulation';
import * as fs from 'fs';
import * as path from 'path';

async function testThreePersonas() {
  console.log('\\n🧪 3명 페르소나 테스트 시작\\n');

  // 다양한 레벨 3명 선택: Beginner, Intermediate, Expert
  const testPersonas = [
    skPersonas[0], // 김영수 (Marketing, Beginner)
    skPersonas[3], // 최수진 (Staff/HR, Intermediate)
    skPersonas[2]  // 박진호 (R&D, Expert)
  ];

  const results = [];

  for (const persona of testPersonas) {
    console.log(`\\n테스트: ${persona.name} (${persona.department})`);
    console.log(`  디지털: ${persona.digitalMaturity.level} | AI경험: ${persona.digitalMaturity.aiAgentExperience}`);

    // 처음 3단계만 테스트
    const testStages = WORKSHOP_STAGES.slice(0, 3);
    const experiences = [];

    for (const stage of testStages) {
      console.log(`  Step ${stage.number}: ${stage.name}...`);

      const experience = await simulateWorkshopStage(persona, stage);
      experiences.push(experience);

      console.log(`    시간: ${experience.actualMinutes}분 (예상: ${stage.expectedMinutes}분)`);
      console.log(`    사용성: ${experience.easeOfUse}/10`);

      if (experience.painPoints.length > 0) {
        console.log(`    불편: ${experience.painPoints[0]}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    results.push({ persona, experiences });
  }

  // 간단한 요약
  console.log('\\n=== 테스트 요약 ===');
  results.forEach(r => {
    const avgTime = r.experiences.reduce((sum, e) => sum + e.actualMinutes, 0) / r.experiences.length;
    const avgEase = r.experiences.reduce((sum, e) => sum + e.easeOfUse, 0) / r.experiences.length;
    console.log(`${r.persona.name}: 평균 ${avgTime.toFixed(1)}분, 사용성 ${avgEase.toFixed(1)}/10`);
  });

  // JSON 저장
  const outputPath = path.join(
    '/Users/crystal/Desktop/new/1-Projects/Work Redesign',
    `test_3_personas_${Date.now()}.json`
  );
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\\n📄 결과 저장: ${outputPath}`);
}

testThreePersonas().catch(console.error);