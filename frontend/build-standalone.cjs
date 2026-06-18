const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const distDir = path.join(srcDir, 'dist');
const publicDir = path.join(srcDir, 'public');

// Crear dist
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// Copiar index.html standalone
fs.copyFileSync(path.join(srcDir, 'index.html'), path.join(distDir, 'index.html'));

// Copiar assets de public
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(publicDir, distDir);

console.log('✓ Standalone deployed to dist/');
console.log('  index.html +', fs.readdirSync(publicDir).length, 'assets');
