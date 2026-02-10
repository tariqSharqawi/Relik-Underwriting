'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getDealById } from '@/lib/db/deals'
import { getT12Totals } from '@/lib/db/t12'
import { saveComp, deleteComp } from '@/lib/db/comps'
import { analyzeComps } from '@/lib/ai/comp-analysis'

const compSchema = z.object({
  name: z.string(),
  city: z.string(),
  state: z.string(),
  units: z.number(),
  salePrice: z.number(),
  saleDate: z.string(),
  capRate: z.number(),
  notes: z.string().optional(),
})

export async function suggestCompsAction(dealId: number) {
  try {
    const deal = await getDealById(dealId)
    const t12Totals = await getT12Totals(dealId)

    const result = await analyzeComps({
      dealId,
      dealName: deal.name,
      city: deal.city || undefined,
      state: deal.state || undefined,
      propertyType: deal.property_type || undefined,
      totalUnits: deal.total_units || undefined,
      askingPrice: deal.asking_price || undefined,
      currentNOI: t12Totals.totalNOI || undefined,
    })

    return { success: true, result }
  } catch (error) {
    console.error('Comp analysis error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze comps',
    }
  }
}

export async function saveCompAction(
  dealId: number,
  compData: z.infer<typeof compSchema>
) {
  try {
    const validated = compSchema.parse(compData)

    // Calculate price per unit
    const pricePerUnit = validated.salePrice / validated.units

    await saveComp(dealId, {
      comp_name: validated.name,
      city: validated.city,
      state: validated.state,
      units: validated.units,
      sale_price: validated.salePrice,
      sale_date: validated.saleDate,
      cap_rate: validated.capRate,
      price_per_unit: pricePerUnit,
      notes: validated.notes || null,
    })

    revalidatePath(`/deals/${dealId}/comps`)

    return { success: true }
  } catch (error) {
    console.error('Save comp error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save comparable',
    }
  }
}

export async function deleteCompAction(id: number) {
  try {
    await deleteComp(id)
    return { success: true }
  } catch (error) {
    console.error('Delete comp error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete comparable',
    }
  }
}
