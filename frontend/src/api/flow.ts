import { TimeSeriesData, Transaction, PaginatedResponse } from './types';
import { supabase } from '../lib/supabase';

export const fetchTimeSeriesData = async (period: string): Promise<TimeSeriesData[]> => {
  let periodType: 'hourly' | 'daily' | 'monthly';
  let limit: number;

  switch (period) {
    case '24h':
      limit = 24;
      periodType = 'hourly';
      break;
    case '7d':
      limit = 7;
      periodType = 'daily';
      break;
    case '30d':
      limit = 30;
      periodType = 'daily';
      break;
    case '1y':
      limit = 12;
      periodType = 'monthly';
      break;
    default:
      limit = 24;
      periodType = 'hourly';
  }

  const { data, error } = await supabase
    .from('flow_time_series_realtime')
    .select('*')
    .eq('period_type', periodType)
    .order('first_timestamp', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch time series data: ${error.message}`);
  }

  return data.map((item) => ({
    time: Number(item.first_timestamp),
    inflow: item.inflow_amount,
    outflow: item.outflow_amount,
    from: '',
    to: '',
    amount: '',
    txHash: '',
  }));
};

export const fetchTransactions = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Transaction>> => {
  try {
    // limit이 20을 초과하지 않도록 설정
    const safeLimit = Math.min(limit, 20);
    const offset = (page - 1) * safeLimit;

    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false }) // 최신순 정렬
      .range(offset, offset + safeLimit - 1);

    if (error) {
      console.error('Error fetching transactions:', {
        page,
        limit,
        error: error.message,
      });
      throw error;
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit: safeLimit,
        hasMore: count ? offset + safeLimit < count : false,
      },
    };
  } catch (error) {
    console.error('Error in fetchTransactions:', error);
    throw error;
  }
};
