'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'

const compEntrySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2).max(2, 'State must be 2 letters'),
  units: z.number().int().positive('Units must be positive'),
  salePrice: z.number().positive('Sale price must be positive'),
  saleDate: z.string().min(1, 'Sale date is required'),
  capRate: z.number().min(0).max(1, 'Cap rate must be between 0 and 1'),
  notes: z.string().optional(),
})

export type CompEntryFormValues = z.infer<typeof compEntrySchema>

interface CompEntryFormProps {
  onSubmit: (values: CompEntryFormValues) => Promise<void>
  isLoading?: boolean
}

export function CompEntryForm({ onSubmit, isLoading }: CompEntryFormProps) {
  const form = useForm<CompEntryFormValues>({
    resolver: zodResolver(compEntrySchema),
    defaultValues: {
      name: '',
      city: '',
      state: '',
      units: undefined,
      salePrice: undefined,
      saleDate: '',
      capRate: undefined,
      notes: '',
    },
  })

  async function handleSubmit(values: CompEntryFormValues) {
    await onSubmit(values)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Sunrise Senior Living"
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
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Phoenix" disabled={isLoading} {...field} />
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
                <FormLabel>State *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., AZ"
                    maxLength={2}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="units"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Units *</FormLabel>
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
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price *</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="saleDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Date *</FormLabel>
                <FormControl>
                  <Input
                    type="month"
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
            name="capRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cap Rate *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="e.g., 0.075 for 7.5%"
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
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional details about the comparable..."
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          {isLoading ? 'Adding...' : 'Add Comparable'}
        </Button>
      </form>
    </Form>
  )
}
