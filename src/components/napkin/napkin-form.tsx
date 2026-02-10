'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
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

const napkinFormSchema = z.object({
  grossRevenue: z.number().positive('Must be greater than 0'),
  totalExpenses: z.number().positive('Must be greater than 0'),
  occupancy: z.number().min(0).max(100, 'Must be between 0 and 100'),
  downPaymentPct: z.number().min(0).max(1, 'Must be between 0 and 1'),
  interestRate: z.number().min(0).max(1, 'Must be between 0 and 1'),
  loanTermYears: z.number().int().positive('Must be greater than 0'),
})

export type NapkinFormValues = z.infer<typeof napkinFormSchema>

interface NapkinFormProps {
  defaultValues?: Partial<NapkinFormValues>
  onSubmit: (values: NapkinFormValues) => Promise<void>
  isLoading?: boolean
}

export function NapkinForm({ defaultValues, onSubmit, isLoading }: NapkinFormProps) {
  const form = useForm<NapkinFormValues>({
    resolver: zodResolver(napkinFormSchema),
    defaultValues: {
      grossRevenue: defaultValues?.grossRevenue || undefined,
      totalExpenses: defaultValues?.totalExpenses || undefined,
      occupancy: defaultValues?.occupancy || 85,
      downPaymentPct: defaultValues?.downPaymentPct || 0.3,
      interestRate: defaultValues?.interestRate || 0.08,
      loanTermYears: defaultValues?.loanTermYears || 25,
    },
  })

  // Calculate NOI in real-time
  const watchGrossRevenue = form.watch('grossRevenue')
  const watchTotalExpenses = form.watch('totalExpenses')
  const noi = (watchGrossRevenue || 0) - (watchTotalExpenses || 0)

  async function handleSubmit(values: NapkinFormValues) {
    await onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-heading font-semibold">T12 Summary</h3>

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="grossRevenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Gross Revenue *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 2500000"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormDescription>Total annual revenue from T12</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalExpenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Total Expenses *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 1800000"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormDescription>Total annual expenses from T12</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occupancy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Occupancy % *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 85"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormDescription>Current occupancy percentage</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center rounded-lg border bg-muted p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">Calculated NOI</p>
                <p className="text-2xl font-bold font-mono">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(noi)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-lg font-heading font-semibold">Loan Assumptions (Conservative)</h3>

          <div className="grid gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="downPaymentPct"
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
              name="interestRate"
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
              name="loanTermYears"
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

        <Button type="submit" size="lg" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? 'Analyzing Deal...' : 'Analyze Deal'}
        </Button>
      </form>
    </Form>
  )
}
