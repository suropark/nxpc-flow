import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart, Line, TooltipProps } from 'recharts';
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
      positiveFlow: netFlow > 0 ? netFlow : 0,
      negativeFlow: netFlow < 0 ? netFlow : 0,
    };
  });

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length && typeof payload[0].value === 'number') {
      const value = payload[0].value;
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg ring-1 ring-black ring-opacity-5">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-sm font-medium text-gray-900">{`${value < 0 ? '-' : ''}${formatNumber(Math.abs(value))} NXPC`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">{title}</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="time" stroke="#6B7280" tick={{ fontSize: 12 }} tickLine={{ stroke: '#E5E7EB' }} />
            <YAxis
              stroke="#6B7280"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `${value < 0 ? '-' : ''}${formatNumber(Math.abs(value))} NXPC`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="positiveFlow" fill="url(#colorPositive)" stroke="none" />
            <Area type="monotone" dataKey="negativeFlow" fill="url(#colorNegative)" stroke="none" />
            <Line
              type="monotone"
              dataKey="netFlow"
              stroke="#1F2937"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#1F2937' }}
              activeDot={{ r: 6, fill: '#1F2937' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
