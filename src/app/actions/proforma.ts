'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getDealById } from '@/lib/db/deals'
import { getT12Totals } from '@/lib/db/t12'
import { saveProforma } from '@/lib/db/proforma'
import {
  generateProforma,
  type ProformaAssumptions,
} from '@/lib/calculations/proforma'
import {
  generateProformaAssumptions,
  getDefaultProformaAssumptions,
} from '@/lib/ai/proforma-generation'

const proformaAssumptionsSchema = z.object({
  holdYears: z.number().int().min(1).max(15),
  annualRentGrowth: z.number().min(0).max(0.15),
  annualExpenseInflation: z.number().min(0).max(0.1),
  targetOccupancy: z.number().min(0).max(0.93),
  occupancyRampYears: z.number().int().min(0).max(5),
  refiYear: z.number().int().min(0).max(15).nullable(),
  refiInterestRate: z.number().min(0).max(0.2).nullable(),
  exitCapRate: z.number().min(0).max(0.2),
})

export async function generateProformaAction(
  dealId: number,
  assumptions: z.infer<typeof proformaAssumptionsSchema>
) {
  try {
    // Validate assumptions
    const validated = proformaAssumptionsSchema.parse(assumptions)

    // Get deal data
    const deal = await getDealById(dealId)
    const t12Totals = await getT12Totals(dealId)

    // Build full assumptions
    const currentNOI = t12Totals.totalNOI || deal.noi_current || 0
    const currentOccupancy = t12Totals.avgOccupancy || 0.85
    const purchasePrice = deal.asking_price || 0

    const fullAssumptions: ProformaAssumptions = {
      currentNOI,
      currentOccupancy,
      purchasePrice,
      downPaymentPct: deal.down_payment_pct || 0.3,
      interestRate: deal.interest_rate || 0.08,
      loanTermYears: deal.loan_term_years || 25,
      annualRentGrowth: validated.annualRentGrowth,
      annualExpenseInflation: validated.annualExpenseInflation,
      targetOccupancy: validated.targetOccupancy,
      occupancyRampYears: validated.occupancyRampYears,
      holdYears: validated.holdYears,
      refiYear: validated.refiYear,
      refiInterestRate: validated.refiInterestRate,
      refiLoanToValue: 0.75,
      exitYear: validated.holdYears,
      exitCapRate: validated.exitCapRate,
      acquisitionFeePct: 0.02,
      assetMgmtFeePct: 0.02,
      refiFeePct: 0.01,
      exitFeePct: 0.02,
    }

    // Generate proforma
    const result = generateProforma(fullAssumptions)

    // Save to database
    await saveProforma(dealId, result.years)

    revalidatePath(`/deals/${dealId}/proforma`)
    revalidatePath(`/deals/${dealId}`)

    return {
      success: true,
      proforma: result,
    }
  } catch (error) {
    console.error('Generate proforma error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate proforma',
    }
  }
}

export async function aiSuggestAssumptionsAction(dealId: number) {
  try {
    const deal = await getDealById(dealId)
    const t12Totals = await getT12Totals(dealId)

    const currentNOI = t12Totals.totalNOI || deal.noi_current || 0
    const currentOccupancy = t12Totals.avgOccupancy || 0.85
    const currentExpenseRatio = t12Totals.totalGrossRevenue > 0
      ? t12Totals.totalExpenses / t12Totals.totalGrossRevenue
      : 0.73

    const purchaseCapRate = deal.asking_price && currentNOI
      ? currentNOI / deal.asking_price
      : 0.08

    const aiResult = await generateProformaAssumptions({
      dealId,
      dealName: deal.name,
      city: deal.city || undefined,
      state: deal.state || undefined,
      propertyType: deal.property_type || undefined,
      totalUnits: deal.total_units || undefined,
      currentNOI,
      currentOccupancy,
      currentExpenseRatio,
      purchaseCapRate,
      holdYears: 5,
    })

    return {
      success: true,
      assumptions: aiResult,
    }
  } catch (error) {
    console.error('AI suggest assumptions error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate AI suggestions',
    }
  }
}
