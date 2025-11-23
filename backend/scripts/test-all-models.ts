#!/usr/bin/env ts-node

/**
 * 모든 Claude 모델 테스트 스크립트
 * 사용 가능한 모델을 찾고 최적의 선택을 제안합니다
 */

import * as dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import * as path from 'path';

// .env 파일 로드 (backend 폴더의 .env 파일 명시적 지정)
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey || apiKey === 'your-api-key-here') {
  console.error('❌ API 키가 설정되지 않았습니다!');
  process.exit(1);
}

console.log('\n🔍 Claude 모델 테스트 시작\n');
console.log('='.repeat(60));
console.log('📋 API 키 정보:');
console.log(`- API 키 시작: ${apiKey.substring(0, 20)}...`);
console.log(`- API 키 길이: ${apiKey.length} 문자\n`);

const anthropic = new Anthropic({ apiKey });

// 2025년 1월 기준 최신 Claude 모델 목록
const models = [
  // Claude 3.5 Sonnet (최신)
  { id: 'claude-3-5-sonnet-20250122', name: 'Claude 3.5 Sonnet (2025-01-22)', type: 'sonnet', latest: true },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (2024-10-22)', type: 'sonnet' },

  // Claude 3.5 Haiku
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (2024-10-22)', type: 'haiku' },

  // Claude 3 Opus
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (2024-02-29)', type: 'opus' },

  // Claude 3 Sonnet (이전 버전)
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet (2024-02-29)', type: 'sonnet-old' },

  // Claude 3 Haiku (이전 버전)
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (2024-03-07)', type: 'haiku-old' },

  // Claude 2.1 (레거시)
  { id: 'claude-2.1', name: 'Claude 2.1 (Legacy)', type: 'legacy' },
  { id: 'claude-2.0', name: 'Claude 2.0 (Legacy)', type: 'legacy' },

  // Claude Instant
  { id: 'claude-instant-1.2', name: 'Claude Instant 1.2', type: 'instant' }
];

interface TestResult {
  model: typeof models[0];
  success: boolean;
  error?: string;
  responseTime?: number;
  tokensUsed?: number;
  costEstimate?: string;
}

const results: TestResult[] = [];

async function testModel(model: typeof models[0]): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log(`\n📤 테스트 중: ${model.name}...`);

    const message = await anthropic.messages.create({
      model: model.id,
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: '1+1=?'
        }
      ]
    });

    const responseTime = Date.now() - startTime;
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

    // 모델별 예상 비용 계산 (1M 토큰당 달러)
    let inputPrice = 0;
    let outputPrice = 0;

    if (model.type === 'sonnet' || model.id.includes('sonnet-2025')) {
      inputPrice = 3;  // $3 per MTok
      outputPrice = 15; // $15 per MTok
    } else if (model.type === 'haiku') {
      inputPrice = 0.25;  // $0.25 per MTok
      outputPrice = 1.25; // $1.25 per MTok
    } else if (model.type === 'opus') {
      inputPrice = 15;  // $15 per MTok
      outputPrice = 75;  // $75 per MTok
    } else if (model.type === 'instant') {
      inputPrice = 0.163; // $0.163 per MTok
      outputPrice = 0.551; // $0.551 per MTok
    }

    const cost = (message.usage.input_tokens / 1000000) * inputPrice +
                 (message.usage.output_tokens / 1000000) * outputPrice;

    console.log(`  ✅ 성공! (응답시간: ${responseTime}ms, 토큰: ${tokensUsed})`);

    return {
      model,
      success: true,
      responseTime,
      tokensUsed,
      costEstimate: `$${cost.toFixed(6)}`
    };

  } catch (error: any) {
    let errorMessage = '알 수 없는 오류';

    if (error.status === 401) {
      errorMessage = '인증 실패 (Invalid API Key)';
    } else if (error.status === 404) {
      errorMessage = '모델 미검출 (Not Available)';
    } else if (error.status === 403) {
      errorMessage = '권한 없음 (No Access)';
    } else if (error.status === 429) {
      errorMessage = 'Rate Limit 초과';
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.log(`  ❌ 실패: ${errorMessage}`);

    return {
      model,
      success: false,
      error: errorMessage
    };
  }
}

async function runTests() {
  console.log('\n🚀 모든 모델 테스트 시작...\n');
  console.log('각 모델에 대해 간단한 테스트를 실행합니다.');
  console.log('이 작업은 1-2분 정도 소요될 수 있습니다.\n');
  console.log('='.repeat(60));

  // 모든 모델 테스트
  for (const model of models) {
    const result = await testModel(model);
    results.push(result);

    // Rate limit 방지를 위한 짧은 대기
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 테스트 결과 요약\n');
  console.log('='.repeat(60));

  const successfulModels = results.filter(r => r.success);
  const failedModels = results.filter(r => !r.success);

  if (successfulModels.length > 0) {
    console.log('\n✅ 사용 가능한 모델:\n');
    successfulModels.forEach(result => {
      console.log(`  • ${result.model.name}`);
      console.log(`    - 모델 ID: ${result.model.id}`);
      console.log(`    - 응답 시간: ${result.responseTime}ms`);
      console.log(`    - 예상 비용: ${result.costEstimate} per request`);
      if (result.model.latest) {
        console.log(`    - ⭐ 최신 버전`);
      }
      console.log('');
    });

    // 최적 모델 추천
    console.log('\n💡 추천 모델:\n');

    const bestSonnet = successfulModels.find(r => r.model.type === 'sonnet' && r.model.latest);
    const bestHaiku = successfulModels.find(r => r.model.type === 'haiku');
    const bestOpus = successfulModels.find(r => r.model.type === 'opus');

    if (bestSonnet) {
      console.log(`  🥇 최고 성능: ${bestSonnet.model.name}`);
      console.log(`     - 복잡한 작업에 최적 (페르소나 시뮬레이션 추천)`);
    }

    if (bestHaiku) {
      console.log(`  🥈 비용 효율: ${bestHaiku.model.name}`);
      console.log(`     - 빠른 응답과 저비용 (간단한 작업에 추천)`);
    }

    if (bestOpus) {
      console.log(`  🥉 최고급 모델: ${bestOpus.model.name}`);
      console.log(`     - 가장 정교한 응답 (중요한 작업에 추천)`);
    }
  }

  if (failedModels.length > 0) {
    console.log('\n\n❌ 사용 불가능한 모델:\n');
    failedModels.forEach(result => {
      console.log(`  • ${result.model.name}: ${result.error}`);
    });
  }

  // .env 파일 업데이트 제안
  console.log('\n\n📝 .env 파일 업데이트 제안:\n');
  console.log('='.repeat(60));

  if (successfulModels.length > 0) {
    const recommended = bestSonnet || bestHaiku || successfulModels[0];
    console.log(`\nbackend/.env 파일에서 다음과 같이 설정하세요:\n`);
    console.log(`ANTHROPIC_MODEL=${recommended.model.id}`);
    console.log(`\n또는 페르소나 시뮬레이션 실행 시 직접 지정:`);
    console.log(`\nANTHROPIC_MODEL="${recommended.model.id}" npx ts-node scripts/persona-simulation-v2.ts`);
  } else {
    console.log('\n⚠️ 사용 가능한 모델이 없습니다!');
    console.log('API 키 권한을 확인해주세요.');
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✨ 테스트 완료!\n');
}

// 테스트 실행
runTests().catch(error => {
  console.error('예상치 못한 오류:', error);
  process.exit(1);
});