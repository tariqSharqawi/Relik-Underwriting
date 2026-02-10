'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { NapkinForm, type NapkinFormValues } from './napkin-form'
import { NapkinResults } from './napkin-results'
import { GoNoGoIndicator } from './go-nogo-indicator'
import { runNapkinAnalysis, updateDealStatus } from '@/app/actions/napkin'

export interface NapkinAnalysisResult {
  noi: number
  capRate: number
  expenseRatio: number
  maxOfferPrice: number
  annualDebtService: number
  cashFlow: number
  cashOnCashReturn: number
  equityInvested: number
  equityMultiple: number
  debtServiceAnnual: number
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'pass' | 'strong_pass'
  confidence: number
  summary: string
  redFlags: string[]
  keyAssumptions: string[]
}

interface Deal {
  id: number
  name: string
  asking_price: number | null
  down_payment_pct: number | null
  interest_rate: number | null
  loan_term_years: number | null
  cap_rate_purchase: number | null
  max_offer_price: number | null
  ai_summary: string | null
  ai_recommendation: string | null
  status: string
}

interface NapkinAnalysisContainerProps {
  deal: Deal
}

export function NapkinAnalysisContainer({ deal }: NapkinAnalysisContainerProps) {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<NapkinAnalysisResult | null>(null)

  // Check if we already have analysis results
  const hasExistingAnalysis = deal.ai_summary && deal.ai_recommendation

  async function handleAnalyze(values: NapkinFormValues) {
    setIsAnalyzing(true)
    try {
      const response = await runNapkinAnalysis(deal.id, values)

      if (!response.success) {
        toast.error(response.error || 'Failed to analyze deal')
        return
      }

      setResults(response.result!)
      toast.success('Deal analyzed successfully!')
    } catch (error) {
      toast.error('An error occurred during analysis')
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleContinueToT12() {
    try {
      const response = await updateDealStatus(deal.id, 'underwriting')

      if (!response.success) {
        toast.error(response.error || 'Failed to update status')
        return
      }

      toast.success('Status updated to underwriting')
      router.push(`/deals/${deal.id}/t12`)
    } catch (error) {
      toast.error('An error occurred')
      console.error('Status update error:', error)
    }
  }

  // Default values for the form
  const defaultValues = {
    grossRevenue: undefined,
    totalExpenses: undefined,
    occupancy: 85,
    downPaymentPct: deal.down_payment_pct || 0.3,
    interestRate: deal.interest_rate || 0.08,
    loanTermYears: deal.loan_term_years || 25,
  }

  return (
    <div className="space-y-8">
      <NapkinForm
        defaultValues={defaultValues}
        onSubmit={handleAnalyze}
        isLoading={isAnalyzing}
      />

      {results && (
        <>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-heading font-semibold mb-6">
              Analysis Results
            </h3>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <NapkinResults results={results} />
              </div>

              <div className="flex items-start justify-center">
                <GoNoGoIndicator
                  equityMultiple={results.equityMultiple || 0}
                  threshold={3}
                />
              </div>
            </div>
          </div>

          {deal.status === 'napkin' && (
            <div className="flex justify-end">
              <Button onClick={handleContinueToT12} size="lg">
                Save & Continue to T12
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {!results && hasExistingAnalysis && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            This deal has been analyzed previously. Submit the form above to run a
            new analysis.
          </p>
        </div>
      )}
    </div>
  )
}
