import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Props {
  data: { name: string; value: number }[];
  height?: number;
  onBarClick?: (data: { name?: string; value?: number | [number, number] }) => void;
}

const ChartLoader = ({ height = 400 }: { height?: number }) => (
  <div className="flex items-center justify-center" style={{ height }}>
    <div className="w-8 h-8 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const BarChartComponent: React.FC<Props> = ({ data, height = 400, onBarClick }) => (
  <React.Suspense fallback={<ChartLoader height={height} />}>
    <div className="min-h-0 relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar
            dataKey="value"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            barSize={30}
            onClick={onBarClick}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </React.Suspense>
);

export default BarChartComponent;
