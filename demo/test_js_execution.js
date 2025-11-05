const puppeteer = require('puppeteer');

async function testJavaScriptExecution() {
    console.log('=== Testing JavaScript Execution ===\n');

    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Collect all console messages and errors
        const consoleMessages = [];
        const errors = [];

        page.on('console', msg => {
            consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
        });

        page.on('pageerror', error => {
            errors.push(`[PAGE ERROR] ${error.message}`);
        });

        // Navigate to the page
        console.log('1. Loading page...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

        // Wait a bit for all scripts to load
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('2. Checking script execution...');

        // Test basic JavaScript
        const basicJS = await page.evaluate(() => {
            return typeof window !== 'undefined' && typeof document !== 'undefined';
        });

        console.log(`   Basic JavaScript: ${basicJS ? '✅' : '❌'}`);

        // Test axios
        const axiosTest = await page.evaluate(() => {
            return typeof axios !== 'undefined';
        });

        console.log(`   Axios loaded: ${axiosTest ? '✅' : '❌'}`);

        // Test Socket.IO
        const socketIOTest = await page.evaluate(() => {
            return typeof io !== 'undefined';
        });

        console.log(`   Socket.IO loaded: ${socketIOTest ? '✅' : '❌'}`);

        // Test if loginAs function exists
        const loginAsTest = await page.evaluate(() => {
            return typeof loginAs !== 'undefined';
        });

        console.log(`   loginAs function: ${loginAsTest ? '✅' : '❌'}`);

        // If loginAs doesn't exist, let's check if the script tag was parsed
        if (!loginAsTest) {
            console.log('\n3. Investigating script parsing...');

            const scriptTags = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script'));
                return scripts.map(script => ({
                    src: script.src || 'inline',
                    hasContent: script.innerHTML.length > 0,
                    contentPreview: script.innerHTML.substring(0, 100)
                }));
            });

            console.log('   Script tags found:');
            scriptTags.forEach((script, index) => {
                console.log(`   ${index + 1}. ${script.src} (content: ${script.hasContent ? 'yes' : 'no'})`);
                if (script.hasContent && script.src === 'inline') {
                    console.log(`      Preview: ${script.contentPreview}...`);
                }
            });
        }

        console.log('\n4. Console messages:');
        if (consoleMessages.length === 0) {
            console.log('   No console messages');
        } else {
            consoleMessages.forEach((msg, index) => {
                console.log(`   ${index + 1}. ${msg}`);
            });
        }

        console.log('\n5. JavaScript errors:');
        if (errors.length === 0) {
            console.log('   No JavaScript errors');
        } else {
            errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        // Try to manually call loginAs to see what happens
        if (loginAsTest) {
            console.log('\n6. Testing manual loginAs call...');
            try {
                const loginResult = await page.evaluate(async () => {
                    // Don't actually call it, just check if it would work
                    return 'loginAs function is callable';
                });
                console.log(`   ${loginResult}`);
            } catch (error) {
                console.log(`   Manual call failed: ${error.message}`);
            }
        }

    } catch (error) {
        console.log('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testJavaScriptExecution().then(() => {
    process.exit(0);
}).catch(error => {
    console.log('Test error:', error.message);
    process.exit(1);
});