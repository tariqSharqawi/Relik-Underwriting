interface GoNoGoIndicatorProps {
  equityMultiple: number
  threshold?: number
}

export function GoNoGoIndicator({ equityMultiple, threshold = 3 }: GoNoGoIndicatorProps) {
  const isGo = equityMultiple >= threshold

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border-2">
      <div
        className={`text-6xl font-heading font-bold mb-4 ${
          isGo ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {isGo ? 'GO' : 'NO GO'}
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">Projected Equity Multiple</p>
        <p className="text-3xl font-bold font-mono">{equityMultiple.toFixed(2)}x</p>
        <p className="text-xs text-muted-foreground mt-2">
          Threshold: {threshold.toFixed(1)}x
        </p>
      </div>
    </div>
  )
}
