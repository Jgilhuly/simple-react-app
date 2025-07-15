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

app.get('/api/bulk-export', (req, res) => {
  const exportData = {
    metrics: null,
    activities: [],
    products: [],
    salesOverTime: []
  };

  db.get('SELECT * FROM metrics ORDER BY id DESC LIMIT 1', (err, metricsRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    exportData.metrics = metricsRow;

    db.all('SELECT * FROM activities ORDER BY id DESC', (err, activitiesRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      exportData.activities = activitiesRows;

      db.all('SELECT * FROM products ORDER BY sales DESC', (err, productsRows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        exportData.products = productsRows;

        db.all('SELECT * FROM sales_over_time ORDER BY date', (err, salesRows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          exportData.salesOverTime = salesRows;

          const timestamp = new Date().toISOString().split('T')[0];
          const filename = `dashboard-export-${timestamp}.json`;
          
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
          res.json(exportData);
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 