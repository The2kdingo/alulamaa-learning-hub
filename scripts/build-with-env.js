import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Get environment variables (fallback to .env.example values if not set)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ztrzfpzlcvsamqyxpmpe.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cnpmcHpsY3ZzYW1xeXhwbXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjAxMzMsImV4cCI6MjA5MTMzNjEzM30.K7Oe8xbXnZmDAXbLspksVs0cvXSaEuTFbQuNQFY_BT4'

// Escape double quotes for shell command
const escapeForShell = (str) => str.replace(/"/g, '\\"')

// Build esbuild command - now targets entry.client.tsx
const defines = [
  `--define:import.meta.env.VITE_SUPABASE_URL="${escapeForShell(supabaseUrl)}"`,
  `--define:import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY="${escapeForShell(supabaseKey)}"`,
]

const baseCommand = 'esbuild src/entry.client.tsx --bundle --outdir=dist/client/src --format=esm --splitting --external:/__ --external:pdfjs-dist --external:tailwindcss --external:tw-animate-css --platform=browser --define:process.env.NODE_ENV="production" --loader:.png=file --loader:.css=text'

const command = `${baseCommand} ${defines.join(' ')}`

try {
  console.log('Building client bundle from entry.client.tsx...')
  execSync(command, { stdio: 'inherit' })
  console.log('Generating HTML...')
  execSync('node scripts/build-html.js', { stdio: 'inherit' })
  console.log('Copying SSR template...')
  execSync('node scripts/copy-ssr-template.js', { stdio: 'inherit' })
  console.log('✓ Client build + SSR setup completed successfully')
} catch (error) {
  console.error('✘ Build failed:', error.message)
  process.exit(1)
}

