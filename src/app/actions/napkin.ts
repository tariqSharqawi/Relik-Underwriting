'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { analyzeNapkin, type NapkinAnalysisInput } from '@/lib/ai/napkin-analysis'
import { getDealById, updateDeal } from '@/lib/db/deals'
import {
  calculateNOI,
  calculateCapRate,
  calculateExpenseRatio,
  calculateCashFlow,
  calculateMaxOfferPrice,
} from '@/lib/calculations/napkin'
import { calculateLoanAmount, calculateAnnualDebtService } from '@/lib/calculations/loan'

const napkinInputSchema = z.object({
  grossRevenue: z.number().positive(),
  totalExpenses: z.number().positive(),
  occupancy: z.number().min(0).max(100),
  downPaymentPct: z.number().min(0).max(1),
  interestRate: z.number().min(0).max(1),
  loanTermYears: z.number().int().positive(),
})

export type NapkinInput = z.infer<typeof napkinInputSchema>

export async function runNapkinAnalysis(dealId: number, input: NapkinInput) {
  try {
    // Validate input
    const validated = napkinInputSchema.parse(input)

    // Fetch deal data
    const deal = await getDealById(dealId)

    // Calculate all napkin metrics
    const noi = calculateNOI(validated.grossRevenue, validated.totalExpenses)
    const capRate = deal.asking_price
      ? calculateCapRate(noi, deal.asking_price)
      : 0
    const expenseRatio = calculateExpenseRatio(
      validated.totalExpenses,
      validated.grossRevenue
    )

    const loanAmount = deal.asking_price
      ? calculateLoanAmount(deal.asking_price, validated.downPaymentPct)
      : 0

    const annualDebtService = calculateAnnualDebtService(
      loanAmount,
      validated.interestRate,
      validated.loanTermYears
    )

    const cashFlow = calculateCashFlow(noi, annualDebtService)

    const equityInvested = deal.asking_price
      ? deal.asking_price * validated.downPaymentPct
      : 0

    // Calculate maximum offer price
    const exitCapRate = capRate > 0 ? capRate * 1.1 : 0.09 // 10% higher than purchase or 9% default
    const maxOfferPrice = calculateMaxOfferPrice({
      noi,
      targetEquityMultiple: 3,
      downPaymentPct: validated.downPaymentPct,
      interestRate: validated.interestRate,
      loanTermYears: validated.loanTermYears,
      exitCapRate,
      holdYears: 5,
      refiYear: 2,
    })

    // Estimate equity multiple for current asking price
    const holdYears = 5
    const noiGrowthRate = 0.02
    const exitNOI = noi * Math.pow(1 + noiGrowthRate, holdYears)
    const exitValue = exitNOI / exitCapRate
    const annualCashFlowEstimate = cashFlow
    const totalCashFlow = annualCashFlowEstimate * holdYears
    const remainingLoan = loanAmount * 0.85 // Rough estimate after 5 years
    const exitProceeds = exitValue - remainingLoan
    const totalDistributions = totalCashFlow + exitProceeds
    const estimatedEquityMultiple = equityInvested > 0 ? totalDistributions / equityInvested : 0

    // Build AI analysis input
    const aiInput: NapkinAnalysisInput = {
      dealId: dealId,
      dealName: deal.name,
      city: deal.city || '',
      state: deal.state || '',
      propertyType: deal.property_type || 'assisted_living',
      totalUnits: deal.total_units || 0,
      licensedBeds: deal.licensed_beds || 0,
      askingPrice: deal.asking_price || 0,
      grossRevenue: validated.grossRevenue,
      totalExpenses: validated.totalExpenses,
      noi,
      occupancy: validated.occupancy,
      downPaymentPct: validated.downPaymentPct,
      interestRate: validated.interestRate,
      loanTermYears: validated.loanTermYears,
      acquisitionFeePct: 0.02,
      assetMgmtFeePct: 0.02,
    }

    // Run AI analysis
    const aiResult = await analyzeNapkin(aiInput)

    // Update deal with results
    await updateDeal(dealId, {
      cap_rate_purchase: aiResult.capRate,
      max_offer_price: maxOfferPrice,
      noi_current: noi,
      expense_ratio: expenseRatio,
      ai_summary: aiResult.summary,
      ai_recommendation: aiResult.recommendation,
      ai_risk_score: 10 - aiResult.confidence, // Invert confidence to risk
      down_payment_pct: validated.downPaymentPct,
      interest_rate: validated.interestRate,
      loan_term_years: validated.loanTermYears,
    })

    revalidatePath(`/deals/${dealId}`)
    revalidatePath(`/deals/${dealId}/napkin`)

    return {
      success: true,
      result: {
        noi,
        annualDebtService,
        cashFlow,
        equityInvested,
        equityMultiple: estimatedEquityMultiple,
        ...aiResult,
      },
    }
  } catch (error) {
    console.error('Napkin analysis error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze deal',
    }
  }
}

export async function updateDealStatus(dealId: number, status: string) {
  try {
    await updateDeal(dealId, { status })
    revalidatePath(`/deals/${dealId}`)
    revalidatePath('/deals')
    return { success: true }
  } catch (error) {
    console.error('Update status error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update status',
    }
  }
}
