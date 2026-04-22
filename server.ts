import http from 'http'
import { render } from './src/entry.server.tsx'

const PORT = process.env.PORT || 3000

const server = http.createServer(async (req, res) => {
  try {
    const { html } = await render(req.url || '/')
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
  } catch (error) {
    console.error('Render error:', error)
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
