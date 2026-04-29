import http from 'http';

const data = JSON.stringify({ natalData: {planets: [], ascendant: {sign: 'Aries'}}, mbti: "INTJ" });

const req = http.request({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/generate-deep-analysis',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let responseText = '';
  res.on('data', (chunk) => responseText += chunk);
  res.on('end', () => console.log('BODY:', responseText.substring(0, 500)));
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
