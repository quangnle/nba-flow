const express = require('express');
const fs = require('fs').promises;
const fssync = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'diagram.json');
const DATA_DIR = path.join(__dirname, 'data');
const FLOWS_DIR = path.join(__dirname, 'flows');

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

// List available flow diagrams
app.get('/api/flows', async (req, res) => {
  try {
    if (!fssync.existsSync(FLOWS_DIR)) {
      return res.json({ flows: [] });
    }
    const files = await fs.readdir(FLOWS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const flows = jsonFiles.map(f => ({
      id: f.replace('.json', ''),
      name: f.replace('_flow.json', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      file: f
    }));
    res.json({ flows });
  } catch (error) {
    console.error('Error reading flows:', error);
    res.status(500).json({ error: 'Failed to read flows' });
  }
});

// Get specific flow diagram
app.get('/api/flows/:id', async (req, res) => {
  try {
    const flowFile = path.join(FLOWS_DIR, `${req.params.id}.json`);
    if (!fssync.existsSync(flowFile)) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    const data = await fs.readFile(flowFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading flow:', error);
    res.status(500).json({ error: 'Failed to read flow data' });
  }
});


// Save diagram data (POST)
app.post('/api/diagram', async (req, res) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving diagram data:', error);
    res.status(500).json({ error: 'Failed to save diagram data' });
  }
});

// Update diagram data (PUT)
app.put('/api/diagram', async (req, res) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving diagram data:', error);
    res.status(500).json({ error: 'Failed to save diagram data' });
  }
});

// Get data files list
app.get('/api/data-files', async (req, res) => {
  try {
    if (!fssync.existsSync(DATA_DIR)) {
      return res.json({ files: [] });
    }

    const files = await fs.readdir(DATA_DIR);
    const csvFiles = files.filter(f => f.endsWith('.csv'));
    res.json({ files: csvFiles.sort() });
  } catch (error) {
    console.error('Error reading data files:', error);
    res.status(500).json({ error: 'Failed to read data files' });
  }
});

// Serve data files
app.use('/data', express.static(DATA_DIR, {
  setHeaders: (res, path) => {
    if (path.endsWith('.csv')) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    }
  }
}));

// Static files - Must be after API routes
app.use(express.static('public'));

// Serve CSV and other files from root directory
app.use(express.static('.', {
  setHeaders: (res, path) => {
    if (path.endsWith('.csv')) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    }
  }
}));

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

