import { FlowStats, TimeSeriesData, Transaction } from './types';

const API_BASE_URL = 'http://localhost:3000';
export const fetchFlowStats = async (): Promise<FlowStats> => {
  const response = await fetch(`${API_BASE_URL}/api/flow/stats`);
  return response.json();
};

export const fetchTimeSeriesData = async (period: string): Promise<TimeSeriesData[]> => {
  const response = await fetch(`${API_BASE_URL}/api/flow/time-series?period=${period}`);
  return response.json();
};

export const fetchRecentTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(`${API_BASE_URL}/api/flow/transactions`);
  return response.json();
};
