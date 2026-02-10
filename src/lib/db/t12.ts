import { createServiceClient } from '@/lib/supabase/service'
import type { Database } from '@/types/supabase'

type T12Financial = Database['public']['Tables']['t12_financials']['Row']
type T12FinancialInsert = Database['public']['Tables']['t12_financials']['Insert']

/**
 * Get all T12 financial records for a deal
 */
export async function getT12Data(dealId: number): Promise<T12Financial[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('t12_financials')
    .select('*')
    .eq('deal_id', dealId)
    .order('month', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch T12 data: ${error.message}`)
  }

  return data || []
}

/**
 * Save or update a single T12 month record
 */
export async function saveT12Month(
  dealId: number,
  monthData: Omit<T12FinancialInsert, 'deal_id'>
): Promise<T12Financial> {
  const supabase = createServiceClient()

  // Check if record exists for this month
  const { data: existing } = await supabase
    .from('t12_financials')
    .select('id')
    .eq('deal_id', dealId)
    .eq('month', monthData.month)
    .single()

  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('t12_financials')
      .update(monthData)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update T12 month: ${error.message}`)
    }

    return data
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('t12_financials')
      .insert({ ...monthData, deal_id: dealId })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save T12 month: ${error.message}`)
    }

    return data
  }
}

/**
 * Bulk save/update multiple T12 months
 */
export async function bulkSaveT12(
  dealId: number,
  monthsData: Omit<T12FinancialInsert, 'deal_id'>[]
): Promise<void> {
  const supabase = createServiceClient()

  // Delete existing records for this deal
  await supabase.from('t12_financials').delete().eq('deal_id', dealId)

  // Insert all new records
  const records = monthsData.map((month) => ({
    ...month,
    deal_id: dealId,
  }))

  const { error } = await supabase.from('t12_financials').insert(records)

  if (error) {
    throw new Error(`Failed to bulk save T12 data: ${error.message}`)
  }
}

/**
 * Delete a T12 month record
 */
export async function deleteT12Month(id: number): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase.from('t12_financials').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete T12 month: ${error.message}`)
  }
}

/**
 * Get T12 summary totals for a deal
 */
export async function getT12Totals(dealId: number) {
  const data = await getT12Data(dealId)

  if (data.length === 0) {
    return {
      totalGrossRevenue: 0,
      totalExpenses: 0,
      totalNOI: 0,
      avgOccupancy: 0,
      avgExpenseRatio: 0,
      monthCount: 0,
    }
  }

  const totals = data.reduce(
    (acc, month) => ({
      totalGrossRevenue: acc.totalGrossRevenue + (Number(month.gross_revenue) || 0),
      totalExpenses: acc.totalExpenses + (Number(month.total_expenses) || 0),
      totalNOI: acc.totalNOI + (Number(month.noi) || 0),
      totalOccupancy: acc.totalOccupancy + (Number(month.occupancy_rate) || 0),
    }),
    { totalGrossRevenue: 0, totalExpenses: 0, totalNOI: 0, totalOccupancy: 0 }
  )

  const avgExpenseRatio = totals.totalGrossRevenue > 0
    ? totals.totalExpenses / totals.totalGrossRevenue
    : 0

  return {
    totalGrossRevenue: totals.totalGrossRevenue,
    totalExpenses: totals.totalExpenses,
    totalNOI: totals.totalNOI,
    avgOccupancy: totals.totalOccupancy / data.length,
    avgExpenseRatio,
    monthCount: data.length,
  }
}
