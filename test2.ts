import http from 'http';

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/health',
  method: 'GET',
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', res.headers);
  let responseText = '';
  res.on('data', (chunk) => responseText += chunk);
  res.on('end', () => console.log('BODY:', responseText.substring(0, 500)));
});

req.on('error', (e) => console.error(e));
req.end();
