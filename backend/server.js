const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const csv = require('fast-csv');

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

app.get('/api/export', (req, res) => {
  const { format = 'csv', types = 'all' } = req.query;
  const requestedTypes = types === 'all' ? ['metrics', 'activities', 'products', 'sales'] : types.split(',');
  
  const exportData = {};
  let completedQueries = 0;
  const totalQueries = requestedTypes.length;
  
  const finishExport = () => {
    if (format === 'csv') {
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="dashboard-export-${timestamp}.csv"`);
      
      let csvContent = '';
      
      if (exportData.metrics && exportData.metrics.length > 0) {
        csvContent += 'METRICS\n';
        csvContent += 'Total Users,Active Users,Revenue\n';
        const metrics = exportData.metrics[0];
        csvContent += `${metrics.total_users},${metrics.active_users},${metrics.revenue}\n\n`;
      }
      
      if (exportData.activities && exportData.activities.length > 0) {
        csvContent += 'USER ACTIVITIES\n';
        csvContent += 'ID,User,Action,Time\n';
        exportData.activities.forEach(activity => {
          csvContent += `${activity.id},"${activity.user}","${activity.action}","${activity.time}"\n`;
        });
        csvContent += '\n';
      }
      
      if (exportData.products && exportData.products.length > 0) {
        csvContent += 'PRODUCTS\n';
        csvContent += 'ID,Name,Sales\n';
        exportData.products.forEach(product => {
          csvContent += `${product.id},"${product.name}",${product.sales}\n`;
        });
        csvContent += '\n';
      }
      
      if (exportData.sales && exportData.sales.length > 0) {
        csvContent += 'SALES OVER TIME\n';
        csvContent += 'Date,Sales,Revenue,State,Product ID\n';
        exportData.sales.forEach(sale => {
          csvContent += `${sale.date},${sale.sales},${sale.revenue},"${sale.state}",${sale.product_id}\n`;
        });
      }
      
      res.send(csvContent);
    } else {
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="dashboard-export-${timestamp}.json"`);
      res.json(exportData);
    }
  };
  
  const handleQueryComplete = () => {
    completedQueries++;
    if (completedQueries === totalQueries) {
      finishExport();
    }
  };
  
  if (requestedTypes.includes('metrics')) {
    db.get('SELECT * FROM metrics ORDER BY id DESC LIMIT 1', (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      exportData.metrics = row ? [row] : [];
      handleQueryComplete();
    });
  }
  
  if (requestedTypes.includes('activities')) {
    db.all('SELECT * FROM activities ORDER BY id DESC', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      exportData.activities = rows;
      handleQueryComplete();
    });
  }
  
  if (requestedTypes.includes('products')) {
    db.all('SELECT * FROM products ORDER BY sales DESC', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      exportData.products = rows;
      handleQueryComplete();
    });
  }
  
  if (requestedTypes.includes('sales')) {
    db.all('SELECT * FROM sales_over_time ORDER BY date', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      exportData.sales = rows;
      handleQueryComplete();
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 