import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { fetchHistoricalData } from '../services/blockchain';
import { saveTransaction, getTransactions, saveEvents } from '../services/transaction';
import { getTimeSeriesData } from '../services/timeSeries';

const transactions = new Hono();

const addressSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  type: z.enum(['inflow', 'outflow']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

const timeSeriesSchema = z.object({
  period: z.enum(['24h', '7d', '30d', '1y']),
  type: z.enum(['hourly', 'daily', 'monthly']).optional(),
});

transactions.get('/:address', zValidator('param', addressSchema), async (c) => {
  const { address, type, limit, offset } = c.req.valid('param');
  try {
    const transactions = await getTransactions(address, type, limit, offset);
    return c.json({ success: true, data: transactions });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch transactions' }, 500);
  }
});

transactions.post('/sync', async (c) => {
  try {
    await fetchHistoricalData();
    return c.json({ success: true, message: 'Historical data sync started' });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to sync historical data' }, 500);
  }
});

// 시계열 데이터 조회
transactions.get('/time-series', zValidator('query', timeSeriesSchema), async (c) => {
  const { period, type } = c.req.valid('query');
  try {
    const data = await getTimeSeriesData(period, type);
    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch time series data' }, 500);
  }
});

export default transactions;
