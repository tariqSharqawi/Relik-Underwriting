'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CompTable } from './comp-table'
import { CompEntryForm, type CompEntryFormValues } from './comp-entry-form'
import { Sparkles, TrendingUp } from 'lucide-react'
import { suggestCompsAction, saveCompAction, deleteCompAction } from '@/app/actions/comps'
import type { Comparable, CompAnalysis } from '@/lib/ai/comp-analysis'
import type { Database } from '@/types/supabase'

type Deal = Database['public']['Tables']['deals']['Row']
type ComparableRow = Database['public']['Tables']['comparables']['Row']

interface CompsContainerProps {
  dealId: number
  deal: Deal
  existingComps: ComparableRow[]
}

export function CompsContainer({ dealId, deal, existingComps }: CompsContainerProps) {
  const [comps, setComps] = useState<(Comparable & { id?: string; source?: 'ai' | 'manual' })[]>(
    existingComps.map((comp) => ({
      id: comp.id,
      name: comp.comp_name || '',
      city: comp.city || '',
      state: comp.state || '',
      units: comp.units || 0,
      salePrice: Number(comp.sale_price) || 0,
      saleDate: comp.sale_date || '',
      capRate: Number(comp.cap_rate) || 0,
      pricePerUnit: Number(comp.price_per_unit) || 0,
      notes: comp.notes || '',
      source: 'manual' as const,
    }))
  )
  const [analysis, setAnalysis] = useState<CompAnalysis | null>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSuggestComps = async () => {
    setIsLoadingAI(true)
    try {
      const result = await suggestCompsAction(dealId)

      if (result.success && result.result) {
        setAnalysis(result.result)
        // Add AI comps to the list
        const aiComps = result.result.comps.map((comp) => ({
          ...comp,
          source: 'ai' as const,
        }))
        setComps((prev) => [...aiComps, ...prev])
        toast.success('AI comparables generated!')
      } else {
        toast.error(result.error || 'Failed to generate comps')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error('Comp suggestion error:', error)
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleSaveComp = async (values: CompEntryFormValues) => {
    setIsSaving(true)
    try {
      const result = await saveCompAction(dealId, values)

      if (result.success) {
        // Add to local state
        setComps((prev) => [
          {
            ...values,
            pricePerUnit: values.salePrice / values.units,
            source: 'manual' as const,
          },
          ...prev,
        ])
        toast.success('Comparable added!')
      } else {
        toast.error(result.error || 'Failed to save comparable')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error('Save comp error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteComp = async (id: string) => {
    try {
      const result = await deleteCompAction(id)

      if (result.success) {
        setComps((prev) => prev.filter((comp) => comp.id !== id))
        toast.success('Comparable deleted')
      } else {
        toast.error(result.error || 'Failed to delete comparable')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error('Delete comp error:', error)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const priceAssessmentConfig = {
    below_market: { label: 'Below Market', className: 'bg-green-100 text-green-900' },
    at_market: { label: 'At Market', className: 'bg-blue-100 text-blue-900' },
    above_market: { label: 'Above Market', className: 'bg-red-100 text-red-900' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-semibold">AI Comp Analysis</h3>
        <Button onClick={handleSuggestComps} disabled={isLoadingAI}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoadingAI ? 'Generating...' : 'AI Suggest Comps'}
        </Button>
      </div>

      {analysis && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Market Analysis</CardTitle>
                <Badge className={priceAssessmentConfig[analysis.priceAssessment].className}>
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {priceAssessmentConfig[analysis.priceAssessment].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{analysis.marketAnalysis}</p>

              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm font-medium mb-2">Suggested Price Range</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Low</p>
                    <p className="text-lg font-bold font-mono">
                      {formatCurrency(analysis.suggestedPriceRange.low)}
                    </p>
                  </div>
                  <span className="text-muted-foreground">—</span>
                  <div>
                    <p className="text-xs text-muted-foreground">High</p>
                    <p className="text-lg font-bold font-mono">
                      {formatCurrency(analysis.suggestedPriceRange.high)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {analysis.suggestedPriceRange.basis}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Comparables</CardTitle>
        </CardHeader>
        <CardContent>
          <CompTable
            comps={comps}
            subjectPrice={deal.asking_price || undefined}
            subjectUnits={deal.total_units || undefined}
            onDelete={handleDeleteComp}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Manual Comparable</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Add comparables from CoStar, Real Capital Analytics, or local brokers
          </p>
        </CardHeader>
        <CardContent>
          <CompEntryForm onSubmit={handleSaveComp} isLoading={isSaving} />
        </CardContent>
      </Card>
    </div>
  )
}
