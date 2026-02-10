import { createServiceClient } from '@/lib/supabase/service'
import type { Database } from '@/types/supabase'
import type { DealStatus } from '@/lib/validations/deal'

type Deal = Database['public']['Tables']['deals']['Row']
type DealInsert = Database['public']['Tables']['deals']['Insert']
type DealUpdate = Database['public']['Tables']['deals']['Update']

export async function getDeals(filters?: {
  status?: DealStatus
  limit?: number
  offset?: number
}) {
  const supabase = createServiceClient()

  let query = supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch deals: ${error.message}`)
  }

  return data as Deal[]
}

export async function getDealById(id: number) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch deal: ${error.message}`)
  }

  return data as Deal
}

export async function createDeal(dealData: DealInsert) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('deals')
    .insert(dealData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create deal: ${error.message}`)
  }

  return data as Deal
}

export async function updateDeal(id: number, dealData: DealUpdate) {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('deals')
    .update(dealData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update deal: ${error.message}`)
  }

  return data as Deal
}

export async function deleteDeal(id: number) {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete deal: ${error.message}`)
  }

  return true
}

export async function getDealsByStatus(status: DealStatus) {
  return getDeals({ status })
}

export async function getDealCount() {
  const supabase = createServiceClient()

  const { count, error } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })

  if (error) {
    throw new Error(`Failed to count deals: ${error.message}`)
  }

  return count || 0
}

export async function getDealCountByStatus() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('deals')
    .select('status')

  if (error) {
    throw new Error(`Failed to count deals by status: ${error.message}`)
  }

  const counts = {
    napkin: 0,
    underwriting: 0,
    under_contract: 0,
    closed: 0,
    passed: 0,
  }

  data?.forEach((deal) => {
    if (deal.status && deal.status in counts) {
      counts[deal.status as DealStatus]++
    }
  })

  return counts
}
