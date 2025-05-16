import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeSeriesData } from '../../api/types';
import { format } from 'date-fns';
import { formatAmount, formatNumber } from '../../utils/format';

interface BidirectionalFlowChartProps {
  data: TimeSeriesData[];
  title: string;
}

export function BidirectionalFlowChart({ data, title }: BidirectionalFlowChartProps) {
  const formattedData = data.map((item) => {
    const inflow = Number(formatAmount(item.inflow));
    const outflow = Number(formatAmount(item.outflow));
    return {
      time: format(new Date(item.time * 1000), 'MMM dd HH:mm'),
      inflow: isNaN(inflow) ? 0 : inflow,
      outflow: isNaN(outflow) ? 0 : -outflow, // Convert to negative to display below
    };
  });

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={0}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 12 }} tickLine={{ stroke: '#E5E7EB' }} />
            <YAxis
              stroke="#6B7280"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `${formatNumber(Math.abs(value))} NXPC`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [`${formatNumber(Math.abs(value))} NXPC`, '']}
            />
            <Bar dataKey="inflow" fill="#10B981" name="Inflow" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" fill="#EF4444" name="Outflow" radius={[0, 0, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
