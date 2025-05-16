import { Transaction, FlowStats, TimeSeriesData } from './types';

const API_BASE_URL = 'http://localhost:3000';

// Mock data
const mockFlowStats: FlowStats = {
  totalInflow: '1,234,567',
  totalOutflow: '987,654',
  netFlow: '246,913',
  inflowChange: 12.5,
  outflowChange: -8.3,
  netFlowChange: 4.2,
};

// Generate time series data for different periods
function generateTimeSeriesData(period: '24h' | '7d' | '30d' | '1y'): TimeSeriesData[] {
  const now = new Date();
  const data: TimeSeriesData[] = [];

  switch (period) {
    case '24h':
      // Hourly data for last 24 hours
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600000);
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          inflow: Math.floor(Math.random() * 1000) + 500,
          outflow: Math.floor(Math.random() * 800) + 300,
        });
      }
      break;
    case '7d':
      // Daily data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 86400000);
        data.push({
          time: time.toLocaleDateString('en-US', { weekday: 'short' }),
          inflow: Math.floor(Math.random() * 5000) + 2000,
          outflow: Math.floor(Math.random() * 4000) + 1500,
        });
      }
      break;
    case '30d':
      // Daily data for last 30 days
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 86400000);
        data.push({
          time: time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          inflow: Math.floor(Math.random() * 8000) + 3000,
          outflow: Math.floor(Math.random() * 6000) + 2000,
        });
      }
      break;
    case '1y':
      // Monthly data for last 12 months
      for (let i = 11; i >= 0; i--) {
        const time = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({
          time: time.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          inflow: Math.floor(Math.random() * 20000) + 10000,
          outflow: Math.floor(Math.random() * 15000) + 8000,
        });
      }
      break;
  }

  return data;
}

const mockTransactions: Transaction[] = Array.from({ length: 10 }, (_, i) => ({
  id: `tx-${i}`,
  blockNumber: 1000000 + i,
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  from: `0x${Math.random().toString(16).slice(2, 42)}`,
  to: `0x${Math.random().toString(16).slice(2, 42)}`,
  value: (Math.random() * 1000).toFixed(2),
  type: Math.random() > 0.5 ? 'inflow' : 'outflow',
}));

export async function fetchFlowStats(): Promise<FlowStats> {
  const response = await fetch(`${API_BASE_URL}/api/flow/stats`);
  if (!response.ok) throw new Error('Failed to fetch flow stats');
  return response.json();
}

export async function fetchTimeSeriesData(period: '24h' | '7d' | '30d' | '1y' = '24h'): Promise<TimeSeriesData[]> {
  const response = await fetch(`${API_BASE_URL}/api/flow/time-series?period=${period}`);
  if (!response.ok) throw new Error('Failed to fetch time series data');
  return response.json();
}

export async function fetchRecentTransactions(): Promise<Transaction[]> {
  const response = await fetch(`${API_BASE_URL}/api/flow/transactions?limit=10`);
  if (!response.ok) throw new Error('Failed to fetch recent transactions');
  return response.json();
}
