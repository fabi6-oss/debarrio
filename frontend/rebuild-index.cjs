const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'DeBarrio (standalone).html');
const html = fs.readFileSync(bundlePath, 'utf8');

// Extraer template
const templateMatch = html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
const template = JSON.parse(templateMatch[1]);

// Extraer ext_resources
const extResourcesMatch = html.match(/<script type="__bundler\/ext_resources">([\s\S]*?)<\/script>/);
const extResources = extResourcesMatch ? JSON.parse(extResourcesMatch[1]) : [];

// Mapeo de UUIDs a rutas externas (asumiendo que ya fueron extraídos)
const publicDir = path.join(__dirname, 'public');
const uuidToPath = {};

// Detectar assets ya extraídos
for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.includes('-')) {
    uuidToPath[entry.name] = '/' + entry.name;
  }
}

// Detectar fuentes
const fontsDir = path.join(publicDir, 'fonts');
if (fs.existsSync(fontsDir)) {
  for (const entry of fs.readdirSync(fontsDir, { withFileTypes: true })) {
    if (entry.isFile()) {
      const uuid = entry.name.replace('.woff2', '');
      uuidToPath[uuid] = '/fonts/' + entry.name;
    }
  }
}

// Video
if (fs.existsSync(path.join(publicDir, 'auth-video.mp4'))) {
  uuidToPath['c23f9d13-6a02-4bbe-85f1-fc9ec32e1b95'] = '/auth-video.mp4';
}

// Reemplazar UUIDs en template
let processedTemplate = template;
for (const [uuid, filePath] of Object.entries(uuidToPath)) {
  const regex = new RegExp(uuid.replace(/-/g, '\\-'), 'g');
  processedTemplate = processedTemplate.replace(regex, filePath);
}

// Inlinar scripts Babel
const babelScripts = processedTemplate.match(/<script type="text\/babel" src="([^"]+)"><\/script>/g) || [];
for (const tag of babelScripts) {
  const srcMatch = tag.match(/src="([^"]+)"/);
  const src = srcMatch[1];
  let uuid = src;
  if (!uuidToPath[src]) {
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

// Reemplazar scripts normales
const normalScripts = processedTemplate.match(/<script src="([^"]+)"[^>]*><\/script>/g) || [];
for (const tag of normalScripts) {
  const srcMatch = tag.match(/src="([^"]+)"/);
  const uuid = srcMatch[1];
  if (uuidToPath[uuid]) {
    const newTag = tag.replace(uuid, uuidToPath[uuid]);
    processedTemplate = processedTemplate.replace(tag, newTag);
  }
}

// Guardar index.html
fs.writeFileSync(path.join(__dirname, 'index.html'), processedTemplate, 'utf8');
fs.writeFileSync(path.join(publicDir, 'index.html'), processedTemplate, 'utf8');
console.log('✓ index.html regenerated from existing assets');
