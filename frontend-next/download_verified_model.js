const https = require('https');
const fs = require('fs');

const url = 'https://raw.githubusercontent.com/adrianhajdin/project_threejs_ai/main/client/public/shirt_baked.glb';
const dest = 'public/shirt_baked.glb';

console.log(`Downloading from ${url} to ${dest}...`);

const file = fs.createWriteStream(dest);
https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close(() => {
        console.log("Download complete.");
        const stats = fs.statSync(dest);
        console.log(`File size: ${stats.size} bytes`);
    });
  });
}).on('error', function(err) {
  fs.unlink(dest);
  console.error("Error downloading file:", err);
});
