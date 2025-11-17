const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 16:9 비율 (프레젠테이션용)
const VIEWPORT = {
  width: 1920,
  height: 1080
};

// 스크린샷 저장 디렉토리
const SCREENSHOTS_DIR = path.join(__dirname, 'presentation-screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// 지연 함수
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function captureWorkshopFlow() {
  console.log('🚀 워크샵 플로우 스크린샷 캡처 시작...\n');
  console.log('📐 해상도: 1920x1080 (16:9 비율)\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: VIEWPORT,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // 스타일 추가 (스크린샷용 최적화)
    await page.evaluateOnNewDocument(() => {
      // 스크롤바 숨기기
      const style = document.createElement('style');
      style.textContent = `
        ::-webkit-scrollbar { display: none !important; }
        * { scrollbar-width: none !important; }
      `;
      document.head.appendChild(style);
    });

    // 1. 랜딩 페이지
    console.log('📸 [1/9] 랜딩 페이지 캡처...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    await delay(3000); // 애니메이션 완료 대기

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01_landing_home.png'),
      fullPage: false
    });

    // 랜딩 페이지 스크롤 후 캡처 (Features 섹션)
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await delay(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02_landing_features.png'),
      fullPage: false
    });

    // 2. 워크샵 시작
    console.log('📸 [2/9] 워크샵 시작 페이지...');
    await page.goto('http://localhost:3000/workshop', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    await delay(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03_workshop_step1_start.png'),
      fullPage: false
    });

    // Step 1 입력 후 진행
    await page.evaluate(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = '팀원 역량 개발 프로그램 기획, 업무 프로세스 개선 연구, 신기술 도입 검토';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await delay(1000);

    // 다음 버튼 클릭
    await page.click('button:has-text("다음 단계로")').catch(() => {
      console.log('다음 단계 버튼 찾기 시도...');
      return page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const nextButton = buttons.find(btn =>
          btn.textContent.includes('다음') ||
          btn.textContent.includes('시작')
        );
        if (nextButton) nextButton.click();
      });
    });

    // 3. Step 2: 업무 영역 정의
    console.log('📸 [3/9] 업무 영역 정의...');
    await delay(2000);

    // 업무 영역 입력
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      const domains = [
        '고객 지원 및 CS 관리',
        '마케팅 캠페인 운영',
        '데이터 분석 및 리포팅'
      ];

      inputs.forEach((input, index) => {
        if (index < domains.length) {
          input.value = domains[index];
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
    await delay(1500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04_workshop_step2_domains.png'),
      fullPage: false
    });

    // 다음 단계로
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextButton = buttons.find(btn => btn.textContent.includes('다음'));
      if (nextButton) nextButton.click();
    });

    // 4. Step 3: 업무 내용 입력 (영역별)
    console.log('📸 [4/9] 업무 내용 입력...');
    await delay(2000);

    // 업무 영역별로 직접 입력
    await page.evaluate(() => {
      const textareas = document.querySelectorAll('textarea');
      const domainTasks = {
        '고객 지원 및 CS 관리': `- 매일 오전 9시 고객 문의 메일 확인 및 답변 (일 30분 소요)
- 월간 고객 만족도 조사 실시 및 보고서 작성 (월 3시간 소요)
- 고객 VOC 수집 및 개선 사항 도출 (주 1시간 소요)`,
        '마케팅 캠페인 운영': `- 주간 마케팅 캠페인 성과 데이터 수집 및 정리 (주 2시간 소요)
- 분기별 경쟁사 마케팅 전략 분석 리포트 작성 (분기 5시간 소요)
- 신규 마케팅 캠페인 기획 및 실행 계획 수립 (월 2회, 각 4시간 소요)
- 마케팅 자동화 도구 관리 및 운영 (일 1시간 소요)`,
        '데이터 분석 및 리포팅': `- A/B 테스트 설계 및 결과 분석 (주 3시간 소요)
- 주간 데이터 트렌드 분석 및 인사이트 도출 (주 2시간 소요)
- 월간 KPI 리포트 작성 및 발표 (월 4시간 소요)`
      };

      textareas.forEach((textarea, index) => {
        const values = Object.values(domainTasks);
        if (index < values.length) {
          textarea.value = values[index];
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        }
      });
    });
    await delay(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05_workshop_step3_input.png'),
      fullPage: false
    });

    // 다음 단계로 (워크샵 생성)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextButton = buttons.find(btn => btn.textContent.includes('다음'));
      if (nextButton) nextButton.click();
    });

    // 5. Step 4: 업무 추출 결과
    console.log('📸 [5/9] 업무 추출 결과...');
    await delay(3000); // 페이지 로드 대기

    // 업무 추출 버튼 클릭
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const extractButton = buttons.find(btn =>
        btn.textContent.includes('업무 추출') ||
        btn.textContent.includes('분석 시작')
      );
      if (extractButton) extractButton.click();
    });

    await delay(5000); // AI 분석 대기

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '06_workshop_step4_extraction.png'),
      fullPage: false
    });

    // 6. Step 5: AI 컨설팅 (시뮬레이션)
    console.log('📸 [6/9] AI 자동화 컨설팅...');

    // Step 5 컴포넌트가 있다면 캡처
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextButton = buttons.find(btn => btn.textContent.includes('다음'));
      if (nextButton) nextButton.click();
    });
    await delay(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '07_workshop_step5_ai_consulting.png'),
      fullPage: false
    });

    // 7. Step 6: 워크플로우 설계
    console.log('📸 [7/9] 워크플로우 설계...');

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextButton = buttons.find(btn => btn.textContent.includes('다음'));
      if (nextButton) nextButton.click();
    });
    await delay(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '08_workshop_step6_workflow.png'),
      fullPage: false
    });

    // 8. Step 7: 결과 확인
    console.log('📸 [8/9] 최종 결과...');

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextButton = buttons.find(btn => btn.textContent.includes('다음') || btn.textContent.includes('완료'));
      if (nextButton) nextButton.click();
    });
    await delay(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '09_workshop_step7_results.png'),
      fullPage: false
    });

    // 9. 칸반 보드 (보너스)
    console.log('📸 [9/9] 칸반 보드...');
    await page.goto('http://localhost:3000/kanban', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    await delay(2000);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '10_kanban_board.png'),
      fullPage: false
    });

    // 완료 메시지
    console.log('\n✅ 모든 스크린샷 캡처 완료!\n');
    console.log('📁 저장 위치:', SCREENSHOTS_DIR);
    console.log('\n📊 생성된 파일 목록:');

    const files = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png'));
    files.sort().forEach((file, index) => {
      const filePath = path.join(SCREENSHOTS_DIR, file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`   ${index + 1}. ${file} (${size} MB)`);
    });

    console.log('\n💡 프레젠테이션 사용 팁:');
    console.log('   - 16:9 비율로 최적화된 이미지입니다');
    console.log('   - PowerPoint나 Keynote에 바로 삽입 가능합니다');
    console.log('   - 필요시 이미지 편집 도구로 추가 편집 가능합니다');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.log('\n💡 수동 캡처 방법:');
    console.log('   1. 브라우저 개발자 도구 열기 (F12)');
    console.log('   2. Device Toolbar 토글 (Ctrl+Shift+M)');
    console.log('   3. Dimensions를 1920x1080으로 설정');
    console.log('   4. 각 단계별로 스크린샷 캡처 (Ctrl+Shift+P → "Capture screenshot")');
  } finally {
    await browser.close();
  }
}

// 실행
captureWorkshopFlow().catch(console.error);