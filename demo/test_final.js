const puppeteer = require('puppeteer');

async function finalButtonTest() {
    console.log('=== Final Button Functionality Test ===\n');

    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        const errors = [];
        const consoleErrors = [];

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        console.log('1. Loading page (after favicon fix)...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

        // Wait for scripts to load
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('2. Checking for errors...');
        if (errors.length === 0 && consoleErrors.length === 0) {
            console.log('✅ No JavaScript errors detected');
        } else {
            console.log('❌ Errors found:');
            errors.forEach(error => console.log(`   PAGE ERROR: ${error}`));
            consoleErrors.forEach(error => console.log(`   CONSOLE ERROR: ${error}`));
        }

        console.log('\n3. Testing function availability...');
        const loginAsExists = await page.evaluate(() => typeof loginAs !== 'undefined');
        console.log(`   loginAs function: ${loginAsExists ? '✅ Available' : '❌ Not available'}`);

        if (loginAsExists) {
            console.log('\n4. Testing HRD button click...');
            try {
                await page.click('button[onclick="loginAs(\'hrd\')"]');
                await new Promise(resolve => setTimeout(resolve, 3000));

                const mainAppVisible = await page.evaluate(() => {
                    const mainApp = document.getElementById('main-app');
                    const loginScreen = document.getElementById('login-screen');
                    return !mainApp.classList.contains('hidden') && loginScreen.classList.contains('hidden');
                });

                if (mainAppVisible) {
                    console.log('✅ HRD login button works correctly');

                    const userInfo = await page.$eval('#user-info', el => el.textContent);
                    console.log(`   User info: ${userInfo}`);

                    // Test logout
                    await page.click('button[onclick="logout()"]');
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const backToLogin = await page.evaluate(() => {
                        const loginScreen = document.getElementById('login-screen');
                        return !loginScreen.classList.contains('hidden');
                    });

                    console.log(`   Logout works: ${backToLogin ? '✅' : '❌'}`);
                } else {
                    console.log('❌ HRD login button did not work');
                }
            } catch (error) {
                console.log(`❌ HRD button test failed: ${error.message}`);
            }

            console.log('\n5. Testing team manager button...');
            try {
                await page.click('button[onclick="loginAs(\'user1\')"]');
                await new Promise(resolve => setTimeout(resolve, 3000));

                const mainAppVisible = await page.evaluate(() => {
                    const mainApp = document.getElementById('main-app');
                    const loginScreen = document.getElementById('login-screen');
                    return !mainApp.classList.contains('hidden') && loginScreen.classList.contains('hidden');
                });

                if (mainAppVisible) {
                    console.log('✅ Team manager login button works correctly');

                    const userInfo = await page.$eval('#user-info', el => el.textContent);
                    console.log(`   User info: ${userInfo}`);
                } else {
                    console.log('❌ Team manager login button did not work');
                }
            } catch (error) {
                console.log(`❌ Team manager button test failed: ${error.message}`);
            }
        }

        console.log('\n=== Final Test Summary ===');
        console.log(`JavaScript errors: ${errors.length + consoleErrors.length}`);
        console.log(`loginAs function available: ${loginAsExists ? 'Yes' : 'No'}`);

    } catch (error) {
        console.log('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

finalButtonTest().then(() => {
    process.exit(0);
}).catch(error => {
    console.log('Test error:', error.message);
    process.exit(1);
});