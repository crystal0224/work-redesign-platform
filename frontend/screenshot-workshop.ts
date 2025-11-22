import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

async function captureWorkshopScreenshots() {
  // 스크린샷 저장 폴더 생성
  const screenshotDir = join(process.cwd(), 'workshop-screenshots');
  mkdirSync(screenshotDir, { recursive: true });
  console.log(`📁 스크린샷 폴더 생성: ${screenshotDir}`);

  const browser = await chromium.launch({
    headless: false,  // 브라우저를 보이게 해서 진행 상황 확인
    slowMo: 500       // 동작을 천천히 해서 확인하기 쉽게
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 워크샵 페이지로 이동
    console.log('🌐 워크샵 페이지 로딩...');
    await page.goto('http://localhost:3000/workshop', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    await page.waitForTimeout(2000);

    const stepNames = [
      'step01-시작화면',
      'step02-기본정보',
      'step03-팀현황',
      'step04-업무영역',
      'step05-업무상세',
      'step06-업무추출',
      'step07-요약',
      'step08-워크플로우교육',
      'step09-AI컨설팅',
      'step10-워크플로우설계',
      'step11-자동화솔루션'
    ];

    for (let i = 0; i < stepNames.length; i++) {
      const stepNum = i + 1;
      const stepName = stepNames[i];

      console.log(`\n📸 Step ${stepNum} 캡처 중: ${stepName}`);

      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForTimeout(2000);

      // 전체 페이지 스크린샷 (스크롤 포함)
      const screenshotPath = join(screenshotDir, `${stepName}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      console.log(`✅ 저장됨: ${stepName}.png`);

      // 마지막 단계가 아니면 다음 단계로 이동
      if (i < stepNames.length - 1) {
        console.log(`⚡ 빠른 테스트 버튼 클릭...`);

        // 빠른 테스트 버튼 찾기 및 클릭
        const quickTestButton = page.locator('button:has-text("빠른 테스트")');

        if (await quickTestButton.isVisible()) {
          await quickTestButton.click();
          console.log(`⏳ Step ${stepNum + 1}로 전환 대기 중...`);

          // 다음 단계로 넘어갈 때까지 대기
          await page.waitForTimeout(1000);
        } else {
          console.log('⚠️  빠른 테스트 버튼을 찾을 수 없습니다.');
        }
      }
    }

    console.log('\n✨ 모든 스크린샷 캡처 완료!');
    console.log(`📂 저장 위치: ${screenshotDir}`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

// 스크립트 실행
captureWorkshopScreenshots().catch(console.error);
