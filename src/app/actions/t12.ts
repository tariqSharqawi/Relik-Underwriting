'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { bulkSaveT12, saveT12Month } from '@/lib/db/t12'
import { saveUnitMix, deleteUnitMix } from '@/lib/db/unit-mix'

const t12MonthSchema = z.object({
  id: z.number().optional(),
  month: z.string(),
  roomRent: z.number(),
  locFees: z.number(),
  otherIncome: z.number(),
  occupiedUnits: z.number().int(),
  payroll: z.number(),
  dietary: z.number(),
  utilities: z.number(),
  insurance: z.number(),
  managementFee: z.number(),
  maintenance: z.number(),
  marketing: z.number(),
  admin: z.number(),
  otherExpenses: z.number(),
})

const unitMixSchema = z.object({
  id: z.number().optional(),
  unitType: z.string(),
  unitCount: z.number().int(),
  currentRent: z.number(),
  marketRent: z.number(),
  avgLocFee: z.number(),
})

export async function saveT12DataAction(
  dealId: number,
  monthsData: z.infer<typeof t12MonthSchema>[]
) {
  try {
    // Validate all months
    const validated = monthsData.map((month) => t12MonthSchema.parse(month))

    // Transform to database format
    const dbData = validated.map((month) => ({
      month: month.month,
      room_rent: month.roomRent,
      level_of_care_fees: month.locFees,
      other_income: month.otherIncome,
      occupied_units: month.occupiedUnits,
      payroll: month.payroll,
      dietary: month.dietary,
      utilities: month.utilities,
      insurance: month.insurance,
      management_fee: month.managementFee,
      maintenance: month.maintenance,
      marketing: month.marketing,
      admin: month.admin,
      other_expenses: month.otherExpenses,
      // Calculate total_expenses
      total_expenses:
        month.payroll +
        month.dietary +
        month.utilities +
        month.insurance +
        month.managementFee +
        month.maintenance +
        month.marketing +
        month.admin +
        month.otherExpenses,
      occupancy_rate: null, // Will be calculated by the database or app
    }))

    await bulkSaveT12(dealId, dbData)

    revalidatePath(`/deals/${dealId}/t12`)
    revalidatePath(`/deals/${dealId}`)

    return { success: true }
  } catch (error) {
    console.error('Save T12 error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save T12 data',
    }
  }
}

export async function saveUnitMixAction(
  dealId: number,
  unitMixData: z.infer<typeof unitMixSchema>[]
) {
  try {
    // Validate and save each unit type
    for (const unit of unitMixData) {
      const validated = unitMixSchema.parse(unit)

      const dbData = {
        unit_type: validated.unitType,
        unit_count: validated.unitCount,
        current_rent: validated.currentRent,
        market_rent: validated.marketRent,
        avg_loc_fee: validated.avgLocFee,
      }

      await saveUnitMix(dealId, dbData, validated.id)
    }

    revalidatePath(`/deals/${dealId}/t12`)
    revalidatePath(`/deals/${dealId}`)

    return { success: true }
  } catch (error) {
    console.error('Save unit mix error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save unit mix',
    }
  }
}

export async function deleteUnitMixAction(id: number) {
  try {
    await deleteUnitMix(id)
    return { success: true }
  } catch (error) {
    console.error('Delete unit mix error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete unit type',
    }
  }
}
