import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [dashboardData, setDashboardData] = useState({
    metrics: {},
    activities: [],
    products: [],
    salesOverTime: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, activitiesRes, productsRes, salesRes] = await Promise.all([
          fetch('http://localhost:3001/api/metrics'),
          fetch('http://localhost:3001/api/activities'),
          fetch('http://localhost:3001/api/products'),
          fetch('http://localhost:3001/api/sales-over-time')
        ]);

        if (!metricsRes.ok || !activitiesRes.ok || !productsRes.ok || !salesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [metrics, activities, products, salesOverTime] = await Promise.all([
          metricsRes.json(),
          activitiesRes.json(),
          productsRes.json(),
          salesRes.json()
        ]);

        setDashboardData({
          metrics: {
            totalUsers: metrics.total_users,
            activeUsers: metrics.active_users,
            revenue: metrics.revenue
          },
          activities,
          products,
          salesOverTime
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Product Analytics Dashboard</h1>
      </header>
      
      <div className="dashboard-content">
        <div className="card">
          <h2>Key Metrics</h2>
          <div className="metrics-grid">
            <div className="metric">
              <div className="metric-value">{dashboardData.metrics.totalUsers?.toLocaleString()}</div>
              <div className="metric-label">Total Users</div>
            </div>
            <div className="metric">
              <div className="metric-value">{dashboardData.metrics.activeUsers?.toLocaleString()}</div>
              <div className="metric-label">Active Users</div>
            </div>
            <div className="metric">
              <div className="metric-value">${dashboardData.metrics.revenue?.toLocaleString()}</div>
              <div className="metric-label">Revenue</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>User Activity</h2>
          <div className="activity-list">
            {dashboardData.activities.map(activity => (
              <div key={activity.id} className="activity-item">
                <span className="activity-user">{activity.user}</span>
                <span className="activity-action">{activity.action}</span>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Top Products</h2>
          <div className="products-list">
            {dashboardData.products.map(product => (
              <div key={product.id} className="product-item">
                <span className="product-name">{product.name}</span>
                <span className="product-sales">{product.sales} sales</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 