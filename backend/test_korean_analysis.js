#!/usr/bin/env node

/**
 * 한국어 문서 분석 테스트 스크립트
 * Korean Document Analysis Test Script
 */

const { WorkshopService } = require('./dist/services/workshopService');
const { DocumentProcessor } = require('./dist/services/documentProcessor');
const { AIAnalysisService } = require('./dist/services/aiAnalysisService');

async function testKoreanDocumentAnalysis() {
  console.log('🚀 한국어 문서 분석 테스트 시작\n');

  try {
    // 1. 워크샵 생성
    console.log('1️⃣ 워크샵 생성...');
    const workshopService = new WorkshopService();
    const workshop = workshopService.createWorkshop({
      name: '업무 자동화 분석 워크샵',
      domains: ['업무관리', '고객서비스', '재고관리', '문서관리', '기타'],
      participantCount: 1
    });
    console.log(`✅ 워크샵 생성됨: ${workshop.id}\n`);

    // 2. 테스트 문서 파싱
    console.log('2️⃣ 한국어 문서 파싱...');
    const documentText = await DocumentProcessor.parseDocument(
      '/tmp/test_document.txt',
      'text/plain'
    );
    console.log(`✅ 문서 파싱 완료: ${documentText.length}자\n`);

    // 3. AI 분석 수행
    console.log('3️⃣ AI 분석 수행...');
    const aiService = new AIAnalysisService();
    const tasks = await aiService.analyzeTasks(documentText, workshop.domains);
    console.log(`✅ AI 분석 완료: ${tasks.length}개 업무 추출\n`);

    // 4. 결과 출력
    console.log('📊 분석 결과:');
    console.log('='.repeat(50));

    tasks.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.title}`);
      console.log(`   설명: ${task.description.substring(0, 100)}...`);
      console.log(`   소요시간: ${task.timeSpent}시간`);
      console.log(`   빈도: ${task.frequency}`);
      console.log(`   자동화 가능성: ${task.automation}`);
      console.log(`   자동화 방법: ${task.automationMethod.substring(0, 80)}...`);
      console.log(`   카테고리: ${task.category}`);
    });

    // 5. 템플릿 생성 테스트
    if (tasks.length > 0) {
      console.log('\n4️⃣ 템플릿 생성 테스트...');

      // 첫 번째 업무에 대해 AI 프롬프트 템플릿 생성
      const testTask = {
        ...tasks[0],
        id: 'TEST_TASK_001',
        sourceFileId: 'TEST_FILE_001',
        sourceFilename: 'test_document.txt',
        workshopId: workshop.id,
        createdAt: new Date()
      };

      const templates = await aiService.generateAutomationTemplates([testTask], 'ai_prompt');

      if (templates.length > 0) {
        console.log(`✅ 템플릿 생성 완료: ${templates.length}개`);
        console.log(`템플릿 이름: ${templates[0].name}`);
        console.log(`템플릿 내용 (미리보기):\n${templates[0].content.substring(0, 200)}...\n`);
      }
    }

    console.log('🎉 테스트 완료! 한국어 문서 분석이 정상적으로 작동합니다.');

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.error('상세 오류:', error);
  }
}

// 환경변수 확인
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️  경고: ANTHROPIC_API_KEY가 설정되지 않았습니다.');
  console.warn('실제 AI 분석은 건너뛰고 모의 분석을 수행합니다.\n');
}

// 테스트 실행
testKoreanDocumentAnalysis();