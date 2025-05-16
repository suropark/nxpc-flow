import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TimeSeriesData } from '../../api/types';
import { format } from 'date-fns';
import { formatAmount, formatNumber } from '../../utils/format';

interface BidirectionalLineChartProps {
  data: TimeSeriesData[];
  title: string;
}

export function BidirectionalLineChart({ data, title }: BidirectionalLineChartProps) {
  const formattedData = data.map((item) => {
    const inflow = Number(formatAmount(item.inflow));
    const outflow = Number(formatAmount(item.outflow));
    const netFlow = isNaN(inflow) || isNaN(outflow) ? 0 : inflow - outflow;
    return {
      time: format(new Date(item.time * 1000), 'MMM dd HH:mm'),
      netFlow,
    };
  });

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 12 }} tickLine={{ stroke: '#E5E7EB' }} />
            <YAxis
              stroke="#6B7280"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `${value < 0 ? '-' : ''}${formatNumber(Math.abs(value))} NXPC`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => [`${value < 0 ? '-' : ''}${formatNumber(Math.abs(value))} NXPC`, 'Net Flow']}
            />
            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="netFlow"
              stroke="#0EA5E9"
              strokeWidth={2}
              dot={{ r: 4, fill: '#0EA5E9' }}
              activeDot={{ r: 6, fill: '#0EA5E9' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
