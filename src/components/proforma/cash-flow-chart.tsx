'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ProformaYear } from '@/lib/calculations/proforma'

interface CashFlowChartProps {
  years: ProformaYear[]
}

export function CashFlowChart({ years }: CashFlowChartProps) {
  const chartData = years.map((year) => ({
    year: `Year ${year.year}`,
    cashFlow: year.cashFlow,
    refiDistribution: year.refiDistribution || 0,
    exitProceeds: year.exitProceeds || 0,
  }))

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
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} className="text-muted-foreground" />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar
            dataKey="cashFlow"
            name="Operating Cash Flow"
            stackId="a"
            fill="#697374"
          />
          <Bar
            dataKey="refiDistribution"
            name="Refi Distribution"
            stackId="a"
            fill="#B8986A"
          />
          <Bar
            dataKey="exitProceeds"
            name="Exit Proceeds"
            stackId="a"
            fill="#18312E"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
