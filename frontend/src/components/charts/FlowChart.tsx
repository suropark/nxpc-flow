import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeSeriesData } from '../../api/types';
import { format } from 'date-fns';
import { formatAmount } from '../../utils/format';

interface FlowChartProps {
  data: TimeSeriesData[];
  title: string;
}

export function FlowChart({ data, title }: FlowChartProps) {
  const formattedData = data.map((item) => ({
    time: format(new Date(item.time), 'MMM dd HH:mm'),
    inflow: Number(formatAmount(item.inflow)),
    outflow: Number(formatAmount(item.outflow)),
  }));

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="inflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 12 }} tickLine={{ stroke: '#E5E7EB' }} />
            <YAxis
              stroke="#6B7280"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `${value.toLocaleString()} NXPC`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [`${value.toLocaleString()} NXPC`, '']}
            />
            <Area type="monotone" dataKey="inflow" stroke="#10B981" fillOpacity={1} fill="url(#inflow)" name="Inflow" />
            <Area type="monotone" dataKey="outflow" stroke="#EF4444" fillOpacity={1} fill="url(#outflow)" name="Outflow" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
