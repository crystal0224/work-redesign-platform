const puppeteer = require('puppeteer');

async function testBrowserFunctionality() {
    console.log('=== Browser JavaScript Error Test ===\n');

    let browser;
    let page;

    try {
        // Launch browser
        console.log('1. Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();

        // Collect console errors
        const consoleErrors = [];
        const jsErrors = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });

        // Load the page
        console.log('2. Loading main page...');
        await page.goto('http://localhost:3000', {
            waitUntil: 'networkidle2',
            timeout: 10000
        });

        console.log('✅ Page loaded successfully');

        // Test HRD login button
        console.log('\n3. Testing HRD login button click...');
        try {
            await page.click('button[onclick="loginAs(\'hrd\')"]');

            // Wait for axios request to complete and UI to update
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check if main-app no longer has hidden class
            const mainAppHidden = await page.$eval('#main-app', el => el.classList.contains('hidden'));
            const loginScreenHidden = await page.$eval('#login-screen', el => el.classList.contains('hidden'));

            if (!mainAppHidden && loginScreenHidden) {
                console.log('✅ HRD login button works correctly');

                // Check if user info is displayed
                const userInfo = await page.$eval('#user-info', el => el.textContent);
                console.log(`   User info displayed: ${userInfo}`);
            } else {
                console.log('❌ HRD login button - UI did not update correctly');
            }

        } catch (error) {
            console.log('❌ HRD login button test failed:', error.message);
        }

        // Reset to login screen
        await page.reload();
        await page.waitForSelector('#login-screen', { timeout: 5000 });

        // Test team manager login button
        console.log('\n4. Testing team manager login button...');
        try {
            await page.click('button[onclick="loginAs(\'user1\')"]');

            // Wait for axios request to complete and UI to update
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check if main-app no longer has hidden class
            const mainAppHidden = await page.$eval('#main-app', el => el.classList.contains('hidden'));
            const loginScreenHidden = await page.$eval('#login-screen', el => el.classList.contains('hidden'));

            if (!mainAppHidden && loginScreenHidden) {
                console.log('✅ Team manager login button works correctly');

                // Check if user info is displayed
                const userInfo = await page.$eval('#user-info', el => el.textContent);
                console.log(`   User info displayed: ${userInfo}`);
            } else {
                console.log('❌ Team manager login button - UI did not update correctly');
            }

        } catch (error) {
            console.log('❌ Team manager login button test failed:', error.message);
        }

        // Wait a bit more to catch any late errors
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check for JavaScript errors
        console.log('\n5. Checking for JavaScript errors...');
        if (consoleErrors.length === 0 && jsErrors.length === 0) {
            console.log('✅ No JavaScript errors detected');
        } else {
            console.log('❌ JavaScript errors detected:');

            if (consoleErrors.length > 0) {
                console.log('   Console Errors:');
                consoleErrors.forEach((error, index) => {
                    console.log(`   ${index + 1}. ${error}`);
                });
            }

            if (jsErrors.length > 0) {
                console.log('   Page Errors:');
                jsErrors.forEach((error, index) => {
                    console.log(`   ${index + 1}. ${error}`);
                });
            }
        }

        // Test logout functionality
        console.log('\n6. Testing logout button...');
        try {
            await page.click('button[onclick="logout()"]');

            // Wait for login screen to show
            await page.waitForSelector('#login-screen:not(.hidden)', { timeout: 5000 });
            console.log('✅ Logout button works correctly');

        } catch (error) {
            console.log('❌ Logout button test failed:', error.message);
        }

        console.log('\n=== Browser Test Summary ===');
        console.log('✅ Browser testing completed successfully');
        console.log(`   Console errors: ${consoleErrors.length}`);
        console.log(`   JavaScript errors: ${jsErrors.length}`);

    } catch (error) {
        console.log('❌ Browser test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the browser tests
testBrowserFunctionality().then(() => {
    process.exit(0);
}).catch((error) => {
    console.log('Browser test suite error:', error.message);
    process.exit(1);
});