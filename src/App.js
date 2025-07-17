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
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

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

  const handleExport = async (format, selectedTypes) => {
    setExportLoading(true);
    try {
      const types = selectedTypes.length > 0 ? selectedTypes.join(',') : 'all';
      const response = await fetch(`http://localhost:3001/api/export?format=${format}&types=${types}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'csv' ? 'csv' : 'json';
      a.download = `dashboard-export-${timestamp}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setShowExportModal(false);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Product Analytics Dashboard</h1>
        <button 
          className="export-button"
          onClick={() => setShowExportModal(true)}
        >
          📊 Export Data
        </button>
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

      {showExportModal && (
        <ExportModal 
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
          loading={exportLoading}
        />
      )}
    </div>
  );
};

const ExportModal = ({ onExport, onClose, loading }) => {
  const [format, setFormat] = useState('csv');
  const [selectedTypes, setSelectedTypes] = useState(['metrics', 'activities', 'products', 'sales']);

  const dataTypes = [
    { id: 'metrics', label: 'Key Metrics' },
    { id: 'activities', label: 'User Activities' },
    { id: 'products', label: 'Products Data' },
    { id: 'sales', label: 'Sales Over Time' }
  ];

  const handleTypeToggle = (typeId) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleExport = () => {
    if (selectedTypes.length === 0) {
      alert('Please select at least one data type to export');
      return;
    }
    onExport(format, selectedTypes);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Export Dashboard Data</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="export-section">
            <h3>Export Format</h3>
            <div className="format-options">
              <label>
                <input
                  type="radio"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value)}
                />
                CSV (Spreadsheet)
              </label>
              <label>
                <input
                  type="radio"
                  value="json"
                  checked={format === 'json'}
                  onChange={(e) => setFormat(e.target.value)}
                />
                JSON (Data)
              </label>
            </div>
          </div>

          <div className="export-section">
            <h3>Data to Export</h3>
            <div className="data-type-options">
              {dataTypes.map(type => (
                <label key={type.id}>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type.id)}
                    onChange={() => handleTypeToggle(type.id)}
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="export-button-modal" 
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App; 