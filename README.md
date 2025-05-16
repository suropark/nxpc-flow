# NXPC Flow

A service that tracks and visualizes NXPC token transactions on the Avalanche blockchain, specifically focusing on bridge-related transactions.

## Features

- Tracks NXPC token bridge transactions (inflow/outflow)
- Historical data synchronization from deployment block
- Real-time transaction monitoring
- RESTful API for transaction data
- Efficient block processing with batch operations
- Automatic timestamp calculation based on block numbers

## Tech Stack

- **Backend**: Hono (TypeScript)
- **Runtime**: Bun
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Viem for Avalanche interaction

## Project Structure

```
src/
├── config/
│   ├── constants.ts        # Blockchain and contract constants
│   └── supabase.ts         # Supabase client configuration
├── services/
│   ├── blockchain.ts       # Blockchain interaction logic
│   └── transaction.ts      # Transaction data handling
├── types/
│   └── index.ts           # TypeScript type definitions
├── routes/
│   └── transactions.ts     # API endpoints
└── index.ts               # Main server file
```

## API Endpoints

- `GET /api/transactions/:address` - Get transactions for a specific address
- `GET /api/transactions/tx/:hash` - Get transaction details by hash
- `POST /api/transactions/sync` - Manually trigger historical data sync

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

### sync_status

- `id` (text, primary key) - Sync status identifier
- `last_synced_block` (bigint) - Last processed block number
- `updated_at` (timestamp) - Last update time

## Setup

1. Install dependencies:

```bash
bun install
```

2. Set up environment variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Create database tables in Supabase (see SQL snippets in docs)

4. Start the server:

```bash
bun run dev
```

## Development

The service automatically syncs historical data on startup and continues to monitor new blocks. The sync process:

1. Fetches the last synced block from the database
2. Processes blocks in batches of 1000
3. Updates the sync status after each successful batch
4. Handles errors gracefully without interrupting the sync process

## License

MIT
