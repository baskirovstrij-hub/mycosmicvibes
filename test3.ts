import http from 'http';

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/generate-deep-analysis',
  method: 'POST',
}, (res) => { // Forgot headers and body
  console.log(`STATUS: ${res.statusCode}`);
});

req.on('error', (e) => console.error(e));
req.end();
