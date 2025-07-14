# Dashboard Backend

This backend replaces the mock data with a SQLite database.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
node setup-db.js
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

- `GET /api/metrics` - Get dashboard metrics
- `GET /api/activities` - Get user activities
- `GET /api/products` - Get product sales data
- `GET /api/sales-over-time` - Get sales time series data

## Database

The SQLite database (`dashboard.db`) contains:
- `metrics` table - Dashboard metrics
- `activities` table - User activities
- `products` table - Product information
- `sales_over_time` table - Time series sales data

## Development

For development with auto-reload:
```bash
npm run dev
``` 