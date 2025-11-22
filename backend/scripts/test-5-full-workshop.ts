#!/usr/bin/env ts-node

/**
 * 5명 페르소나로 11단계 전체 워크샵 시뮬레이션
 * 각 특성별 대표 페르소나 선정
 */

import { expandedPersonas, WORKSHOP_STAGES, simulateStage } from './sk-expanded-personas';
import * as fs from 'fs';
import * as path from 'path';

async function testFiveFullWorkshop() {
  console.log('\\n🎯 5명 페르소나 × 11단계 전체 워크샵 시뮬레이션\\n');
  console.log('='.repeat(60));

  // 다양한 특성의 5명 선택
  const selectedPersonas = [
    expandedPersonas[0],  // 김민수: Marketing, Small, Beginner, Unstructured
    expandedPersonas[9],  // 김태훈: Production, Medium, Advanced, Highly-structured
    expandedPersonas[17], // 서예진: R&D, Medium, Expert, Semi-structured
    expandedPersonas[23], // 유상우: Staff, Medium, Intermediate, Highly-structured
    expandedPersonas[10]  // 이철수: Production, Large(45명), Beginner, Unstructured
  ];

  console.log('선택된 페르소나:');
  selectedPersonas.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} (${p.company}) - ${p.jobFunction}, ${p.teamSizeNumber}명, ${p.digitalMaturity}`);
  });
  console.log('\\n');

  const results = [];

  for (let i = 0; i < selectedPersonas.length; i++) {
    const persona = selectedPersonas[i];
    console.log(`\\n[${i + 1}/5] ${persona.name} (${persona.company} ${persona.department})`);
    console.log(`  ${persona.jobFunction} | ${persona.teamSizeNumber}명 | ${persona.digitalMaturity} | ${persona.workStructure}`);
    console.log('  ' + '-'.repeat(50));

    const experiences = [];
    let totalMinutes = 0;

    // 11단계 전체 실행
    for (const stage of WORKSHOP_STAGES) {
      process.stdout.write(`  Step ${stage.number.toString().padStart(2)}: ${stage.name.padEnd(20)} `);

      const experience = await simulateStage(persona, stage);
      experiences.push(experience);
      totalMinutes += experience.actualMinutes;

      // 간단한 진행 표시
      const timeDiff = experience.actualMinutes - stage.expectedMinutes;
      const timeIndicator = timeDiff > 0 ? `+${timeDiff}` : timeDiff.toString();

      console.log(`${experience.actualMinutes.toString().padStart(2)}분 (${timeIndicator.padStart(3)}) | 사용성: ${experience.easeOfUse}/10`);

      // 중도 포기 체크
      if (!experience.wouldContinue) {
        console.log(`  ⚠️ 중단 요청 - 이유: ${experience.painPoints[0] || '없음'}`);
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 800));
    }

    console.log(`  ` + '-'.repeat(50));
    console.log(`  총 소요시간: ${totalMinutes}분 (예상: 78분)`);
    console.log(`  완료 단계: ${experiences.length}/11`);

    results.push({
      persona: {
        id: persona.id,
        name: persona.name,
        company: persona.company,
        department: persona.department,
        jobFunction: persona.jobFunction,
        teamSize: persona.teamSizeNumber,
        digitalMaturity: persona.digitalMaturity,
        workStructure: persona.workStructure,
        aiExperience: persona.aiAgentExperience
      },
      experiences,
      totalMinutes,
      completedStages: experiences.length,
      timestamp: new Date().toISOString()
    });
  }

  // 결과 저장
  const outputPath = path.join(
    '/Users/crystal/Desktop/new/1-Projects/Work Redesign',
    `5personas_11stages_${Date.now()}.json`
  );
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\\n📄 상세 결과 저장: ${outputPath}`);

  // 요약 분석
  console.log('\\n' + '='.repeat(60));
  console.log('📊 요약 분석\\n');

  // 단계별 평균 시간
  console.log('단계별 평균 소요시간:');
  for (let i = 0; i < 11; i++) {
    const stageData = results
      .map(r => r.experiences[i])
      .filter(Boolean);

    if (stageData.length > 0) {
      const avgTime = stageData.reduce((sum, e) => sum + e.actualMinutes, 0) / stageData.length;
      const expectedTime = WORKSHOP_STAGES[i].expectedMinutes;
      const diff = ((avgTime - expectedTime) / expectedTime * 100).toFixed(0);
      console.log(`  Step ${(i + 1).toString().padStart(2)}: ${avgTime.toFixed(1).padStart(4)}분 (예상 대비 ${diff}%)`);
    }
  }

  // 디지털 성숙도별 평균
  console.log('\\n디지털 성숙도별 평균 사용성:');
  ['Beginner', 'Intermediate', 'Advanced', 'Expert'].forEach(level => {
    const filtered = results.filter(r => r.persona.digitalMaturity === level);
    if (filtered.length > 0) {
      const avgEase = filtered.reduce((sum, r) => {
        const avg = r.experiences.reduce((s, e) => s + e.easeOfUse, 0) / r.experiences.length;
        return sum + avg;
      }, 0) / filtered.length;
      console.log(`  ${level}: ${avgEase.toFixed(1)}/10`);
    }
  });

  console.log('\\n✅ 시뮬레이션 완료!\\n');
}

testFiveFullWorkshop().catch(console.error);