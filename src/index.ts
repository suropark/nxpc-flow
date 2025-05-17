import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { serveStatic } from 'hono/serve-static';
import { compress } from 'hono/compress';
import { timing } from 'hono/timing';
import { cache } from 'hono/cache';
import { etag } from 'hono/etag';
import { basicAuth } from 'hono/basic-auth';
import { jwt } from 'hono/jwt';
import { secureHeaders } from 'hono/secure-headers';
import transactions from './routes/transactions';
import { fetchHistoricalData } from './services/blockchain';

const app = new Hono();

// CORS 설정
app.use('*', cors());

app.use('*', logger());
app.route('/api/flow', transactions);

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
