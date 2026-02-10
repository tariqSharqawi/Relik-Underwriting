import { createServiceClient } from '@/lib/supabase/service'
import type { Database } from '@/types/supabase'

type UnitMix = Database['public']['Tables']['unit_mix']['Row']
type UnitMixInsert = Database['public']['Tables']['unit_mix']['Insert']

/**
 * Get all unit mix records for a deal
 */
export async function getUnitMix(dealId: number): Promise<UnitMix[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('unit_mix')
    .select('*')
    .eq('deal_id', dealId)
    .order('unit_type', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch unit mix: ${error.message}`)
  }

  return data || []
}

/**
 * Save or update a unit mix record
 */
export async function saveUnitMix(
  dealId: number,
  unitData: Omit<UnitMixInsert, 'deal_id'>
): Promise<UnitMix> {
  const supabase = createServiceClient()

  if ('id' in unitData && unitData.id) {
    // Update existing record
    const { data, error } = await supabase
      .from('unit_mix')
      .update(unitData)
      .eq('id', unitData.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update unit mix: ${error.message}`)
    }

    return data
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('unit_mix')
      .insert({ ...unitData, deal_id: dealId })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save unit mix: ${error.message}`)
    }

    return data
  }
}

/**
 * Delete a unit mix record
 */
export async function deleteUnitMix(id: string): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase.from('unit_mix').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete unit mix: ${error.message}`)
  }
}

/**
 * Get unit mix summary for a deal
 */
export async function getUnitMixSummary(dealId: number) {
  const units = await getUnitMix(dealId)

  if (units.length === 0) {
    return {
      totalUnits: 0,
      avgCurrentRent: 0,
      avgMarketRent: 0,
      avgLocFee: 0,
      rentUpside: 0,
    }
  }

  const summary = units.reduce(
    (acc, unit) => ({
      totalUnits: acc.totalUnits + (unit.unit_count || 0),
      totalCurrentRent:
        acc.totalCurrentRent +
        (unit.unit_count || 0) * (Number(unit.current_rent) || 0),
      totalMarketRent:
        acc.totalMarketRent +
        (unit.unit_count || 0) * (Number(unit.market_rent) || 0),
      totalLocFee:
        acc.totalLocFee + (unit.unit_count || 0) * (Number(unit.avg_loc_fee) || 0),
    }),
    {
      totalUnits: 0,
      totalCurrentRent: 0,
      totalMarketRent: 0,
      totalLocFee: 0,
    }
  )

  const { totalUnits, totalCurrentRent, totalMarketRent, totalLocFee } = summary

  return {
    totalUnits,
    avgCurrentRent: totalUnits > 0 ? totalCurrentRent / totalUnits : 0,
    avgMarketRent: totalUnits > 0 ? totalMarketRent / totalUnits : 0,
    avgLocFee: totalUnits > 0 ? totalLocFee / totalUnits : 0,
    rentUpside: totalMarketRent - totalCurrentRent,
  }
}
