'use server'

import { getDealById } from '@/lib/db/deals'
import { getT12Totals } from '@/lib/db/t12'
import { assessRisk } from '@/lib/ai/risk-assessment'
import { generateMemo } from '@/lib/ai/memo-generation'
import { sendChatMessage, type ChatMessage } from '@/lib/ai/chat'

export async function runRiskAssessmentAction(dealId: number) {
  try {
    const deal = await getDealById(dealId)
    const t12Totals = await getT12Totals(dealId)

    const t12Summary = t12Totals.totalGrossRevenue > 0
      ? {
          grossRevenue: t12Totals.totalGrossRevenue,
          totalExpenses: t12Totals.totalExpenses,
          noi: t12Totals.totalNOI,
          payrollPct: 0, // Would need detailed breakdown
          dietaryPct: 0,
        }
      : undefined

    const result = await assessRisk({
      dealId,
      dealName: deal.name,
      city: deal.city || undefined,
      state: deal.state || undefined,
      propertyType: deal.property_type || undefined,
      totalUnits: deal.total_units || undefined,
      licensedBeds: deal.licensed_beds || undefined,
      askingPrice: deal.asking_price || undefined,
      purchaseCapRate: deal.cap_rate_purchase || undefined,
      currentOccupancy: t12Totals.avgOccupancy || undefined,
      currentExpenseRatio: t12Totals.avgExpenseRatio || undefined,
      t12Summary,
    })

    return { success: true, result }
  } catch (error) {
    console.error('Risk assessment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assess risk',
    }
  }
}

export async function generateMemoAction(dealId: number) {
  try {
    const deal = await getDealById(dealId)
    const t12Totals = await getT12Totals(dealId)

    const t12Summary = t12Totals.totalGrossRevenue > 0
      ? {
          grossRevenue: t12Totals.totalGrossRevenue,
          totalExpenses: t12Totals.totalExpenses,
          noi: t12Totals.totalNOI,
        }
      : undefined

    const result = await generateMemo({
      dealId,
      dealName: deal.name,
      city: deal.city || undefined,
      state: deal.state || undefined,
      propertyType: deal.property_type || undefined,
      totalUnits: deal.total_units || undefined,
      licensedBeds: deal.licensed_beds || undefined,
      askingPrice: deal.asking_price || undefined,
      purchaseCapRate: deal.cap_rate_purchase || undefined,
      t12Summary,
    })

    return { success: true, result }
  } catch (error) {
    console.error('Memo generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate memo',
    }
  }
}

export async function sendChatMessageAction(
  dealId: number,
  message: string,
  history: ChatMessage[]
) {
  try {
    const deal = await getDealById(dealId)
    const t12Totals = await getT12Totals(dealId)

    const response = await sendChatMessage(
      {
        dealId,
        dealName: deal.name,
        city: deal.city || undefined,
        state: deal.state || undefined,
        propertyType: deal.property_type || undefined,
        totalUnits: deal.total_units || undefined,
        askingPrice: deal.asking_price || undefined,
        currentNOI: t12Totals.totalNOI || undefined,
        currentOccupancy: t12Totals.avgOccupancy || undefined,
        expenseRatio: t12Totals.avgExpenseRatio || undefined,
      },
      message,
      history
    )

    return { success: true, response }
  } catch (error) {
    console.error('Chat error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    }
  }
}
