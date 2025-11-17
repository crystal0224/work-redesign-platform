#!/usr/bin/env node

/**
 * 간단한 한국어 문서 분석 테스트
 * Simple Korean Document Analysis Test
 */

const fs = require('fs').promises;
const path = require('path');

async function testDocumentReading() {
  console.log('🚀 한국어 문서 읽기 테스트\n');

  try {
    // 테스트 문서 읽기
    const documentPath = '/tmp/test_document.txt';
    const documentText = await fs.readFile(documentPath, 'utf-8');

    console.log('📄 문서 내용:');
    console.log('='.repeat(50));
    console.log(documentText);
    console.log('='.repeat(50));

    console.log(`\n📊 분석 결과:`);
    console.log(`- 문서 길이: ${documentText.length}자`);
    console.log(`- 줄 수: ${documentText.split('\n').length}줄`);

    // 업무 패턴 추출 시뮬레이션
    const lines = documentText.split('\n');
    const tasks = [];

    let currentTask = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // 번호가 있는 제목 라인 찾기 (1., 2., 3., 4.)
      const titleMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
      if (titleMatch) {
        if (currentTask) {
          tasks.push(currentTask);
        }
        currentTask = {
          number: titleMatch[1],
          title: titleMatch[2],
          details: []
        };
      } else if (currentTask && trimmed.startsWith('-')) {
        currentTask.details.push(trimmed.substring(1).trim());
      }
    }

    if (currentTask) {
      tasks.push(currentTask);
    }

    console.log(`\n🔍 추출된 업무 (${tasks.length}개):`);
    tasks.forEach(task => {
      console.log(`\n${task.number}. ${task.title}`);
      task.details.forEach(detail => {
        console.log(`   - ${detail}`);
      });

      // 시간과 빈도 정보 추출
      const timeInfo = task.details.find(d => d.includes('소요 시간') || d.includes('시간'));
      const freqInfo = task.details.find(d => d.includes('빈도') || d.includes('매일') || d.includes('매주') || d.includes('매월'));

      if (timeInfo) console.log(`   ⏱️  ${timeInfo}`);
      if (freqInfo) console.log(`   📅 ${freqInfo}`);
    });

    console.log('\n✅ 문서 읽기 및 기본 분석 완료!');
    console.log('💡 다음 단계: AI 서비스를 통한 자동화 분석');

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

// 테스트 실행
testDocumentReading();