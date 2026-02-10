'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Sparkles } from 'lucide-react'

const proformaAssumptionsSchema = z.object({
  holdYears: z.number().int().min(1).max(15),
  annualRentGrowth: z.number().min(0).max(0.15),
  annualExpenseInflation: z.number().min(0).max(0.1),
  targetOccupancy: z.number().min(0).max(0.93),
  occupancyRampYears: z.number().int().min(0).max(5),
  refiYear: z.number().int().min(0).max(15).nullable(),
  refiInterestRate: z.number().min(0).max(0.2).nullable(),
  exitCapRate: z.number().min(0).max(0.2),
})

export type ProformaAssumptionsFormValues = z.infer<typeof proformaAssumptionsSchema>

interface ProformaAssumptionsProps {
  defaultValues: Partial<ProformaAssumptionsFormValues>
  onSubmit: (values: ProformaAssumptionsFormValues) => Promise<void>
  onAIGenerate?: () => Promise<void>
  isLoading?: boolean
  isGeneratingAI?: boolean
}

export function ProformaAssumptions({
  defaultValues,
  onSubmit,
  onAIGenerate,
  isLoading,
  isGeneratingAI,
}: ProformaAssumptionsProps) {
  const form = useForm<ProformaAssumptionsFormValues>({
    resolver: zodResolver(proformaAssumptionsSchema),
    defaultValues: {
      holdYears: defaultValues.holdYears || 5,
      annualRentGrowth: defaultValues.annualRentGrowth || 0.03,
      annualExpenseInflation: defaultValues.annualExpenseInflation || 0.025,
      targetOccupancy: defaultValues.targetOccupancy || 0.93,
      occupancyRampYears: defaultValues.occupancyRampYears || 2,
      refiYear: defaultValues.refiYear !== undefined ? defaultValues.refiYear : 2,
      refiInterestRate: defaultValues.refiInterestRate || null,
      exitCapRate: defaultValues.exitCapRate || 0.08,
    },
  })

  async function handleSubmit(values: ProformaAssumptionsFormValues) {
    await onSubmit(values)
  }

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-semibold">Proforma Assumptions</h3>
            {onAIGenerate && (
              <Button
                type="button"
                variant="outline"
                onClick={onAIGenerate}
                disabled={isGeneratingAI}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGeneratingAI ? 'Generating...' : 'AI Suggest'}
              </Button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="holdYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hold Period (Years)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="15"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>Default: 5 years</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="annualRentGrowth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Rent Growth</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      max="0.15"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Default: {formatPercent(0.03)} (3% annually)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="annualExpenseInflation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Inflation</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      max="0.1"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Default: {formatPercent(0.025)} (2.5% annually)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetOccupancy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Occupancy</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="0.93"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Max: {formatPercent(0.93)} (company policy)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occupancyRampYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupancy Ramp (Years)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>Years to reach target occupancy</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refiYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refi Year (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="15"
                      placeholder="Leave empty for no refi"
                      disabled={isLoading}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>Typically year 2-3</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refiInterestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refi Interest Rate (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      min="0"
                      max="0.2"
                      placeholder="Leave empty to use 90% of current"
                      disabled={isLoading}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>e.g., 0.07 for 7%</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exitCapRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exit Cap Rate *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      max="0.2"
                      disabled={isLoading}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Should be higher than purchase cap (conservative)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? 'Generating Proforma...' : 'Generate Proforma'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
