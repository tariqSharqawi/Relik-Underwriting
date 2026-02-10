'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { updateDealAction } from '@/app/actions/deals'
import { updateDealSchema, type UpdateDealInput } from '@/lib/validations/deal'
import type { Database } from '@/types/supabase'

type Deal = Database['public']['Tables']['deals']['Row']

const propertyTypeOptions = [
  { value: 'assisted_living', label: 'Assisted Living' },
  { value: 'memory_care', label: 'Memory Care' },
  { value: 'independent_living', label: 'Independent Living' },
  { value: 'mixed', label: 'Mixed' },
]

interface EditDealFormProps {
  deal: Deal
}

export function EditDealForm({ deal }: EditDealFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<UpdateDealInput>({
    resolver: zodResolver(updateDealSchema),
    defaultValues: {
      name: deal.name,
      city: deal.city || '',
      state: deal.state || '',
      property_type: (deal.property_type as UpdateDealInput['property_type']) || undefined,
      total_units: deal.total_units || undefined,
      licensed_beds: deal.licensed_beds || undefined,
      asking_price: deal.asking_price ? Number(deal.asking_price) : undefined,
      down_payment_pct: deal.down_payment_pct ? Number(deal.down_payment_pct) : 0.3,
      interest_rate: deal.interest_rate ? Number(deal.interest_rate) : 0.08,
      loan_term_years: deal.loan_term_years || 25,
    },
  })

  async function onSubmit(values: UpdateDealInput) {
    setIsLoading(true)

    const result = await updateDealAction(deal.id, values)

    if (result.success) {
      toast.success('Deal updated successfully')
      router.push(`/deals/${deal.id}`)
      router.refresh()
    } else {
      toast.error('Failed to update deal', {
        description: result.error,
      })
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Deal Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Sunrise Senior Living - Phoenix"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Phoenix"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., AZ"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="property_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {propertyTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total_units"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Units</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 120"
                    disabled={isLoading}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licensed_beds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Licensed Beds</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    disabled={isLoading}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="asking_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asking Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 15000000"
                    disabled={isLoading}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormDescription>Enter amount in dollars</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-heading font-semibold mb-4">
            Loan Assumptions
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="down_payment_pct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Down Payment %</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormDescription>Default: 0.30 (30%)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interest_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Rate</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      min="0"
                      max="1"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormDescription>Default: 0.08 (8%)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loan_term_years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Term (Years)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormDescription>Default: 25 years</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/deals/${deal.id}`)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
