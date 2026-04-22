import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const files = fs.readdirSync(src)
  
  for (const file of files) {
    // Skip files we don't want to copy
    if (file === 'index.html') {
      continue
    }

    const srcPath = path.join(src, file)
    const destPath = path.join(dest, file)
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

const publicDir = path.join(__dirname, '..', 'public')
const distClientDir = path.join(__dirname, '..', 'dist', 'client')

if (fs.existsSync(publicDir)) {
  copyDir(publicDir, distClientDir)
  console.log('✓ Copied public assets to dist/client')
}
