const puppeteer = require('puppeteer');

async function testAxiosAvailability() {
    console.log('=== Testing Axios Availability ===\n');

    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Collect console messages
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push(`${msg.type()}: ${msg.text()}`);
        });

        // Navigate to the page
        console.log('1. Loading page...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

        // Test if axios is available
        console.log('2. Testing axios availability...');
        const axiosAvailable = await page.evaluate(() => {
            return typeof axios !== 'undefined';
        });

        if (axiosAvailable) {
            console.log('✅ Axios is available in the browser');
        } else {
            console.log('❌ Axios is not available in the browser');
        }

        // Test if loginAs function is defined
        console.log('3. Testing loginAs function...');
        const loginAsAvailable = await page.evaluate(() => {
            return typeof loginAs !== 'undefined';
        });

        if (loginAsAvailable) {
            console.log('✅ loginAs function is defined');
        } else {
            console.log('❌ loginAs function is not defined');
        }

        // Test network requests
        console.log('4. Testing network requests...');
        await page.setRequestInterception(true);
        const failedRequests = [];

        page.on('request', request => {
            request.continue();
        });

        page.on('requestfailed', request => {
            failedRequests.push(`${request.url()} - ${request.failure().errorText}`);
        });

        // Reload to catch any network failures
        await page.reload({ waitUntil: 'networkidle2' });

        if (failedRequests.length === 0) {
            console.log('✅ All network requests succeeded');
        } else {
            console.log('❌ Failed network requests:');
            failedRequests.forEach(req => console.log(`   ${req}`));
        }

        // Print console messages
        console.log('\n5. Console messages:');
        if (consoleMessages.length === 0) {
            console.log('   No console messages');
        } else {
            consoleMessages.forEach((msg, index) => {
                console.log(`   ${index + 1}. ${msg}`);
            });
        }

    } catch (error) {
        console.log('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testAxiosAvailability().then(() => {
    process.exit(0);
}).catch(error => {
    console.log('Test error:', error.message);
    process.exit(1);
});