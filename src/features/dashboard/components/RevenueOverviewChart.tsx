/**
 * Purpose: Dashboard's "Revenue Overview" chart — grouped bars of Invoiced vs Received per month
 * Responsibilities: Render the Recharts BarChart with our design tokens; pure presentation,
 *                    data comes from useRevenueOverview()
 * Dependencies: recharts, formatCompactCurrency
 * Export: RevenueOverviewChart
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RevenuePoint } from '../../../types/dashboard.types';
import { formatCompactCurrency, formatCurrency } from '../../../utils/formatCurrency';

export interface RevenueOverviewChartProps {
  data: RevenuePoint[];
}

export function RevenueOverviewChart({ data }: RevenueOverviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
        <Bar dataKey="invoiced" name="Invoiced" fill="#93C5FD" radius={[4, 4, 0, 0]} />
        <Bar dataKey="received" name="Received" fill="#2563EB" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
