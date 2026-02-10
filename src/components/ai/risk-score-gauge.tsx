interface RiskScoreGaugeProps {
  score: number
  label?: string
}

export function RiskScoreGauge({ score, label = 'Overall Risk Score' }: RiskScoreGaugeProps) {
  // Clamp score between 1 and 10
  const clampedScore = Math.max(1, Math.min(10, score))

  // Calculate percentage for visual representation (inverted - high risk = high percentage)
  const percentage = (clampedScore / 10) * 100

  // Determine color based on score
  const getColor = (score: number) => {
    if (score <= 3) return 'bg-green-600'
    if (score <= 6) return 'bg-amber-600'
    return 'bg-red-600'
  }

  const getTextColor = (score: number) => {
    if (score <= 3) return 'text-green-600'
    if (score <= 6) return 'text-amber-600'
    return 'text-red-600'
  }

  const getRiskLevel = (score: number) => {
    if (score <= 3) return 'Low Risk'
    if (score <= 6) return 'Medium Risk'
    return 'High Risk'
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-40 h-40">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 70}`}
            strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
            className={getColor(clampedScore)}
            strokeLinecap="round"
          />
        </svg>

        {/* Score in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold font-mono ${getTextColor(clampedScore)}`}>
            {clampedScore.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">/10</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={`text-lg font-semibold ${getTextColor(clampedScore)}`}>
          {getRiskLevel(clampedScore)}
        </p>
      </div>
    </div>
  )
}
