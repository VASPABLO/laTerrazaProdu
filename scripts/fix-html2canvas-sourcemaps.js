const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'node_modules', 'html2canvas', 'dist');

const mapContent = JSON.stringify({
  version: 3,
  file: '',
  sources: [],
  names: [],
  mappings: ''
});

const mapFiles = ['html2canvas.js.map', 'html2canvas.esm.js.map'];

function ensureMapFile(fileName) {
  const filePath = path.join(distDir, fileName);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, mapContent, 'utf8');
    console.log('[postinstall] Created missing source map:', fileName);
  }
}

if (fs.existsSync(distDir)) {
  mapFiles.forEach(ensureMapFile);
}
