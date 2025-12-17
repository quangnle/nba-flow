const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'diagram.json');

// Middleware
app.use(express.json());

// API Routes - Must be defined BEFORE static middleware
// Get diagram data
app.get('/api/diagram', async (req, res) => {
  try {
    console.log('GET /api/diagram - Reading file:', DATA_FILE);
    const data = await fs.readFile(DATA_FILE, 'utf8');
    console.log('GET /api/diagram - Success');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading diagram data:', error);
    res.status(500).json({ error: 'Failed to read diagram data', details: error.message });
  }
});

// Save diagram data
app.post('/api/diagram', async (req, res) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving diagram data:', error);
    res.status(500).json({ error: 'Failed to save diagram data' });
  }
});

// Static files - Must be after API routes
app.use(express.static('public'));

// Serve main HTML - Catch-all route for SPA (exclude API routes)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data file path: ${DATA_FILE}`);
});

