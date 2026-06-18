const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'DeBarrio (standalone).html');
const html = fs.readFileSync(bundlePath, 'utf8');

// Extraer manifest
const manifestMatch = html.match(/<script type="__bundler\/manifest">([\s\S]*?)<\/script>/);
const manifest = JSON.parse(manifestMatch[1]);

// Extraer template
const templateMatch = html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
const template = JSON.parse(templateMatch[1]);

// Extraer ext_resources
const extResourcesMatch = html.match(/<script type="__bundler\/ext_resources">([\s\S]*?)<\/script>/);
const extResources = extResourcesMatch ? JSON.parse(extResourcesMatch[1]) : [];

// Decodificar assets del manifest y guardarlos en public/
const publicDir = path.join(__dirname, 'public');
const fontsDir = path.join(publicDir, 'fonts');
if (!fs.existsSync(fontsDir)) fs.mkdirSync(fontsDir, { recursive: true });

const uuidToPath = {};
for (const [uuid, entry] of Object.entries(manifest)) {
  const bytes = Buffer.from(entry.data, 'base64');
  let finalBytes = bytes;
  
  if (entry.compressed) {
    try {
      const zlib = require('zlib');
      finalBytes = zlib.gunzipSync(bytes);
    } catch (e) {
      console.warn('Could not decompress', uuid);
    }
  }
  
  let filename;
  if (entry.mime.includes('font') || entry.mime.includes('woff2')) {
    filename = 'fonts/' + uuid + '.woff2';
  } else if (entry.mime.includes('video')) {
    filename = 'auth-video.mp4';
  } else {
    filename = uuid;
  }
  
  fs.writeFileSync(path.join(publicDir, filename), finalBytes);
  uuidToPath[uuid] = '/' + filename;
}

// Reemplazar UUIDs de fuentes/video en el template
let processedTemplate = template;
for (const [uuid, filePath] of Object.entries(uuidToPath)) {
  const regex = new RegExp(uuid.replace(/-/g, '\\-'), 'g');
  processedTemplate = processedTemplate.replace(regex, filePath);
}

// Inlinar scripts de tipo text/babel (Babel standalone puede transformar inline, pero no src externos)
const babelScripts = processedTemplate.match(/<script type="text\/babel" src="([^"]+)"><\/script>/g) || [];
for (const tag of babelScripts) {
  const srcMatch = tag.match(/src="([^"]+)"/);
  const src = srcMatch[1];
  // src puede ser UUID o ruta externa ya reemplazada
  let uuid = src;
  if (uuidToPath[src]) uuid = src;
  else {
    // buscar uuid que corresponda a la ruta
    const found = Object.entries(uuidToPath).find(([k, v]) => v === src || v === '/' + src);
    if (found) uuid = found[0];
  }
  const filePath = path.join(publicDir, uuidToPath[uuid].replace(/^\//, ''));
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const inlined = `<script type="text/babel">\n${content}\n</script>`;
    processedTemplate = processedTemplate.replace(tag, inlined);
  }
}

// Reemplazar scripts src normales (React, ReactDOM, Babel standalone) con rutas externas
const normalScripts = processedTemplate.match(/<script src="([^"]+)"[^>]*><\/script>/g) || [];
for (const tag of normalScripts) {
  const srcMatch = tag.match(/src="([^"]+)"/);
  const uuid = srcMatch[1];
  if (uuidToPath[uuid]) {
    const newTag = tag.replace(uuid, uuidToPath[uuid]);
    processedTemplate = processedTemplate.replace(tag, newTag);
  }
}

// Guardar index.html funcional
fs.writeFileSync(path.join(__dirname, 'index.html'), processedTemplate, 'utf8');
console.log('✓ index.html created');

// Guardar también en public/
fs.writeFileSync(path.join(publicDir, 'index.html'), processedTemplate, 'utf8');

// Actualizar build-standalone.cjs para copiar el nuevo index.html
const buildScript = `const fs = require('fs');\nconst path = require('path');\n\nconst srcDir = __dirname;\nconst distDir = path.join(srcDir, 'dist');\n\nif (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });\n\nfs.copyFileSync(path.join(srcDir, 'index.html'), path.join(distDir, 'index.html'));\n\nconst publicDir = path.join(srcDir, 'public');\nfunction copyDir(src, dest) {\n  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });\n  const entries = fs.readdirSync(src, { withFileTypes: true });\n  for (const entry of entries) {\n    const srcPath = path.join(src, entry.name);\n    const destPath = path.join(dest, entry.name);\n    if (entry.isDirectory()) copyDir(srcPath, destPath);\n    else fs.copyFileSync(srcPath, destPath);\n  }\n}\ncopyDir(publicDir, distDir);\n\nconsole.log('✓ Standalone deployed to dist/');\n`;
fs.writeFileSync(path.join(__dirname, 'build-standalone.cjs'), buildScript, 'utf8');
console.log('✓ build-standalone.cjs updated');
