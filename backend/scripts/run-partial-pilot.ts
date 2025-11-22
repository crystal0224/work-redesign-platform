#!/usr/bin/env ts-node

/**
 * 부분 시뮬레이션 실행 (3명)
 */

import { detailedPersonas, WORKSHOP_STAGES, simulateWorkshopStage } from './detailed-pilot-simulation';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

const apiKey = process.env.ANTHROPIC_API_KEY || '';
const anthropic = new Anthropic({ apiKey });

async function runPartialSimulation() {
  console.log('\\n🚀 부분 파일럿 시뮬레이션 (3명)\\n');
  console.log('='.repeat(60));

  // 3명만 선택: 대기업 임원, 스타트업 PM, 중견기업 중간관리자
  const selectedPersonas = detailedPersonas.slice(0, 3);

  const results = [];

  for (const persona of selectedPersonas) {
    console.log(`\\n📊 ${persona.name} (${persona.role})\\n`);
    console.log(`   ${persona.organizationSize} | ${persona.teamSize}명 | ${persona.teamDigitalMaturity}`);

    const stageResponses = [];
    const workshopStart = new Date();

    // 7단계 중 3단계만 먼저 테스트
    const testStages = WORKSHOP_STAGES.slice(0, 3);

    for (let i = 0; i < testStages.length; i++) {
      const stage = testStages[i];
      console.log(`\\n   Stage ${i + 1}: ${stage.name}`);

      try {
        const response = await simulateWorkshopStage(persona, stage, stageResponses);
        stageResponses.push(response);

        console.log(`   ⏱️  ${response.actualMinutes}분 (예상: ${stage.estimatedMinutes}분)`);
        console.log(`   📊 이해도: ${response.comprehensionLevel}/10`);
        console.log(`   💡 참여도: ${response.engagementLevel}/10`);
        console.log(`   🎯 실용성: ${response.practicalityScore}/10`);
        console.log(`   😊 감정: ${response.emotionalState}`);

        if (response.specificChallenges.length > 0) {
          console.log(`   ⚠️  어려움: ${response.specificChallenges[0]}`);
        }
      } catch (error) {
        console.log(`   ❌ 오류: ${error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const totalMinutes = stageResponses.reduce((sum, s) => sum + s.actualMinutes, 0);
    console.log(`\\n   ✅ 완료: 총 ${totalMinutes}분 소요`);

    results.push({
      persona: {
        name: persona.name,
        role: persona.role,
        age: persona.age,
        teamSize: persona.teamSize,
        organizationSize: persona.organizationSize
      },
      stageResponses,
      totalMinutes,
      timestamp: new Date()
    });
  }

  // 결과 저장
  const outputPath = path.join(
    '/Users/crystal/Desktop/new/1-Projects/Work Redesign',
    `partial_pilot_${Date.now()}.json`
  );

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\\n📄 결과 저장: ${outputPath}\\n`);

  // 간단한 요약
  console.log('\\n=== 요약 ===');
  for (const result of results) {
    console.log(`${result.persona.name}: ${result.totalMinutes}분`);
    const avgComprehension = result.stageResponses.reduce((sum, s) => sum + s.comprehensionLevel, 0) / result.stageResponses.length;
    console.log(`  평균 이해도: ${avgComprehension.toFixed(1)}/10`);
  }
}

runPartialSimulation().catch(console.error);