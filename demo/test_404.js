const puppeteer = require('puppeteer');

async function test404Error() {
    console.log('=== Investigating 404 Error ===\n');

    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        const failedRequests = [];
        const responses = [];

        // Monitor all requests and responses
        page.on('request', request => {
            console.log(`REQUEST: ${request.method()} ${request.url()}`);
        });

        page.on('response', response => {
            responses.push({
                url: response.url(),
                status: response.status(),
                contentType: response.headers()['content-type']
            });

            if (response.status() >= 400) {
                console.log(`FAILED RESPONSE: ${response.status()} ${response.url()}`);
                failedRequests.push({
                    url: response.url(),
                    status: response.status(),
                    contentType: response.headers()['content-type']
                });
            }
        });

        page.on('pageerror', error => {
            console.log(`PAGE ERROR: ${error.message}`);
        });

        console.log('Loading page...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

        console.log('\n=== Failed Requests ===');
        if (failedRequests.length === 0) {
            console.log('No failed requests');
        } else {
            failedRequests.forEach((req, index) => {
                console.log(`${index + 1}. ${req.status} ${req.url}`);
                console.log(`   Content-Type: ${req.contentType || 'unknown'}`);
            });
        }

        // For any 404 responses that might return HTML, let's check the content
        for (const req of failedRequests) {
            if (req.status === 404) {
                console.log(`\nChecking content of 404 response: ${req.url}`);
                try {
                    const response = await page.goto(req.url, { waitUntil: 'networkidle2' });
                    const content = await response.text();
                    console.log(`Content preview: ${content.substring(0, 200)}...`);
                } catch (error) {
                    console.log(`Could not load 404 URL: ${error.message}`);
                }
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

test404Error().then(() => {
    process.exit(0);
}).catch(error => {
    console.log('Test error:', error.message);
    process.exit(1);
});