'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ExpenseBreakdownProps {
  data: {
    payroll: number
    dietary: number
    utilities: number
    insurance: number
    managementFee: number
    maintenance: number
    marketing: number
    admin: number
    otherExpenses: number
  }
}

const COLORS = {
  payroll: '#18312E', // Evergreen
  dietary: '#B8986A', // Gold
  utilities: '#697374', // Gray
  insurance: '#020E0E', // Dark
  managementFee: '#4A7C59',
  maintenance: '#8B7355',
  marketing: '#9CA3A4',
  admin: '#2A4D3A',
  otherExpenses: '#D4C4B0',
}

export function ExpenseBreakdown({ data }: ExpenseBreakdownProps) {
  const chartData = [
    { name: 'Payroll', value: data.payroll },
    { name: 'Dietary', value: data.dietary },
    { name: 'Utilities', value: data.utilities },
    { name: 'Insurance', value: data.insurance },
    { name: 'Management Fee', value: data.managementFee },
    { name: 'Maintenance', value: data.maintenance },
    { name: 'Marketing', value: data.marketing },
    { name: 'Admin', value: data.admin },
    { name: 'Other Expenses', value: data.otherExpenses },
  ].filter((item) => item.value > 0) // Only show non-zero categories

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  // Custom label to show percentage
  const renderLabel = (entry: { percent?: number }) => {
    const percent = ((entry.percent ?? 0) * 100).toFixed(0)
    return `${percent}%`
  }

  return (
    <div className="w-full">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    COLORS[entry.name.toLowerCase().replace(/\s+/g, '') as keyof typeof COLORS] ||
                    '#697374'
                  }
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) => formatPercent(value ?? 0)}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    COLORS[item.name.toLowerCase().replace(/\s+/g, '') as keyof typeof COLORS] ||
                    '#697374',
                }}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <span className="text-sm font-mono tabular-nums text-muted-foreground">
              {formatPercent(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
