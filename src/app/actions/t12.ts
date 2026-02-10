'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { bulkSaveT12, saveT12Month } from '@/lib/db/t12'
import { saveUnitMix, deleteUnitMix } from '@/lib/db/unit-mix'

const t12MonthSchema = z.object({
  id: z.string().optional(),
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
  id: z.string().optional(),
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
      room_rent: month.roomRent.toString(),
      level_of_care_fees: month.locFees.toString(),
      other_income: month.otherIncome.toString(),
      occupied_units: month.occupiedUnits,
      payroll: month.payroll.toString(),
      dietary: month.dietary.toString(),
      utilities: month.utilities.toString(),
      insurance: month.insurance.toString(),
      management_fee: month.managementFee.toString(),
      maintenance: month.maintenance.toString(),
      marketing: month.marketing.toString(),
      admin: month.admin.toString(),
      other_expenses: month.otherExpenses.toString(),
      // Calculate total_expenses
      total_expenses: (
        month.payroll +
        month.dietary +
        month.utilities +
        month.insurance +
        month.managementFee +
        month.maintenance +
        month.marketing +
        month.admin +
        month.otherExpenses
      ).toString(),
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
        id: validated.id,
        unit_type: validated.unitType,
        unit_count: validated.unitCount,
        current_rent: validated.currentRent.toString(),
        market_rent: validated.marketRent.toString(),
        avg_loc_fee: validated.avgLocFee.toString(),
      }

      await saveUnitMix(dealId, dbData)
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

export async function deleteUnitMixAction(id: string) {
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
