import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

async function captureWorkshopScreenshots() {
  // 스크린샷 저장 폴더 생성
  const screenshotDir = join(process.cwd(), 'workshop-screenshots-full');
  mkdirSync(screenshotDir, { recursive: true });
  console.log(`📁 스크린샷 폴더 생성: ${screenshotDir}`);

  const browser = await chromium.launch({
    headless: false,  // 브라우저를 보이게 해서 진행 상황 확인
    slowMo: 100       // 조금 느리게 해서 안정적으로
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
      'step05-업무상세-입력완료',
      'step06-업무추출-API완료',
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

      // Step 5: 업무 상세 - 실제 내용 입력
      if (stepNum === 5) {
        console.log('✍️  Step 5: 업무 내용 입력 중...');

        const testData = {
          '고객 문의 처리': `매일 오전 9시 이메일 확인 (30분)
고객 문의 분류 및 답변 (2시간)
긴급 문의 처리 (1시간)
주간 문의 통계 정리 (1시간)`,
          '데이터 분석 및 리포트': `주간 데이터 수집 (1시간)
Excel 데이터 정제 (2시간)
리포트 작성 및 차트 생성 (3시간)
경영진 보고 자료 준비 (2시간)`,
          '회의 및 보고': `일일 스탠드업 미팅 (30분)
주간 팀 회의 (1시간)
월간 보고서 작성 (4시간)
고객사 미팅 준비 및 참석 (2시간)`
        };

        // 각 영역의 텍스트 입력
        for (const [domain, content] of Object.entries(testData)) {
          const selector = `textarea[placeholder*="${domain}"]`;
          const textarea = page.locator(selector).first();

          if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
            await textarea.fill(content);
            console.log(`   ✅ ${domain} 내용 입력 완료`);
          }
        }

        await page.waitForTimeout(1000);
      }

      // Step 6: 업무 추출 - API 응답 대기
      if (stepNum === 6) {
        console.log('⏳ Step 6: 업무 추출 API 응답 대기 중...');

        // 로딩 상태가 사라질 때까지 대기
        await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 30000 })
          .catch(() => console.log('   ℹ️  로딩 인디케이터 없음'));

        // 업무 카드가 표시될 때까지 대기
        await page.waitForSelector('[class*="backdrop-blur"]', { timeout: 10000 })
          .catch(() => console.log('   ⚠️  업무 카드를 찾을 수 없음'));

        // 추가 대기 시간 (API 응답 후 렌더링)
        await page.waitForTimeout(3000);
        console.log('   ✅ 업무 추출 완료!');
      }

      // 페이지가 완전히 로드될 때까지 대기
      await page.waitForTimeout(2000);

      // 스크린샷을 위해 overflow 제한 제거 및 실제 컨텐츠 높이 계산
      const { width, height } = await page.evaluate(() => {
        // h-screen과 overflow-hidden을 제거하여 전체 컨텐츠 표시
        const mainContainer = document.querySelector('.h-screen');
        if (mainContainer) {
          mainContainer.classList.remove('h-screen', 'overflow-hidden');
          mainContainer.classList.add('min-h-screen');
        }

        // 모든 min-h-screen 요소들이 자연스럽게 확장되도록 대기
        const allContainers = document.querySelectorAll('.min-h-screen');
        allContainers.forEach(el => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.minHeight = 'auto';
        });

        // 실제 컨텐츠 높이 계산
        const body = document.body;
        const html = document.documentElement;

        const height = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );

        return { width: 1920, height };
      });

      console.log(`   📏 실제 컨텐츠 높이: ${height}px`);

      // 약간의 대기 시간으로 레이아웃 재계산
      await page.waitForTimeout(500);

      // 전체 페이지 스크린샷
      const screenshotPath = join(screenshotDir, `${stepName}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        type: 'png'
      });
      console.log(`✅ 저장됨: ${stepName}.png (${height}px 높이)`);

      // 마지막 단계가 아니면 다음 단계로 이동
      if (i < stepNames.length - 1) {
        console.log(`⚡ 빠른 테스트 버튼 클릭...`);

        // 빠른 테스트 버튼 찾기 및 클릭
        const quickTestButton = page.locator('button:has-text("빠른 테스트")');

        if (await quickTestButton.isVisible()) {
          await quickTestButton.click();
          console.log(`⏳ Step ${stepNum + 1}로 전환 대기 중...`);

          // 다음 단계로 넘어갈 때까지 대기
          await page.waitForTimeout(1500);
        } else {
          console.log('⚠️  빠른 테스트 버튼을 찾을 수 없습니다.');
        }
      }
    }

    console.log('\n✨ 모든 스크린샷 캡처 완료!');
    console.log(`📂 저장 위치: ${screenshotDir}`);
    console.log('\n📋 캡처된 파일 목록:');
    stepNames.forEach((name, idx) => {
      console.log(`   ${idx + 1}. ${name}.png`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

// 스크립트 실행
captureWorkshopScreenshots().catch(console.error);
