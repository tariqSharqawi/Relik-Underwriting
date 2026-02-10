'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Save } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface UnitMixRow {
  id?: number
  unitType: string
  unitCount: number
  currentRent: number
  marketRent: number
  avgLocFee: number
}

interface UnitMixTableProps {
  initialData: UnitMixRow[]
  onSave: (data: UnitMixRow[]) => Promise<void>
  onDelete?: (id: number) => Promise<void>
}

export function UnitMixTable({ initialData, onSave, onDelete }: UnitMixTableProps) {
  const [data, setData] = useState<UnitMixRow[]>(initialData)
  const [isSaving, setIsSaving] = useState(false)

  const addRow = () => {
    setData([
      ...data,
      {
        unitType: '',
        unitCount: 0,
        currentRent: 0,
        marketRent: 0,
        avgLocFee: 0,
      },
    ])
  }

  const removeRow = async (index: number) => {
    const row = data[index]
    if (row.id && onDelete) {
      await onDelete(row.id)
    }
    setData(data.filter((_, i) => i !== index))
  }

  const updateField = (index: number, field: keyof UnitMixRow, value: string | number) => {
    setData(
      data.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(data)
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  // Calculate totals
  const totals = data.reduce(
    (acc, row) => ({
      totalUnits: acc.totalUnits + row.unitCount,
      totalCurrentRevenue: acc.totalCurrentRevenue + row.unitCount * row.currentRent,
      totalMarketRevenue: acc.totalMarketRevenue + row.unitCount * row.marketRent,
      totalLocFees: acc.totalLocFees + row.unitCount * row.avgLocFee,
    }),
    {
      totalUnits: 0,
      totalCurrentRevenue: 0,
      totalMarketRevenue: 0,
      totalLocFees: 0,
    }
  )

  const rentUpside = totals.totalMarketRevenue - totals.totalCurrentRevenue

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-heading font-semibold">Unit Mix</h3>
          <p className="text-sm text-muted-foreground">
            Define unit types and current vs. market rents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit Type
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit Type</TableHead>
              <TableHead className="text-right">Unit Count</TableHead>
              <TableHead className="text-right">Current Rent</TableHead>
              <TableHead className="text-right">Market Rent</TableHead>
              <TableHead className="text-right">Avg LOC Fee</TableHead>
              <TableHead className="text-right">Total Current</TableHead>
              <TableHead className="text-right">Total Market</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No unit types added yet. Click "Add Unit Type" to get started.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={row.unitType}
                      onChange={(e) => updateField(index, 'unitType', e.target.value)}
                      placeholder="e.g., Studio, 1BR, 2BR"
                      className="border-l-2 border-l-accent"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.unitCount || ''}
                      onChange={(e) =>
                        updateField(index, 'unitCount', parseInt(e.target.value) || 0)
                      }
                      className="text-right font-mono border-l-2 border-l-accent"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.currentRent || ''}
                      onChange={(e) =>
                        updateField(index, 'currentRent', parseFloat(e.target.value) || 0)
                      }
                      className="text-right font-mono border-l-2 border-l-accent"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.marketRent || ''}
                      onChange={(e) =>
                        updateField(index, 'marketRent', parseFloat(e.target.value) || 0)
                      }
                      className="text-right font-mono border-l-2 border-l-accent"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.avgLocFee || ''}
                      onChange={(e) =>
                        updateField(index, 'avgLocFee', parseFloat(e.target.value) || 0)
                      }
                      className="text-right font-mono border-l-2 border-l-accent"
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {formatCurrency(row.unitCount * row.currentRent)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {formatCurrency(row.unitCount * row.marketRent)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(index)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}

            {data.length > 0 && (
              <TableRow className="bg-muted font-semibold">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right font-mono">{totals.totalUnits}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(totals.totalCurrentRevenue)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(totals.totalMarketRevenue)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Units</p>
              <p className="text-2xl font-bold font-mono">{totals.totalUnits}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Current Revenue</p>
              <p className="text-2xl font-bold font-mono">
                {formatCurrency(totals.totalCurrentRevenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Rent Upside</p>
              <p
                className={`text-2xl font-bold font-mono ${
                  rentUpside > 0 ? 'text-green-600' : ''
                }`}
              >
                {formatCurrency(rentUpside)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
