import { Hono } from 'hono';
import { logger } from 'hono/logger';
import transactions from './routes/transactions';
import { fetchHistoricalData } from './services/blockchain';

const app = new Hono();

app.use('*', logger());
app.route('/api/transactions', transactions);

// 동기화 간격 (1분)
const SYNC_INTERVAL = 1 * 60 * 1000;

// 주기적 동기화 함수
async function startPeriodicSync() {
  try {
    console.log('Starting periodic sync...');
    await fetchHistoricalData();
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

// 서버 시작 시 즉시 한 번 실행하고, 이후 주기적으로 실행
startPeriodicSync();
setInterval(startPeriodicSync, SYNC_INTERVAL);

export default app;
