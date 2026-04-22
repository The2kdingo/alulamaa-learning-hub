import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''

// Build the esbuild command with environment variable definitions
const defines = [
  `--define:import.meta.env.VITE_SUPABASE_URL='${supabaseUrl}'`,
  `--define:import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY='${supabaseKey}'`,
]

const baseCommand = 'esbuild src/main.tsx --bundle --outdir=dist/client --format=esm --splitting --external:/__ --external:pdfjs-dist --external:tailwindcss --external:tw-animate-css --platform=browser --define:process.env.NODE_ENV=process.env.NODE_ENV --loader:.png=file --loader:.css=text'

const command = `${baseCommand} ${defines.join(' ')}`

try {
  execSync(command, { stdio: 'inherit' })
  execSync('node scripts/build-html.js', { stdio: 'inherit' })
  console.log('✓ Client build completed successfully')
} catch (error) {
  console.error('✘ Build failed:', error.message)
  process.exit(1)
}
