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

app.get('/api/export', (req, res) => {
  const queries = {
    metrics: 'SELECT * FROM metrics ORDER BY id DESC LIMIT 1',
    activities: 'SELECT * FROM activities ORDER BY id DESC',
    products: 'SELECT * FROM products ORDER BY sales DESC',
    salesOverTime: 'SELECT * FROM sales_over_time ORDER BY date'
  };

  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;

  const checkCompletion = () => {
    if (completed === totalQueries) {
      let csvContent = '';
      
      csvContent += 'METRICS\n';
      csvContent += 'total_users,active_users,revenue\n';
      if (results.metrics) {
        csvContent += `${results.metrics.total_users},${results.metrics.active_users},${results.metrics.revenue}\n`;
      }
      csvContent += '\n';

      csvContent += 'ACTIVITIES\n';
      csvContent += 'id,user,action,time\n';
      results.activities.forEach(row => {
        csvContent += `${row.id},"${row.user}","${row.action}","${row.time}"\n`;
      });
      csvContent += '\n';

      csvContent += 'PRODUCTS\n';
      csvContent += 'id,name,sales\n';
      results.products.forEach(row => {
        csvContent += `${row.id},"${row.name}",${row.sales}\n`;
      });
      csvContent += '\n';

      csvContent += 'SALES_OVER_TIME\n';
      csvContent += 'date,sales,revenue,state,product_id\n';
      results.salesOverTime.forEach(row => {
        csvContent += `${row.date},${row.sales},${row.revenue},"${row.state}",${row.product_id}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="dashboard_export.csv"');
      res.send(csvContent);
    }
  };

  Object.keys(queries).forEach(key => {
    if (key === 'metrics') {
      db.get(queries[key], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        results[key] = row;
        completed++;
        checkCompletion();
      });
    } else {
      db.all(queries[key], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        results[key] = rows;
        completed++;
        checkCompletion();
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 