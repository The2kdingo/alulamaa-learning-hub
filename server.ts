import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { render } from './src/entry.server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets
app.use('/_assets', express.static(path.join(__dirname, 'dist/client'), {
  maxAge: '1d',
  etag: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SSR handler
app.get('*', async (req, res) => {
  try {
    // Skip API/static requests
    if (req.path.match(/\.(js|css|png|jpg|ico|svg|woff2?|ttf)$/)) {
      return res.status(404).send('Not found');
    }

    // Render SSR
    const { html, dehydratedState } = await render(req.originalUrl, {
      url: req.originalUrl,
    });

    // Load template
    const templatePath = path.join(__dirname, 'dist/client/ssr-template.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    // Inject SSR content
    template = template
      .replace('<!--ssr-placeholder-->', html)
      .replace('window.__INITIAL_DATA__ = {};', `window.__INITIAL_DATA__ = ${JSON.stringify(dehydratedState || {})};`);

    res.send(template);
  } catch (error: any) {
    console.error('SSR Error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Server Error</h1>
          <p>${error.message}</p>
          <script type="module" src="/_assets/src/entry.client.js"></script>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SSR Server running on http://localhost:${PORT}`);
});

