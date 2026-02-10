import type { Database } from '@/types/supabase'

type Deal = Database['public']['Tables']['deals']['Row']

interface DealMetricsGridProps {
  deal: Deal
}

function formatCurrency(value: number | null | undefined) {
  if (!value) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number | null | undefined) {
  if (!value) return 'N/A'
  return `${(value * 100).toFixed(2)}%`
}

function formatMultiple(value: number | null | undefined) {
  if (!value) return 'N/A'
  return `${value.toFixed(2)}x`
}

export function DealMetricsGrid({ deal }: DealMetricsGridProps) {
  const metrics = [
    {
      label: 'Cap Rate (Purchase)',
      value: formatPercent(deal.cap_rate_purchase),
    },
    {
      label: 'NOI (Current)',
      value: formatCurrency(deal.noi_current),
    },
    {
      label: 'Equity Multiple',
      value: formatMultiple(deal.equity_multiple),
    },
    {
      label: 'IRR',
      value: formatPercent(deal.irr),
    },
    {
      label: 'Expense Ratio',
      value: formatPercent(deal.expense_ratio),
    },
    {
      label: 'Max Offer Price',
      value: formatCurrency(deal.max_offer_price),
    },
  ]

  const hasAnyMetrics = metrics.some((m) => m.value !== 'N/A')

  if (!hasAnyMetrics) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No metrics calculated yet. Run a napkin analysis to see metrics.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border bg-card p-4"
        >
          <h3 className="text-sm font-medium text-muted-foreground">
            {metric.label}
          </h3>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  )
}
