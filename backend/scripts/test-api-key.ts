#!/usr/bin/env ts-node

/**
 * Anthropic API 키 테스트 스크립트
 *
 * .env 파일의 API 키가 유효한지 간단하게 테스트합니다.
 */

import * as dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import * as path from 'path';

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n🔍 Anthropic API 키 테스트 시작\n');
console.log('='.repeat(60));

// 1. 환경 변수 확인
const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

console.log('\n📋 설정 정보:');
console.log(`- API 키 존재: ${apiKey ? '✅' : '❌'}`);
if (apiKey) {
  console.log(`- API 키 길이: ${apiKey.length} 문자`);
  console.log(`- API 키 시작: ${apiKey.substring(0, 20)}...`);
  console.log(`- 사용 모델: ${model}`);
}

if (!apiKey || apiKey === 'sk-ant-api-your-key-here') {
  console.error('\n❌ API 키가 설정되지 않았습니다!');
  console.error('\nbackend/.env 파일을 열어서 ANTHROPIC_API_KEY를 설정해주세요.\n');
  process.exit(1);
}

// 2. Anthropic 클라이언트 초기화
console.log('\n🔌 Anthropic API 연결 테스트...');

const anthropic = new Anthropic({
  apiKey,
});

// 3. 간단한 메시지로 API 테스트
async function testAPI() {
  try {
    console.log('\n📤 테스트 요청 전송 중...');

    const message = await anthropic.messages.create({
      model,
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: '안녕하세요',
        },
      ],
    });

    console.log('\n✅ API 테스트 성공!\n');
    console.log('='.repeat(60));
    console.log('\n📊 응답 정보:');
    console.log(`- 모델: ${message.model}`);
    console.log(`- 응답: ${message.content[0].type === 'text' ? message.content[0].text : '(non-text)'}`);
    console.log(`- Input 토큰: ${message.usage.input_tokens}`);
    console.log(`- Output 토큰: ${message.usage.output_tokens}`);
    console.log(`- Stop reason: ${message.stop_reason}`);

    console.log('\n💰 예상 비용 (참고):');
    const inputCost = (message.usage.input_tokens / 1000000) * 3; // $3 per MTok
    const outputCost = (message.usage.output_tokens / 1000000) * 15; // $15 per MTok
    const totalCost = inputCost + outputCost;
    console.log(`- Input: $${inputCost.toFixed(6)} (${message.usage.input_tokens} tokens)`);
    console.log(`- Output: $${outputCost.toFixed(6)} (${message.usage.output_tokens} tokens)`);
    console.log(`- 총합: $${totalCost.toFixed(6)} (약 ${(totalCost * 1300).toFixed(2)}원)`);

    console.log('\n✅ API 키가 정상적으로 작동합니다!');
    console.log('페르소나 시뮬레이션을 실행할 수 있습니다.\n');

  } catch (error: any) {
    console.error('\n❌ API 테스트 실패!\n');
    console.error('='.repeat(60));

    if (error.status === 401) {
      console.error('\n🔒 인증 오류 (401):');
      console.error('- API 키가 유효하지 않습니다.');
      console.error('- Anthropic Console에서 키 상태를 확인하세요:');
      console.error('  https://console.anthropic.com/settings/keys');
      console.error('\n가능한 원인:');
      console.error('1. API 키가 만료되었거나 비활성화됨');
      console.error('2. API 키 복사 시 공백이나 잘못된 문자 포함');
      console.error('3. 계정 크레딧 소진 또는 계정 정지');

    } else if (error.status === 404) {
      console.error('\n🔍 모델 미검출 (404):');
      console.error(`- 모델 "${model}"을 찾을 수 없습니다.`);
      console.error('\n사용 가능한 모델:');
      console.error('- claude-3-5-sonnet-20241022');
      console.error('- claude-3-5-sonnet-20250122');
      console.error('- claude-3-5-haiku-20241022');
      console.error('- claude-3-opus-20240229');

    } else if (error.status === 429) {
      console.error('\n⏱️ Rate Limit 초과 (429):');
      console.error('- API 호출 한도를 초과했습니다.');
      console.error('- 잠시 후 다시 시도해주세요.');

    } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.error('\n🌐 네트워크 오류:');
      console.error('- 인터넷 연결을 확인해주세요.');
      console.error('- 방화벽이나 프록시 설정을 확인해주세요.');

    } else {
      console.error('\n❓ 알 수 없는 오류:');
      console.error(`- 상태 코드: ${error.status || 'N/A'}`);
      console.error(`- 메시지: ${error.message}`);
    }

    console.error('\n에러 상세:');
    console.error(JSON.stringify(error, null, 2));
    console.error('\n');

    process.exit(1);
  }
}

// 테스트 실행
testAPI().catch((error) => {
  console.error('예상치 못한 오류:', error);
  process.exit(1);
});
