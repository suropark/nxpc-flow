import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { fetchTimeSeriesData } from './api/flow';
import { TransactionList } from './components/TransactionList';
import { BidirectionalFlowChart } from './components/charts/BidirectionalFlowChart';
import { TransactionSnackbar } from './components/TransactionSnackbar';
import { useState } from 'react';

const queryClient = new QueryClient();

const PERIODS = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '1y', label: '1 Year' },
] as const;

function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<(typeof PERIODS)[number]['value']>('24h');

  const { data: timeSeriesData, isLoading: isTimeSeriesLoading } = useQuery({
    queryKey: ['timeSeriesData', selectedPeriod],
    queryFn: () => fetchTimeSeriesData(selectedPeriod),
  });

  if (isTimeSeriesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-medium text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">NXPC Flow Dashboard</h1>
        </div>
      </header>
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Period Selector */}
          <div className="mt-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h2 className="text-base font-semibold leading-6 text-gray-900">Time Period</h2>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
                  className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                >
                  {PERIODS.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="mt-8 grid grid-cols-1 gap-8">
            <BidirectionalFlowChart data={timeSeriesData || []} title="Flow Over Time" />
            {/* <BidirectionalLineChart data={timeSeriesData || []} title="Net Flow" /> */}
          </div>

          {/* Recent Transactions */}
          <div className="mt-8">
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Transactions</h3>
              <TransactionList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-full">
        <TransactionSnackbar isTestMode={false} />
        <Dashboard />
      </div>
    </QueryClientProvider>
  );
}

export default App;
