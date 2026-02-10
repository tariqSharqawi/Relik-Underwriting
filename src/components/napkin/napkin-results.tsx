import type { NapkinAnalysisResult } from '@/lib/ai/napkin-analysis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

interface NapkinResultsProps {
  results: NapkinAnalysisResult
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`
}

const recommendationConfig = {
  strong_buy: {
    label: 'Strong Buy',
    icon: CheckCircle,
    className: 'bg-green-600 text-white',
  },
  buy: {
    label: 'Buy',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-900',
  },
  hold: {
    label: 'Hold',
    icon: AlertCircle,
    className: 'bg-amber-100 text-amber-900',
  },
  pass: {
    label: 'Pass',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-900',
  },
  strong_pass: {
    label: 'Strong Pass',
    icon: AlertTriangle,
    className: 'bg-red-600 text-white',
  },
}

export function NapkinResults({ results }: NapkinResultsProps) {
  const metrics = [
    { label: 'Cap Rate', value: formatPercent(results.capRate) },
    { label: 'Expense Ratio', value: formatPercent(results.expenseRatio) },
    { label: 'Maximum Offer Price', value: formatCurrency(results.maxOfferPrice), highlight: true },
    { label: 'Annual Debt Service', value: formatCurrency(results.debtServiceAnnual) },
    { label: 'Cash-on-Cash Return', value: formatPercent(results.cashOnCashReturn) },
    { label: 'Confidence Score', value: `${results.confidence}/10` },
  ]

  const config = recommendationConfig[results.recommendation]
  const Icon = config.icon

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className={metric.highlight ? 'border-accent' : ''}>
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {metric.label}
              </h3>
              <p className="text-2xl font-bold font-mono tabular-nums">
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI Recommendation</CardTitle>
            <Badge className={config.className}>
              <Icon className="mr-1 h-4 w-4" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Summary</h4>
            <p className="text-sm text-muted-foreground">{results.summary}</p>
          </div>

          {results.redFlags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Red Flags
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {results.redFlags.map((flag, index) => (
                  <li key={index} className="text-sm text-red-600">{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {results.keyAssumptions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Key Assumptions</h4>
              <ul className="list-disc list-inside space-y-1">
                {results.keyAssumptions.map((assumption, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{assumption}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
