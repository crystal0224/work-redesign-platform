const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 16:9 비율 (Full HD 해상도)
const VIEWPORT = {
  width: 1920,
  height: 1080
};

// 스크린샷 저장 디렉토리 생성
const SCREENSHOTS_DIR = path.join(__dirname, 'presentation-screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// 워크샵 단계별 데이터
const WORKSHOP_STEPS = [
  { step: 1, name: '워크샵_시작', description: '워크샵 소개 및 목표 설정' },
  { step: 2, name: '업무영역_정의', description: '담당 업무 영역 정의' },
  { step: 3, name: '업무_입력', description: '문서 업로드 및 직접 입력' },
  { step: 4, name: '업무_추출_결과', description: 'AI 업무 분석 결과' },
  { step: 5, name: 'AI_컨설팅', description: 'AI 자동화 컨설팅' },
  { step: 6, name: '워크플로우_설계', description: '자동화 워크플로우 설계' },
  { step: 7, name: '결과_확인', description: '최종 결과 및 다운로드' }
];

async function captureScreenshots() {
  console.log('🚀 스크린샷 캡처 시작...\n');

  // 브라우저 실행
  const browser = await puppeteer.launch({
    headless: false, // 실행 과정을 볼 수 있도록
    defaultViewport: VIEWPORT,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // 1. 랜딩 페이지 캡처
    console.log('📸 랜딩 페이지 캡처 중...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    await page.waitForTimeout(2000); // 애니메이션 완료 대기

    const landingPath = path.join(SCREENSHOTS_DIR, '00_landing_page.png');
    await page.screenshot({
      path: landingPath,
      fullPage: false // viewport 크기만큼만 캡처
    });
    console.log(`✅ 저장됨: ${landingPath}`);

    // 2. 워크샵 페이지로 이동
    console.log('\n📸 워크샵 페이지 캡처 시작...');
    await page.goto('http://localhost:3000/workshop', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // 3. 각 워크샵 단계 캡처
    for (const stepInfo of WORKSHOP_STEPS) {
      console.log(`\n📸 Step ${stepInfo.step}: ${stepInfo.description} 캡처 중...`);

      // 해당 단계로 이동 (개발자 도구 콘솔에서 상태 변경)
      await page.evaluate((step) => {
        // React 상태를 직접 변경하는 방법
        // Next.js app의 경우 window에서 접근 가능한 방법 찾기
        const nextButton = document.querySelector('button[class*="bg-gradient-to-r"]');

        // Step 2로 이동하는 예시 (업무 영역 입력)
        if (step === 2 && nextButton) {
          nextButton.click();
        }
      }, stepInfo.step);

      // 단계별 샘플 데이터 입력 (필요한 경우)
      if (stepInfo.step === 2) {
        // 업무 영역 샘플 입력
        await page.evaluate(() => {
          const inputs = document.querySelectorAll('input[type="text"]');
          const domains = ['고객 지원 및 문의 처리', '마케팅 캠페인 기획', '데이터 분석 및 보고'];
          inputs.forEach((input, index) => {
            if (index < domains.length && index < 3) {
              input.value = domains[index];
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          });
        });
      }

      if (stepInfo.step === 3) {
        // 직접 입력 샘플
        await page.evaluate(() => {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            textarea.value = `- 매일 오전 9시 고객 문의 메일 확인 및 답변 (30분 소요)
- 주간 마케팅 성과 데이터 수집 및 보고서 작성 (매주 월요일, 2시간 소요)
- 월간 고객 만족도 조사 실시 및 분석 (매월 말, 3시간 소요)
- 분기별 경쟁사 마케팅 전략 분석 (분기당 1회, 5시간 소요)
- 신규 캠페인 기획 및 실행 계획 수립 (월 2회, 각 4시간 소요)`;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      }

      // 애니메이션 완료 대기
      await page.waitForTimeout(1500);

      // 스크린샷 캡처
      const screenshotPath = path.join(
        SCREENSHOTS_DIR,
        `0${stepInfo.step}_${stepInfo.name}.png`
      );

      await page.screenshot({
        path: screenshotPath,
        fullPage: false
      });

      console.log(`✅ 저장됨: ${screenshotPath}`);
    }

    // 4. 칸반 보드 페이지 캡처 (보너스)
    console.log('\n📸 칸반 보드 페이지 캡처 중...');
    await page.goto('http://localhost:3000/kanban', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    await page.waitForTimeout(2000);

    const kanbanPath = path.join(SCREENSHOTS_DIR, '08_kanban_board.png');
    await page.screenshot({
      path: kanbanPath,
      fullPage: false
    });
    console.log(`✅ 저장됨: ${kanbanPath}`);

    console.log('\n🎉 모든 스크린샷 캡처 완료!');
    console.log(`📁 저장 위치: ${SCREENSHOTS_DIR}`);
    console.log('\n📊 생성된 파일:');

    const files = fs.readdirSync(SCREENSHOTS_DIR);
    files.sort().forEach(file => {
      const stats = fs.statSync(path.join(SCREENSHOTS_DIR, file));
      const size = (stats.size / 1024).toFixed(2);
      console.log(`   - ${file} (${size} KB)`);
    });

  } catch (error) {
    console.error('❌ 스크린샷 캡처 중 오류:', error);
  } finally {
    await browser.close();
  }
}

// 메인 실행
(async () => {
  try {
    await captureScreenshots();
  } catch (error) {
    console.error('오류 발생:', error);
    process.exit(1);
  }
})();