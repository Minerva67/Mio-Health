import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Increase body limit for image uploads
app.use(express.json({ limit: '20mb' }));

// API Proxy Route
// Intercepts calls to /api/... and forwards them to Google
app.all('/api/*', async (req, res) => {
  try {
    // 1. Extract the path after /api
    // Example: Client requests /api/v1beta/models/gemini-pro:generateContent
    // We need: /v1beta/models/gemini-pro:generateContent
    const pathAfterApi = req.url.replace(/^\/api/, '');
    
    // 2. Construct the Google URL
    const targetUrl = `https://generativelanguage.googleapis.com${pathAfterApi}`;
    
    // 3. Get API Key from environment
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      console.error("Missing API_KEY environment variable");
      return res.status(500).json({ error: 'Server configuration error: API_KEY is missing.' });
    }

    // 4. Inject API Key securely
    const urlObj = new URL(targetUrl);
    urlObj.searchParams.set('key', apiKey);

    // 5. Forward the request
    const response = await fetch(urlObj.toString(), {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // 6. Handle response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API Error:', response.status, errorText);
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Proxy Internal Error:', error);
    res.status(500).json({ error: 'Internal Proxy Error' });
  }
});

// Serve Static Frontend Files (From Docker dist folder)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - return index.html for any unknown path
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (!process.env.API_KEY) {
    console.warn("WARNING: API_KEY is not set!");
  }
});