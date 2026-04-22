import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AlUlamaa Academy — Islamic Learning Platform</title>
    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`

const distClientDir = path.join(__dirname, '..', 'dist', 'client')

if (!fs.existsSync(distClientDir)) {
  fs.mkdirSync(distClientDir, { recursive: true })
}

fs.writeFileSync(path.join(distClientDir, 'index.html'), htmlContent)
console.log('✓ Generated dist/client/index.html')
