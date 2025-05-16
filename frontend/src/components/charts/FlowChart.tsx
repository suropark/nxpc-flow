import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FlowChartProps {
  data: Array<{
    time: string;
    inflow: number;
    outflow: number;
  }>;
  title: string;
}

export function FlowChart({ data, title }: FlowChartProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
      <div className="mt-4 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="inflow" stackId="1" stroke="#10B981" fill="#10B981" />
            <Area type="monotone" dataKey="outflow" stackId="1" stroke="#EF4444" fill="#EF4444" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
