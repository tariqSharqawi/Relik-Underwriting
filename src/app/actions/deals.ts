'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createDeal, updateDeal, deleteDeal } from '@/lib/db/deals'
import { createDealSchema, updateDealSchema } from '@/lib/validations/deal'
import type { CreateDealInput, UpdateDealInput } from '@/lib/validations/deal'

export async function createDealAction(input: CreateDealInput) {
  try {
    const validated = createDealSchema.parse(input)
    const deal = await createDeal(validated)
    revalidatePath('/deals')
    return { success: true, dealId: deal.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create deal',
    }
  }
}

export async function updateDealAction(id: number, input: UpdateDealInput) {
  try {
    const validated = updateDealSchema.parse(input)
    await updateDeal(id, validated)
    revalidatePath('/deals')
    revalidatePath(`/deals/${id}`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update deal',
    }
  }
}

export async function deleteDealAction(id: number) {
  try {
    await deleteDeal(id)
    revalidatePath('/deals')
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete deal',
    }
  }

  // Redirect outside of try/catch so it properly throws
  redirect('/deals')
}
