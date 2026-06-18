const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const distDir = path.join(srcDir, 'dist');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

fs.copyFileSync(path.join(srcDir, 'index.html'), path.join(distDir, 'index.html'));

console.log('✓ Standalone HTML copied to dist/index.html');
