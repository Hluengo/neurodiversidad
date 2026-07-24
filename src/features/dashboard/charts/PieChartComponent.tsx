import React from 'react';
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { PieLabel } from 'recharts';

interface Props {
  data: { name: string; value: number }[];
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  label?: PieLabel;
  colors?: string[];
}

const ChartLoader = () => (
  <div className="h-[350px] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
  </div>
);

const DEFAULT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#84cc16'];

export const PieChartComponent: React.FC<Props> = ({
  data,
  innerRadius = 80,
  outerRadius = 110,
  paddingAngle = 5,
  label,
  colors = DEFAULT_COLORS
}) => (
  <React.Suspense fallback={<ChartLoader />}>
    <div className="h-[350px] min-h-0 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            dataKey="value"
            label={label}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </React.Suspense>
);

export default PieChartComponent;
