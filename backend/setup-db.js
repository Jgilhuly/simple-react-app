const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./dashboard.db');

const mockData = {
  metrics: {
    totalUsers: 125847,
    activeUsers: 8934,
    revenue: 245890
  },
  
  activities: [
    {
      id: 1,
      user: "John Smith",
      action: "Made a purchase",
      time: "2 hours ago"
    },
    {
      id: 2,
      user: "Jane Doe",
      action: "Updated profile",
      time: "4 hours ago"
    },
    {
      id: 3,
      user: "Bob Johnson",
      action: "Registered",
      time: "6 hours ago"
    }
  ],

  products: [
    {
      id: 1,
      name: "Premium Plan",
      sales: 324
    },
    {
      id: 2,
      name: "Basic Plan",
      sales: 198
    },
    {
      id: 3,
      name: "Pro Plan",
      sales: 156
    }
  ],

  salesOverTime: [
    { date: "2024-01-01", sales: 1250, revenue: 18750, state: "CA", productId: 1 },
    { date: "2024-01-02", sales: 1180, revenue: 17700, state: "NY", productId: 2 },
    { date: "2024-01-03", sales: 1420, revenue: 21300, state: "TX", productId: 3 },
    { date: "2024-01-04", sales: 1350, revenue: 20250, state: "FL", productId: 1 },
    { date: "2024-01-05", sales: 1580, revenue: 23700, state: "IL", productId: 2 },
    { date: "2024-01-06", sales: 1680, revenue: 25200, state: "CA", productId: 3 },
    { date: "2024-01-07", sales: 1450, revenue: 21750, state: "NY", productId: 1 },
    { date: "2024-01-08", sales: 1320, revenue: 19800, state: "TX", productId: 2 },
    { date: "2024-01-09", sales: 1520, revenue: 22800, state: "FL", productId: 3 },
    { date: "2024-01-10", sales: 1750, revenue: 26250, state: "IL", productId: 1 },
    { date: "2024-01-11", sales: 1630, revenue: 24450, state: "CA", productId: 2 },
    { date: "2024-01-12", sales: 1480, revenue: 22200, state: "NY", productId: 3 },
    { date: "2024-01-13", sales: 1590, revenue: 23850, state: "TX", productId: 1 },
    { date: "2024-01-14", sales: 1720, revenue: 25800, state: "FL", productId: 2 },
    { date: "2024-01-15", sales: 1820, revenue: 27300, state: "IL", productId: 3 },
    { date: "2024-01-16", sales: 1650, revenue: 24750, state: "CA", productId: 1 },
    { date: "2024-01-17", sales: 1530, revenue: 22950, state: "NY", productId: 2 },
    { date: "2024-01-18", sales: 1690, revenue: 25350, state: "TX", productId: 3 },
    { date: "2024-01-19", sales: 1780, revenue: 26700, state: "FL", productId: 1 },
    { date: "2024-01-20", sales: 1920, revenue: 28800, state: "IL", productId: 2 },
    { date: "2024-01-21", sales: 1850, revenue: 27750, state: "CA", productId: 3 },
    { date: "2024-01-22", sales: 1740, revenue: 26100, state: "NY", productId: 1 },
    { date: "2024-01-23", sales: 1620, revenue: 24300, state: "TX", productId: 2 },
    { date: "2024-01-24", sales: 1580, revenue: 23700, state: "FL", productId: 3 },
    { date: "2024-01-25", sales: 1760, revenue: 26400, state: "IL", productId: 1 },
    { date: "2024-01-26", sales: 1890, revenue: 28350, state: "CA", productId: 2 },
    { date: "2024-01-27", sales: 1950, revenue: 29250, state: "NY", productId: 3 },
    { date: "2024-01-28", sales: 1820, revenue: 27300, state: "TX", productId: 1 },
    { date: "2024-01-29", sales: 1710, revenue: 25650, state: "FL", productId: 2 },
    { date: "2024-01-30", sales: 1880, revenue: 28200, state: "IL", productId: 3 }
  ]
};

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_users INTEGER,
    active_users INTEGER,
    revenue INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY,
    user TEXT,
    action TEXT,
    time TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    sales INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sales_over_time (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    sales INTEGER,
    revenue INTEGER,
    state TEXT,
    product_id INTEGER
  )`);

  db.run(`DELETE FROM metrics`);
  db.run(`DELETE FROM activities`);
  db.run(`DELETE FROM products`);
  db.run(`DELETE FROM sales_over_time`);

  db.run(`INSERT INTO metrics (total_users, active_users, revenue) VALUES (?, ?, ?)`,
    [mockData.metrics.totalUsers, mockData.metrics.activeUsers, mockData.metrics.revenue]);

  const activityStmt = db.prepare(`INSERT INTO activities (id, user, action, time) VALUES (?, ?, ?, ?)`);
  mockData.activities.forEach(activity => {
    activityStmt.run(activity.id, activity.user, activity.action, activity.time);
  });
  activityStmt.finalize();

  const productStmt = db.prepare(`INSERT INTO products (id, name, sales) VALUES (?, ?, ?)`);
  mockData.products.forEach(product => {
    productStmt.run(product.id, product.name, product.sales);
  });
  productStmt.finalize();

  const salesStmt = db.prepare(`INSERT INTO sales_over_time (date, sales, revenue, state, product_id) VALUES (?, ?, ?, ?, ?)`);
  mockData.salesOverTime.forEach(sale => {
    salesStmt.run(sale.date, sale.sales, sale.revenue, sale.state, sale.productId);
  });
  salesStmt.finalize();

  console.log('Database setup completed!');
});

db.close(); 