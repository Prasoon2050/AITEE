const https = require('https');

const url = 'https://raw.githubusercontent.com/adrianhajdin/project_threejs_ai/main/client/public/shirt_baked.glb';

console.log(`Checking URL: ${url}`);

const req = https.request(url, { method: 'HEAD' }, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  if (res.statusCode === 200) {
      console.log("URL is valid and accessible.");
  } else {
      console.log("URL is NOT accessible.");
  }
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
