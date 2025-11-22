#!/usr/bin/env ts-node

/**
 * 5개 팀장 페르소나로 빠른 시뮬레이션 테스트
 */

import * as dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.ANTHROPIC_API_KEY || '';

// Anthropic API 클라이언트
const anthropic = new Anthropic({ apiKey });

// 5개 테스트 페르소나
const testPersonas = [
  {
    id: 'T1',
    name: '김영희',
    role: '마케팅팀 팀장',
    teamSize: 5,
    teamDigitalMaturity: '초보',
    jobFunction: '마케팅',
  },
  {
    id: 'T2',
    name: '박철수',
    role: '생산관리팀 팀장',
    teamSize: 7,
    teamDigitalMaturity: '중급',
    jobFunction: '제조',
  },
  {
    id: 'T3',
    name: '이준호',
    role: 'AI연구팀 팀장',
    teamSize: 4,
    teamDigitalMaturity: '고급',
    jobFunction: 'R&D',
  },
  {
    id: 'T4',
    name: '윤서영',
    role: 'HR팀 팀장',
    teamSize: 4,
    teamDigitalMaturity: '초보',
    jobFunction: 'Staff',
  },
  {
    id: 'T5',
    name: '강민철',
    role: '재무팀 팀장',
    teamSize: 5,
    teamDigitalMaturity: '중급',
    jobFunction: 'Staff',
  },
];

async function runQuickTest() {
  console.log('\n🚀 빠른 테스트 시뮬레이션 (5개 팀)\n');
  console.log('모델: Claude 4.5 Haiku (claude-haiku-4-5-20251001)\n');

  const results = [];

  for (const persona of testPersonas) {
    console.log(`\n테스트 중: ${persona.name} (${persona.role})...`);

    const prompt = `당신은 ${persona.name} ${persona.role}입니다.
팀 규모: ${persona.teamSize}명
팀 디지털 성숙도: ${persona.teamDigitalMaturity}
직무: ${persona.jobFunction}

SK 아카데미의 35분 AI 자동화 워크샵에 참여했습니다.
팀장 관점에서 이 워크샵이 팀 자동화에 실제로 도움이 될지 평가해주세요.

짧게 3-4문장으로 답변해주세요.`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      const response = message.content[0].type === 'text'
        ? message.content[0].text
        : 'No response';

      console.log(`✅ 완료`);

      results.push({
        persona,
        response,
        tokens: message.usage,
      });

    } catch (error: any) {
      console.log(`❌ 실패: ${error.message}`);
      results.push({
        persona,
        error: error.message,
      });
    }
  }

  // 결과 저장
  const outputPath = path.join(
    '/Users/crystal/Desktop/new/1-Projects/Work Redesign',
    `quick_test_${Date.now()}.json`
  );

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 결과 저장: ${outputPath}\n`);

  // 요약 출력
  console.log('\n=== 테스트 요약 ===');
  console.log(`성공: ${results.filter(r => !r.error).length}개`);
  console.log(`실패: ${results.filter(r => r.error).length}개`);

  const totalTokens = results
    .filter(r => r.tokens)
    .reduce((sum, r) => sum + r.tokens.input_tokens + r.tokens.output_tokens, 0);

  console.log(`총 토큰: ${totalTokens}`);
  console.log(`예상 비용: $${(totalTokens / 1000000 * 6).toFixed(4)}\n`);
}

runQuickTest().catch(console.error);