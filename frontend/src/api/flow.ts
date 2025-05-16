import { TimeSeriesData, Transaction, PaginatedResponse } from './types';

const API_BASE_URL = 'http://localhost:3000';

export const fetchTimeSeriesData = async (period: string): Promise<TimeSeriesData[]> => {
  // 실제 API 호출 코드 (주석 처리)
  const response = await fetch(`${API_BASE_URL}/api/flow/time-series?period=${period}`);
  if (!response.ok) {
    throw new Error('Failed to fetch time series data');
  }
  const data = await response.json();
  console.log(data, 'data');
  return data.data;
};

export const fetchTransactions = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Transaction>> => {
  const response = await fetch(`${API_BASE_URL}/api/flow/transactions?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
};
