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
});

// Time series data retrieval
transactions.get('/time-series', zValidator('query', timeSeriesSchema), async (c) => {
  const { period } = c.req.valid('query');
  try {
    const data = await getTimeSeriesData(period);
    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch time series data' }, 500);
  }
});

// All transaction history retrieval
transactions.get('/transactions', async (c) => {
  try {
    // Parse query parameters
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');

    // Validate parameters
    if (isNaN(page) || page < 1) {
      return c.json({ success: false, error: 'Invalid page number' }, 400);
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return c.json({ success: false, error: 'Invalid limit value' }, 400);
    }

    const transactions = await getTransactions(page, limit);
    return c.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        hasMore: transactions.length === limit,
      },
    });
  } catch (error) {
    console.error('Error in transactions route:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch transactions',
      },
      500
    );
  }
});

export default transactions;
