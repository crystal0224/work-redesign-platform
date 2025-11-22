const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 스크린샷 저장 디렉토리
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');

// 디렉토리가 없으면 생성
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureWorkshopScreenshots() {
    console.log('🚀 Starting workshop screenshot capture with Playwright...\n');

    let browser;
    try {
        // Playwright로 브라우저 실행
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });

        const page = await context.newPage();

        // 워크샵 페이지로 이동
        console.log('📍 Navigating to workshop page...');
        await page.goto('http://localhost:3000/workshop', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Step 1-11까지 반복
        for (let step = 1; step <= 11; step++) {
            console.log(`\n📸 Capturing Step ${step}...`);

            // 페이지가 완전히 로드될 때까지 대기
            await page.waitForTimeout(2500);

            // 전체 페이지 스크린샷 캡처 (스크롤 포함)
            const screenshotPath = path.join(SCREENSHOT_DIR, `step_${step}_fullpage.png`);
            await page.screenshot({
                path: screenshotPath,
                fullPage: true, // 🔥 전체 페이지 캡처 (스크롤 포함)
                type: 'png'
            });

            console.log(`   ✅ Saved: ${screenshotPath}`);

            // 마지막 단계가 아니면 "빠른 테스트" 버튼 클릭
            if (step < 11) {
                try {
                    // XPath로 버튼 찾기
                    const button = await page.locator('xpath=//button[contains(text(), "빠른 테스트")]').first();

                    if (await button.isVisible()) {
                        await button.click();
                        console.log(`   🖱️  Clicked Quick Test button`);

                        // 다음 단계로 전환될 때까지 대기
                        await page.waitForTimeout(2000);
                    } else {
                        console.log(`   ⚠️  Quick Test button not visible at Step ${step}`);
                    }
                } catch (error) {
                    console.log(`   ⚠️  Error clicking button: ${error.message}`);
                }
            }
        }

        console.log('\n✨ All screenshots captured successfully!');
        console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);

    } catch (error) {
        console.error('\n❌ Error during screenshot capture:', error.message);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed');
        }
    }
}

// 스크립트 실행
captureWorkshopScreenshots()
    .then(() => {
        console.log('\n🎉 Screenshot capture completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
    });
