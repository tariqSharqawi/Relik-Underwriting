import { createServiceClient } from '@/lib/supabase/service'
import type { Database } from '@/types/supabase'
import type { ProformaYear } from '@/lib/calculations/proforma'

type Proforma = Database['public']['Tables']['proforma']['Row']
type ProformaInsert = Database['public']['Tables']['proforma']['Insert']

/**
 * Get all proforma records for a deal
 */
export async function getProforma(dealId: number): Promise<Proforma[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('proforma')
    .select('*')
    .eq('deal_id', dealId)
    .order('year', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch proforma: ${error.message}`)
  }

  return data || []
}

/**
 * Save proforma data for a deal
 * Replaces all existing proforma records
 */
export async function saveProforma(dealId: number, years: ProformaYear[]): Promise<void> {
  const supabase = createServiceClient()

  // Delete existing proforma for this deal
  await supabase.from('proforma').delete().eq('deal_id', dealId)

  // Transform and insert new records
  const records: ProformaInsert[] = years.map((year) => ({
    deal_id: dealId,
    year: year.year,
    target_occupancy: year.occupancy.toString(),
    projected_revenue: year.grossRevenue.toString(),
    projected_expenses: year.totalExpenses.toString(),
    projected_noi: year.noi.toString(),
    debt_service: year.debtService.toString(),
    cash_flow: year.cashFlow.toString(),
    is_refi_year: year.isRefiYear,
    is_exit_year: year.isExitYear,
    capital_returned: year.capitalReturned?.toString() || null,
  }))

  const { error } = await supabase.from('proforma').insert(records)

  if (error) {
    throw new Error(`Failed to save proforma: ${error.message}`)
  }
}

/**
 * Delete all proforma records for a deal
 */
export async function deleteProforma(dealId: number): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase.from('proforma').delete().eq('deal_id', dealId)

  if (error) {
    throw new Error(`Failed to delete proforma: ${error.message}`)
  }
}
