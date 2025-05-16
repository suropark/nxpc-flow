export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: 'inflow' | 'outflow';
  blockNumber: number;
}

export interface TransactionResponse {
  success: boolean;
  data?: Transaction;
  error?: string;
}
