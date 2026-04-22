import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Serve static files from dist/client
app.use(express.static(path.join(__dirname, 'dist/client')))

// Serve the index.html for all non-file requests (SPA)
app.get('*', (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'dist/client/index.html')
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath)
    } else {
      res.status(404).send('Not found')
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
