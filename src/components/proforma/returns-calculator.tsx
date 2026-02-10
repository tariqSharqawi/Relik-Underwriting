'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { generateProforma, type ProformaAssumptions } from '@/lib/calculations/proforma'

interface ReturnsCalculatorProps {
  baseAssumptions: ProformaAssumptions
}

export function ReturnsCalculator({ baseAssumptions }: ReturnsCalculatorProps) {
  const [exitCapRate, setExitCapRate] = useState(baseAssumptions.exitCapRate)
  const [holdYears, setHoldYears] = useState(baseAssumptions.holdYears)
  const [rentGrowth, setRentGrowth] = useState(baseAssumptions.annualRentGrowth)

  const [metrics, setMetrics] = useState(() => {
    const result = generateProforma(baseAssumptions)
    return result.metrics
  })

  // Recalculate when assumptions change
  useEffect(() => {
    const newAssumptions: ProformaAssumptions = {
      ...baseAssumptions,
      exitCapRate,
      holdYears,
      annualRentGrowth: rentGrowth,
      exitYear: holdYears, // Update exit year to match hold years
    }

    const result = generateProforma(newAssumptions)
    setMetrics(result.metrics)
  }, [exitCapRate, holdYears, rentGrowth, baseAssumptions])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`
  const formatMultiple = (value: number) => `${value.toFixed(2)}x`

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Equity Multiple
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-bold font-mono ${
                metrics.equityMultiple >= 3 ? 'text-green-600' : 'text-amber-600'
              }`}
            >
              {formatMultiple(metrics.equityMultiple)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Target: 3.0x minimum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              IRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono text-green-600">
              {formatPercent(metrics.irr)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Internal Rate of Return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Cash-on-Cash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono">
              {formatPercent(metrics.averageCashOnCash)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Annual operating returns
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What-If Scenarios</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Adjust key assumptions to see impact on returns
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="exit-cap">Exit Cap Rate</Label>
              <Input
                id="exit-cap"
                type="number"
                step="0.001"
                value={exitCapRate}
                onChange={(e) => setExitCapRate(Number(e.target.value))}
                className="w-24 text-right font-mono"
              />
            </div>
            <Slider
              value={[exitCapRate * 1000]}
              onValueChange={(value) => setExitCapRate(value[0] / 1000)}
              min={50}
              max={150}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Current: {formatPercent(exitCapRate)} (Range: 5.0% - 15.0%)
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="hold-years">Hold Period (Years)</Label>
              <Input
                id="hold-years"
                type="number"
                value={holdYears}
                onChange={(e) => setHoldYears(Number(e.target.value))}
                className="w-24 text-right font-mono"
              />
            </div>
            <Slider
              value={[holdYears]}
              onValueChange={(value) => setHoldYears(value[0])}
              min={3}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Current: {holdYears} years (Range: 3-10 years)
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="rent-growth">Annual Rent Growth</Label>
              <Input
                id="rent-growth"
                type="number"
                step="0.001"
                value={rentGrowth}
                onChange={(e) => setRentGrowth(Number(e.target.value))}
                className="w-24 text-right font-mono"
              />
            </div>
            <Slider
              value={[rentGrowth * 1000]}
              onValueChange={(value) => setRentGrowth(value[0] / 1000)}
              min={0}
              max={80}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Current: {formatPercent(rentGrowth)} (Range: 0% - 8.0%)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <p className="text-lg font-bold font-mono">
                {formatCurrency(metrics.totalEquityInvested)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Operating Cash Flow</p>
              <p className="text-lg font-bold font-mono">
                {formatCurrency(metrics.totalOperatingCashFlow)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Refi Distribution</p>
              <p className="text-lg font-bold font-mono">
                {formatCurrency(metrics.refiDistribution)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exit Proceeds</p>
              <p className="text-lg font-bold font-mono">
                {formatCurrency(metrics.exitProceeds)}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Distributions</p>
              <p className="text-2xl font-bold font-mono text-green-600">
                {formatCurrency(metrics.totalDistributions)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
