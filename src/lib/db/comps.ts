import { createServiceClient } from '@/lib/supabase/service'
import type { Database } from '@/types/supabase'

type Comparable = Database['public']['Tables']['comparables']['Row']
type ComparableInsert = Database['public']['Tables']['comparables']['Insert']

/**
 * Get all comparables for a deal
 */
export async function getComps(dealId: number): Promise<Comparable[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('comparables')
    .select('*')
    .eq('deal_id', dealId)
    .order('sale_date', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch comparables: ${error.message}`)
  }

  return data || []
}

/**
 * Save a comparable
 */
export async function saveComp(
  dealId: number,
  compData: Omit<ComparableInsert, 'deal_id' | 'id'>,
  existingId?: number
): Promise<Comparable> {
  const supabase = createServiceClient()

  if (existingId) {
    // Update existing
    const { data, error } = await supabase
      .from('comparables')
      .update(compData)
      .eq('id', existingId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update comparable: ${error.message}`)
    }

    return data
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('comparables')
      .insert({ ...compData, deal_id: dealId })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save comparable: ${error.message}`)
    }

    return data
  }
}

/**
 * Delete a comparable
 */
export async function deleteComp(id: number): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase.from('comparables').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete comparable: ${error.message}`)
  }
}
