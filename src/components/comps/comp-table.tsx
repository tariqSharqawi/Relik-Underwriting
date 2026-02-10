import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2 } from 'lucide-react'
import type { Comparable } from '@/lib/ai/comp-analysis'

interface CompTableProps {
  comps: (Comparable & { id?: string; source?: 'ai' | 'manual' })[]
  subjectPrice?: number
  subjectUnits?: number
  onDelete?: (id: string) => Promise<void>
}

export function CompTable({ comps, subjectPrice, subjectUnits, onDelete }: CompTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`

  const calculatePriceDiff = (compPrice: number) => {
    if (!subjectPrice) return null
    const diff = ((compPrice - subjectPrice) / subjectPrice) * 100
    return diff
  }

  const calculatePricePerUnitDiff = (compPPU: number) => {
    if (!subjectPrice || !subjectUnits) return null
    const subjectPPU = subjectPrice / subjectUnits
    const diff = ((compPPU - subjectPPU) / subjectPPU) * 100
    return diff
  }

  if (comps.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No comparables added yet. Click "AI Suggest Comps" or manually add comparables.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Units</TableHead>
            <TableHead className="text-right">Sale Price</TableHead>
            <TableHead className="text-right">$/Unit</TableHead>
            <TableHead className="text-right">Cap Rate</TableHead>
            <TableHead className="text-right">Sale Date</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-center">Source</TableHead>
            {onDelete && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {comps.map((comp, index) => {
            const priceDiff = calculatePriceDiff(comp.salePrice)
            const ppuDiff = calculatePricePerUnitDiff(comp.pricePerUnit)

            return (
              <TableRow key={comp.id || index}>
                <TableCell className="font-medium">{comp.name}</TableCell>
                <TableCell>
                  {comp.city}, {comp.state}
                </TableCell>
                <TableCell className="text-right font-mono">{comp.units}</TableCell>
                <TableCell className="text-right font-mono">
                  <div>{formatCurrency(comp.salePrice)}</div>
                  {priceDiff !== null && (
                    <div
                      className={`text-xs ${
                        priceDiff > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {priceDiff > 0 ? '+' : ''}
                      {priceDiff.toFixed(1)}% vs subject
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  <div>{formatCurrency(comp.pricePerUnit)}</div>
                  {ppuDiff !== null && (
                    <div
                      className={`text-xs ${
                        ppuDiff > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {ppuDiff > 0 ? '+' : ''}
                      {ppuDiff.toFixed(1)}%
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatPercent(comp.capRate)}
                </TableCell>
                <TableCell className="text-right text-sm">{comp.saleDate}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs">
                  {comp.notes}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={comp.source === 'ai' ? 'secondary' : 'outline'}>
                    {comp.source === 'ai' ? 'AI' : 'Manual'}
                  </Badge>
                </TableCell>
                {onDelete && comp.id && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(comp.id!)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
