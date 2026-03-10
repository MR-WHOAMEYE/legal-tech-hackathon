const http = require('http');

function testAPI() {
    console.log('Testing backend API...');
    
    // Test health endpoint
    const healthReq = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/health',
        method: 'GET'
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('Health check status:', res.statusCode);
            console.log('Health check response:', data);
        });
    });
    
    healthReq.on('error', (err) => {
        console.error('Health check failed:', err.message);
    });
    
    healthReq.end();
    
    // Test license endpoint
    setTimeout(() => {
        const licenseReq = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/api/licenses/verify/test-license-123',
            method: 'GET'
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('License check status:', res.statusCode);
                console.log('License check response:', data);
            });
        });
        
        licenseReq.on('error', (err) => {
            console.error('License check failed:', err.message);
        });
        
        licenseReq.end();
    }, 1000);
}

testAPI();