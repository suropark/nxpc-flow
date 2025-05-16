export interface Transaction {
  id: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  type: 'inflow' | 'outflow';
}

export interface FlowStats {
  totalInflow: string;
  totalOutflow: string;
  netFlow: string;
  inflowChange: number;
  outflowChange: number;
  netFlowChange: number;
}

export interface TimeSeriesData {
  time: string;
  inflow: number;
  outflow: number;
}
