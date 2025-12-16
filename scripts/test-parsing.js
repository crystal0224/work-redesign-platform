/**
 * Test Word Document Parsing
 *
 * Uses the same mammoth library as workshop-server.js
 * to verify the sample document can be parsed correctly.
 */

const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

async function testParsing() {
  const filePath = path.join(__dirname, '..', 'demo', 'sample-work-description.docx');

  console.log(`📄 파싱 테스트 시작: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error('❌ 파일이 존재하지 않습니다. 먼저 generate-sample-docx.js를 실행하세요.');
    process.exit(1);
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });

    console.log('\n✅ 파싱 성공!\n');
    console.log('='.repeat(60));
    console.log('추출된 텍스트:');
    console.log('='.repeat(60));
    console.log(result.value);
    console.log('='.repeat(60));
    console.log(`\n📊 총 문자 수: ${result.value.length}자`);

    // Check for expected content
    const expectedKeywords = ['광고 성과 리포트', '경쟁사 모니터링', '자동화', '마케팅팀'];
    const foundKeywords = expectedKeywords.filter(kw => result.value.includes(kw));

    console.log(`\n🔍 키워드 검증: ${foundKeywords.length}/${expectedKeywords.length} 발견`);
    if (foundKeywords.length === expectedKeywords.length) {
      console.log('✅ 모든 키워드가 정상적으로 파싱되었습니다!');
    } else {
      console.log('⚠️ 일부 키워드가 누락되었습니다:', expectedKeywords.filter(kw => !foundKeywords.includes(kw)));
    }

  } catch (error) {
    console.error('❌ 파싱 실패:', error.message);
    process.exit(1);
  }
}

testParsing();
