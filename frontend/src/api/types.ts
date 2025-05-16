export interface Transaction {
  id: string;
  hash: string;
  from_address: string;
  to_address: string;
  value: number;
  timestamp: number;
  type: 'inflow' | 'outflow';
  block_number: number;
}

export interface TimeSeriesData {
  time: number;
  inflow: string;
  outflow: string;
  from: string;
  to: string;
  amount: string;
  txHash: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  success: false;
  error: string;
}
