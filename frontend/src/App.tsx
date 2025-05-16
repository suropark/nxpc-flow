import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { fetchFlowStats, fetchTimeSeriesData } from './api/flow';
import { TransactionList } from './components/TransactionList';
import { FlowChart } from './components/charts/FlowChart';
import { LineChart } from './components/charts/LineChart';
import { BarChart } from './components/charts/BarChart';
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

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['flowStats'],
    queryFn: fetchFlowStats,
  });

  const { data: timeSeriesData, isLoading: isTimeSeriesLoading } = useQuery({
    queryKey: ['timeSeriesData', selectedPeriod],
    queryFn: () => fetchTimeSeriesData(selectedPeriod),
  });

  if (isStatsLoading || isTimeSeriesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-medium text-gray-900">Loading...</div>
      </div>
    );
  }

  // Calculate net flow data
  const netFlowData = timeSeriesData?.map((item) => ({
    time: item.time,
    value: item.inflow - item.outflow,
  }));

  // Calculate cumulative flow data
  const cumulativeData = timeSeriesData?.reduce((acc, item, index) => {
    const prevCumulative = index > 0 ? acc[index - 1].value : 0;
    const netFlow = item.inflow - item.outflow;
    return [...acc, { time: item.time, value: prevCumulative + netFlow }];
  }, [] as Array<{ time: string; value: number }>);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">NXPC Flow Dashboard</h1>
        </div>
      </header>
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Inflow</dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-2xl font-semibold text-green-600">{stats?.totalInflow} NXPC</div>
                <div className="inline-flex items-baseline rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                  <ArrowUpIcon className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0" />
                  <span>{stats?.inflowChange}%</span>
                </div>
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Outflow</dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-2xl font-semibold text-red-600">{stats?.totalOutflow} NXPC</div>
                <div className="inline-flex items-baseline rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-800">
                  <ArrowDownIcon className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0" />
                  <span>{stats?.outflowChange}%</span>
                </div>
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Net Flow</dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-2xl font-semibold text-blue-600">{stats?.netFlow} NXPC</div>
                <div className="inline-flex items-baseline rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
                  <ArrowUpIcon className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0" />
                  <span>{stats?.netFlowChange}%</span>
                </div>
              </dd>
            </div>
          </div>

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
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <FlowChart data={timeSeriesData || []} title="Flow Over Time" />
            <LineChart data={netFlowData || []} title="Net Flow" color="#0EA5E9" />
            <BarChart
              data={timeSeriesData?.map((item) => ({ time: item.time, value: item.inflow })) || []}
              title="Inflow"
              color="#10B981"
            />
            <LineChart data={cumulativeData || []} title="Cumulative Flow" color="#8B5CF6" />
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
        <Dashboard />
      </div>
    </QueryClientProvider>
  );
}

export default App;
