import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middleware to parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// 2. API Proxy Route
// This intercepts requests from the frontend asking for Google AI
// and forwards them to Google from the server (which works in Zeapur)
app.all('/api/*', async (req, res) => {
  try {
    // Construct the upstream URL
    // The frontend sends requests to /api/v1beta/...
    // We map this to https://generativelanguage.googleapis.com/v1beta/...
    const targetUrl = `https://generativelanguage.googleapis.com${req.path.replace('/api', '')}${req.url.slice(req.path.length)}`;
    
    // Get the API Key from server environment variables
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: API_KEY is missing.' });
    }

    // Append API Key to query parameters if it's not there (it usually isn't if we handle it here)
    // But the SDK puts it in the query param. We need to inject it securely.
    const urlObj = new URL(targetUrl);
    
    // If the client sent a dummy key or no key, we force the real server key
    urlObj.searchParams.set('key', apiKey);

    const response = await fetch(urlObj.toString(), {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward necessary headers, but not host
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch from Google AI' });
  }
});

// 3. Serve Static Frontend Files (The React App)
app.use(express.static(path.join(__dirname, 'dist')));

// 4. Handle SPA routing (redirect all other requests to index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});