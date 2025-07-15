const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./dashboard.db');

app.get('/api/metrics', (req, res) => {
  db.get('SELECT * FROM metrics ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.get('/api/activities', (req, res) => {
  db.all('SELECT * FROM activities ORDER BY id DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY sales DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/sales-over-time', (req, res) => {
  db.all('SELECT * FROM sales_over_time ORDER BY date', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/export/bulk', (req, res) => {
  const exportData = {};
  let completed = 0;
  const totalQueries = 4;

  const checkComplete = () => {
    completed++;
    if (completed === totalQueries) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="dashboard-export.json"');
      res.json({
        exportDate: new Date().toISOString(),
        data: exportData
      });
    }
  };

  db.get('SELECT * FROM metrics ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    exportData.metrics = row;
    checkComplete();
  });

  db.all('SELECT * FROM activities ORDER BY id DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    exportData.activities = rows;
    checkComplete();
  });

  db.all('SELECT * FROM products ORDER BY sales DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    exportData.products = rows;
    checkComplete();
  });

  db.all('SELECT * FROM sales_over_time ORDER BY date', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    exportData.salesOverTime = rows;
    checkComplete();
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 