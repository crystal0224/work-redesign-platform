const io = require('socket.io-client');
const axios = require('axios');

// Test configuration
const SERVER_URL = 'http://localhost:3000';

async function testButtonFunctionality() {
    console.log('=== SK Work Redesign Platform Button Functionality Test ===\n');

    // Test 1: Check if main page loads
    console.log('1. Testing main page load...');
    try {
        const response = await axios.get(SERVER_URL);
        if (response.status === 200 && response.data.includes('SK Work Redesign')) {
            console.log('✅ Main page loads correctly');
            console.log(`   Status: ${response.status}`);
            console.log(`   Content length: ${response.data.length} characters`);
        } else {
            console.log('❌ Main page load failed');
        }
    } catch (error) {
        console.log('❌ Main page load error:', error.message);
    }

    // Test 2: Check library inclusion
    console.log('\n2. Checking library inclusion...');
    try {
        const response = await axios.get(SERVER_URL);
        const html = response.data;

        const hasAxios = html.includes('axios.min.js');
        const hasSocketIO = html.includes('socket.io.js');

        if (hasAxios) {
            console.log('✅ Axios library is included');
        } else {
            console.log('❌ Axios library is missing');
        }

        if (hasSocketIO) {
            console.log('✅ Socket.IO library is included');
        } else {
            console.log('❌ Socket.IO library is missing');
        }
    } catch (error) {
        console.log('❌ Library check error:', error.message);
    }

    // Test 3: Test HRD login button API call
    console.log('\n3. Testing HRD login button API...');
    try {
        const response = await axios.post(`${SERVER_URL}/api/auth/login`, {
            userType: 'hrd'
        });

        if (response.data.success && response.data.user.role === 'FACILITATOR') {
            console.log('✅ HRD login API works correctly');
            console.log(`   User: ${response.data.user.name}`);
            console.log(`   Role: ${response.data.user.role}`);
            console.log(`   Session ID: ${response.data.sessionId}`);
        } else {
            console.log('❌ HRD login API failed');
        }
    } catch (error) {
        console.log('❌ HRD login API error:', error.message);
    }

    // Test 4: Test team manager login buttons
    console.log('\n4. Testing team manager login buttons...');
    const teamManagers = ['user1', 'user2', 'user3'];

    for (const userType of teamManagers) {
        try {
            const response = await axios.post(`${SERVER_URL}/api/auth/login`, {
                userType: userType
            });

            if (response.data.success && response.data.user.role === 'PARTICIPANT') {
                console.log(`✅ ${userType} login works - ${response.data.user.name} (${response.data.user.department})`);
            } else {
                console.log(`❌ ${userType} login failed`);
            }
        } catch (error) {
            console.log(`❌ ${userType} login error:`, error.message);
        }
    }

    // Test 5: Test Socket.IO connection
    console.log('\n5. Testing Socket.IO connection...');
    return new Promise((resolve) => {
        const socket = io(SERVER_URL);

        const timeout = setTimeout(() => {
            console.log('❌ Socket.IO connection timeout');
            socket.disconnect();
            resolve();
        }, 5000);

        socket.on('connect', () => {
            console.log('✅ Socket.IO connection successful');
            console.log(`   Socket ID: ${socket.id}`);
            clearTimeout(timeout);

            // Test joining a chat room
            socket.emit('join-chat', {
                userId: 'test-user',
                workshopId: 'test-workshop',
                taskId: 'test-task'
            });

            socket.on('chat-history', (data) => {
                console.log('✅ Chat room join successful');
                console.log(`   Room ID: ${data.roomId}`);
                socket.disconnect();
                resolve();
            });
        });

        socket.on('connect_error', (error) => {
            console.log('❌ Socket.IO connection error:', error.message);
            clearTimeout(timeout);
            resolve();
        });
    });
}

// Run the tests
testButtonFunctionality().then(() => {
    console.log('\n=== Test Summary ===');
    console.log('Button functionality testing completed.');
    console.log('Check the results above for any issues that need to be addressed.');
    process.exit(0);
}).catch((error) => {
    console.log('Test suite error:', error.message);
    process.exit(1);
});