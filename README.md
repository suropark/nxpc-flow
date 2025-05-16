# NXPC Flow

A service that tracks and visualizes NXPC token transactions on the Avalanche blockchain, specifically focusing on bridge-related transactions.

## Features

- Tracks NXPC token bridge transactions (inflow/outflow)
- Historical data synchronization from deployment block
- Real-time transaction monitoring
- RESTful API for transaction data
- Efficient block processing with batch operations
- Automatic timestamp calculation based on block numbers
- Interactive charts for transaction visualization
- Time series data aggregation (hourly, daily, monthly)

## Development Status

### In Progress

- Transaction event timestamp accuracy improvement
- Enhanced chart data visualization
- Time series granularity options (15min, 5min intervals)
- Transaction table filtering by time series selection
- Real-time transaction widget in header (similar to pump.fun)

### Planned Features

- Transaction event timestamp accuracy enhancement

  - Implement more precise timestamp calculation
  - Add block confirmation time consideration
  - Improve historical data accuracy

- Enhanced Chart Visualization

  - Add multiple chart types (candlestick, volume, etc.)
  - Implement interactive chart features
  - Add technical indicators
  - Improve chart responsiveness and performance

- Flexible Time Series Intervals

  - Support for 5-minute intervals
  - Support for 15-minute intervals
  - Custom interval selection
  - Dynamic data aggregation
  - Real-time data updates

- Transaction Table Integration

  - Filter transactions by selected time period
  - Real-time table updates
  - Enhanced transaction details view
  - Sorting and filtering capabilities
  - Transaction type indicators

- Real-time Transaction Widget
  - Live transaction counter in header
  - Instant inflow/outflow updates
  - Transaction type indicators
  - Quick transaction details preview
  - WebSocket integration for real-time updates

## Tech Stack

- **Frontend**:

  - React with TypeScript
  - Recharts for data visualization
  - Tailwind CSS for styling
  - Shadcn UI components

- **Backend**:
  - Hono (TypeScript)
  - Bun runtime
  - Supabase (PostgreSQL)
  - Viem for Avalanche interaction

## Project Structure

```
.
├── frontend/
│   ├── src/
│   │   ├── api/           # API integration
│   │   ├── components/    # React components
│   │   │   ├── charts/    # Chart components
│   │   │   └── ui/        # UI components
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── package.json
│
└── src/
    ├── config/            # Configuration files
    ├── services/          # Business logic
    ├── types/            # TypeScript types
    ├── routes/           # API endpoints
    └── index.ts          # Main server file
```

## API Endpoints

- `GET /api/flow/time-series` - Get time series data with period parameter
- `GET /api/flow/transactions` - Get paginated transaction list
- `GET /api/flow/transactions/:address` - Get transactions for a specific address
- `GET /api/flow/transactions/tx/:hash` - Get transaction details by hash
- `POST /api/flow/sync` - Manually trigger historical data sync

## Database Schema

### transactions

- `id` (text, primary key) - Transaction hash
- `hash` (text) - Transaction hash
- `from_address` (text) - Sender address
- `to_address` (text) - Recipient address
- `value` (text) - Transaction amount
- `timestamp` (bigint) - Block timestamp
- `type` (text) - Transaction type (inflow/outflow)
- `block_number` (bigint) - Block number
- `created_at` (timestamp) - Record creation time

### flow_time_series_realtime

- `period_type` (text) - Type of period (hourly/daily/monthly)
- `period_id` (text) - Period identifier
- `first_timestamp` (text) - Start time of the period
- `inflow_amount` (text) - Total inflow for the period
- `outflow_amount` (text) - Total outflow for the period
- `last_updated` (timestamp) - Last update time

### sync_status

- `id` (text, primary key) - Sync status identifier
- `last_synced_block` (bigint) - Last processed block number
- `updated_at` (timestamp) - Last update time

## Setup

1. Install dependencies:

```bash
# Backend
bun install

# Frontend
cd frontend
npm install
```

2. Set up environment variables:

```env
# Backend
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Frontend
VITE_API_URL=http://localhost:3000
```

3. Create database tables in Supabase (see SQL snippets in docs)

4. Start the development servers:

```bash
# Backend
bun run dev

# Frontend
cd frontend
npm run dev
```

## Development

The service automatically syncs historical data on startup and continues to monitor new blocks. The sync process:

1. Fetches the last synced block from the database
2. Processes blocks in batches of 1000
3. Updates the sync status after each successful batch
4. Handles errors gracefully without interrupting the sync process

## License

MIT
