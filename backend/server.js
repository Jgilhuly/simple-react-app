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
  let pendingQueries = 4;
  let hasError = false;

  const checkComplete = () => {
    if (pendingQueries === 0 && !hasError) {
      const csvData = generateCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="dashboard-export.csv"');
      res.send(csvData);
    }
  };

  const handleError = (err) => {
    if (!hasError) {
      hasError = true;
      res.status(500).json({ error: err.message });
    }
  };

  db.get('SELECT * FROM metrics ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) return handleError(err);
    exportData.metrics = row;
    pendingQueries--;
    checkComplete();
  });

  db.all('SELECT * FROM activities ORDER BY id DESC', (err, rows) => {
    if (err) return handleError(err);
    exportData.activities = rows;
    pendingQueries--;
    checkComplete();
  });

  db.all('SELECT * FROM products ORDER BY sales DESC', (err, rows) => {
    if (err) return handleError(err);
    exportData.products = rows;
    pendingQueries--;
    checkComplete();
  });

  db.all('SELECT * FROM sales_over_time ORDER BY date', (err, rows) => {
    if (err) return handleError(err);
    exportData.salesOverTime = rows;
    pendingQueries--;
    checkComplete();
  });
});

function generateCSV(data) {
  let csv = '';
  
  csv += 'METRICS\n';
  csv += 'ID,Total Users,Active Users,Revenue\n';
  csv += `${data.metrics.id},${data.metrics.total_users},${data.metrics.active_users},${data.metrics.revenue}\n\n`;
  
  csv += 'ACTIVITIES\n';
  csv += 'ID,User,Action,Time\n';
  data.activities.forEach(activity => {
    csv += `${activity.id},"${activity.user}","${activity.action}","${activity.time}"\n`;
  });
  csv += '\n';
  
  csv += 'PRODUCTS\n';
  csv += 'ID,Name,Sales\n';
  data.products.forEach(product => {
    csv += `${product.id},"${product.name}",${product.sales}\n`;
  });
  csv += '\n';
  
  csv += 'SALES OVER TIME\n';
  csv += 'ID,Date,Sales,Revenue,State,Product ID\n';
  data.salesOverTime.forEach(sale => {
    csv += `${sale.id},${sale.date},${sale.sales},${sale.revenue},${sale.state},${sale.product_id}\n`;
  });
  
  return csv;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 