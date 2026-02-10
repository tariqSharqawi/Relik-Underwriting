'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface T12ChartDataPoint {
  month: string
  grossRevenue: number
  totalExpenses: number
  noi: number
}

interface T12ChartProps {
  data: T12ChartDataPoint[]
}

export function T12Chart({ data }: T12ChartProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <Tooltip
            formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="grossRevenue"
            name="Gross Revenue"
            stroke="#18312E"
            strokeWidth={2}
            dot={{ fill: '#18312E', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="totalExpenses"
            name="Total Expenses"
            stroke="#697374"
            strokeWidth={2}
            dot={{ fill: '#697374', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="noi"
            name="NOI"
            stroke="#B8986A"
            strokeWidth={3}
            dot={{ fill: '#B8986A', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
