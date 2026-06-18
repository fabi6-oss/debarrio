const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const distDir = path.join(srcDir, 'dist');

// Crear dist
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// Copiar el HTML standalone original exacto
fs.copyFileSync(path.join(srcDir, 'DeBarrio (standalone).html'), path.join(distDir, 'index.html'));

console.log('✓ Standalone HTML copied to dist/index.html');
