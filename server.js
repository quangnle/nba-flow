const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'diagram.json');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get diagram data
app.get('/api/diagram', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading diagram data:', error);
    res.status(500).json({ error: 'Failed to read diagram data' });
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

