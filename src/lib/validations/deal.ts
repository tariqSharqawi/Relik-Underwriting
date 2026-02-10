import * as z from 'zod'

export const propertyTypeEnum = z.enum([
  'assisted_living',
  'memory_care',
  'independent_living',
  'mixed',
])

export const dealStatusEnum = z.enum([
  'napkin',
  'underwriting',
  'under_contract',
  'closed',
  'passed',
])

export const createDealSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  city: z.string().optional(),
  state: z.string().optional(),
  property_type: propertyTypeEnum.optional(),
  total_units: z.number().int().positive().optional(),
  licensed_beds: z.number().int().positive().optional(),
  asking_price: z.number().positive().optional(),
  down_payment_pct: z.number().min(0).max(1).default(0.3),
  interest_rate: z.number().min(0).max(1).default(0.08),
  loan_term_years: z.number().int().positive().default(25),
})

export const updateDealSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  property_type: propertyTypeEnum.optional(),
  total_units: z.number().int().positive().optional(),
  licensed_beds: z.number().int().positive().optional(),
  asking_price: z.number().positive().optional(),
  status: dealStatusEnum.optional(),
  down_payment_pct: z.number().min(0).max(1).optional(),
  interest_rate: z.number().min(0).max(1).optional(),
  loan_term_years: z.number().int().positive().optional(),
})

export type CreateDealInput = z.infer<typeof createDealSchema>
export type UpdateDealInput = z.infer<typeof updateDealSchema>
export type PropertyType = z.infer<typeof propertyTypeEnum>
export type DealStatus = z.infer<typeof dealStatusEnum>
