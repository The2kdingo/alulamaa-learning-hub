import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const templateSrc = path.join(__dirname, '..', 'public', 'ssr-template.html');
const distDir = path.join(__dirname, '..', 'dist', 'client');
const templateDest = path.join(distDir, 'ssr-template.html');

// Ensure dist/client exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log(`Created directory ${distDir}`);
}

if (fs.existsSync(templateSrc)) {
  fs.copyFileSync(templateSrc, templateDest);
  console.log('✓ Copied SSR template to dist/client/ssr-template.html');
} else {
  console.error('✘ SSR template not found at', templateSrc);
  process.exit(1);
}

