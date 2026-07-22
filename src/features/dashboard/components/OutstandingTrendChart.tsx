/**
 * Purpose: Dashboard's "Outstanding Trend" chart — line chart of outstanding balance per month
 * Responsibilities: Render the Recharts LineChart with our design tokens; pure presentation,
 *                    data comes from useOutstandingTrend()
 * Dependencies: recharts, formatCompactCurrency
 * Export: OutstandingTrendChart
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { OutstandingTrendPoint } from '../../../types/dashboard.types';
import { formatCompactCurrency, formatCurrency } from '../../../utils/formatCurrency';

export interface OutstandingTrendChartProps {
  data: OutstandingTrendPoint[];
}

export function OutstandingTrendChart({ data }: OutstandingTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: '#64748B' }}
          tickFormatter={(value: number) => formatCompactCurrency(value)}
          width={56}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="outstanding"
          name="Outstanding"
          stroke="#2563EB"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#2563EB' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
