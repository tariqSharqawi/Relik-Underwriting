import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RiskDimension } from '@/lib/ai/risk-assessment'
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

interface RiskDimensionCardProps {
  dimension: RiskDimension
}

function getRiskColor(score: number) {
  if (score <= 3) return 'text-green-600'
  if (score <= 6) return 'text-amber-600'
  return 'text-red-600'
}

function getRiskBgColor(score: number) {
  if (score <= 3) return 'bg-green-100'
  if (score <= 6) return 'bg-amber-100'
  return 'bg-red-100'
}

function getRiskLabel(score: number) {
  if (score <= 3) return 'Low Risk'
  if (score <= 6) return 'Medium Risk'
  return 'High Risk'
}

function getRiskIcon(score: number) {
  if (score <= 3) return CheckCircle
  if (score <= 6) return AlertCircle
  return AlertTriangle
}

export function RiskDimensionCard({ dimension }: RiskDimensionCardProps) {
  const Icon = getRiskIcon(dimension.score)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{dimension.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${getRiskColor(dimension.score)}`} />
            <span className={`text-lg font-bold font-mono ${getRiskColor(dimension.score)}`}>
              {dimension.score}/10
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`rounded-lg p-3 ${getRiskBgColor(dimension.score)}`}>
          <p className={`text-sm font-medium ${getRiskColor(dimension.score)}`}>
            {getRiskLabel(dimension.score)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Risk Factors:</p>
          <ul className="space-y-1">
            {dimension.factors.map((factor, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
