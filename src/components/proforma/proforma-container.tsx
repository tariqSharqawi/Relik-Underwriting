'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProformaAssumptions, type ProformaAssumptionsFormValues } from './proforma-assumptions'
import { ProformaTable } from './proforma-table'
import { CashFlowChart } from './cash-flow-chart'
import { ReturnsCalculator } from './returns-calculator'
import {
  generateProformaAction,
  aiSuggestAssumptionsAction,
} from '@/app/actions/proforma'
import type { ProformaAssumptions as ProformaAssumptionsType } from '@/lib/calculations/proforma'
import type { Database } from '@/types/supabase'

type Deal = Database['public']['Tables']['deals']['Row']

interface ProformaContainerProps {
  dealId: number
  deal: Deal
  currentNOI: number
  currentOccupancy: number
  defaultAssumptions: Partial<ProformaAssumptionsType>
}

export function ProformaContainer({
  dealId,
  deal,
  currentNOI,
  currentOccupancy,
  defaultAssumptions,
}: ProformaContainerProps) {
  const [proformaResult, setProformaResult] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [formValues, setFormValues] = useState<ProformaAssumptionsFormValues>({
    holdYears: 5,
    annualRentGrowth: defaultAssumptions.annualRentGrowth || 0.03,
    annualExpenseInflation: defaultAssumptions.annualExpenseInflation || 0.025,
    targetOccupancy: defaultAssumptions.targetOccupancy || 0.93,
    occupancyRampYears: defaultAssumptions.occupancyRampYears || 2,
    refiYear: defaultAssumptions.refiYear !== undefined ? defaultAssumptions.refiYear : 2,
    refiInterestRate: defaultAssumptions.refiInterestRate || null,
    exitCapRate: defaultAssumptions.exitCapRate || 0.08,
  })

  const handleGenerate = async (values: ProformaAssumptionsFormValues) => {
    setIsGenerating(true)
    setFormValues(values)

    try {
      const result = await generateProformaAction(dealId, values)

      if (result.success) {
        setProformaResult(result.proforma)
        toast.success('Proforma generated successfully!')
      } else {
        toast.error(result.error || 'Failed to generate proforma')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error('Generate proforma error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAIGenerate = async () => {
    setIsGeneratingAI(true)

    try {
      const result = await aiSuggestAssumptionsAction(dealId)

      if (result.success && result.assumptions) {
        // Update form values with AI suggestions
        setFormValues({
          holdYears: 5, // Keep default
          annualRentGrowth: result.assumptions.annualRentGrowth,
          annualExpenseInflation: result.assumptions.annualExpenseInflation,
          targetOccupancy: result.assumptions.targetOccupancy,
          occupancyRampYears: result.assumptions.occupancyRampYears,
          refiYear: result.assumptions.refiYear,
          refiInterestRate: null,
          exitCapRate: result.assumptions.exitCapRate,
        })

        toast.success('AI assumptions generated!')

        // Show AI reasoning
        if (result.assumptions.reasoning) {
          toast.info(result.assumptions.reasoning, { duration: 5000 })
        }
      } else {
        toast.error(result.error || 'Failed to generate AI assumptions')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error('AI generate error:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`
  const formatMultiple = (value: number) => `${value.toFixed(2)}x`

  // Build full assumptions for returns calculator
  const fullAssumptions: ProformaAssumptionsType | null = proformaResult
    ? {
        currentNOI,
        currentOccupancy,
        purchasePrice: deal.asking_price || 0,
        downPaymentPct: deal.down_payment_pct || 0.3,
        interestRate: deal.interest_rate || 0.08,
        loanTermYears: deal.loan_term_years || 25,
        annualRentGrowth: formValues.annualRentGrowth,
        annualExpenseInflation: formValues.annualExpenseInflation,
        targetOccupancy: formValues.targetOccupancy,
        occupancyRampYears: formValues.occupancyRampYears,
        holdYears: formValues.holdYears,
        refiYear: formValues.refiYear,
        refiInterestRate: formValues.refiInterestRate,
        refiLoanToValue: 0.75,
        exitYear: formValues.holdYears,
        exitCapRate: formValues.exitCapRate,
        acquisitionFeePct: 0.02,
        assetMgmtFeePct: 0.02,
        refiFeePct: 0.01,
        exitFeePct: 0.02,
      }
    : null

  return (
    <div className="space-y-6">
      <ProformaAssumptions
        defaultValues={formValues}
        onSubmit={handleGenerate}
        onAIGenerate={handleAIGenerate}
        isLoading={isGenerating}
        isGeneratingAI={isGeneratingAI}
      />

      {proformaResult && (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Equity Multiple
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold font-mono ${
                    proformaResult.metrics.equityMultiple >= 3
                      ? 'text-green-600'
                      : 'text-amber-600'
                  }`}
                >
                  {formatMultiple(proformaResult.metrics.equityMultiple)}
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
                <p className="text-2xl font-bold font-mono text-green-600">
                  {formatPercent(proformaResult.metrics.irr)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Distributions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono">
                  {formatCurrency(proformaResult.metrics.totalDistributions)}
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
                <p className="text-2xl font-bold font-mono">
                  {formatPercent(proformaResult.metrics.averageCashOnCash)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Proforma Table */}
          <Card>
            <CardHeader>
              <CardTitle>Year-by-Year Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <ProformaTable years={proformaResult.years} />
            </CardContent>
          </Card>

          {/* Cash Flow Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Waterfall</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Operating cash flow, refi distribution, and exit proceeds
              </p>
            </CardHeader>
            <CardContent>
              <CashFlowChart years={proformaResult.years} />
            </CardContent>
          </Card>

          {/* Returns Calculator */}
          {fullAssumptions && (
            <Card>
              <CardHeader>
                <CardTitle>Interactive Returns Calculator</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Adjust assumptions to see real-time impact on returns
                </p>
              </CardHeader>
              <CardContent>
                <ReturnsCalculator baseAssumptions={fullAssumptions} />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!proformaResult && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No proforma generated yet. Fill in the assumptions above and click "Generate
              Proforma" to see projections.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
