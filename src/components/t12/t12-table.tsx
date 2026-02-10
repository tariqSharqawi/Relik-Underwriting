'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import {
  calculateGrossRevenue,
  calculateTotalExpenses,
  calculateOccupancyRate,
} from '@/lib/calculations/t12'

interface T12MonthData {
  id?: string
  month: string
  roomRent: number
  locFees: number
  otherIncome: number
  occupiedUnits: number
  payroll: number
  dietary: number
  utilities: number
  insurance: number
  managementFee: number
  maintenance: number
  marketing: number
  admin: number
  otherExpenses: number
}

interface T12TableProps {
  initialData: T12MonthData[]
  totalUnits: number
  onSave: (data: T12MonthData[]) => Promise<void>
}

export function T12Table({ initialData, totalUnits, onSave }: T12TableProps) {
  const [data, setData] = useState<T12MonthData[]>(initialData)
  const [isSaving, setIsSaving] = useState(false)

  // Update a field in a specific month
  const updateField = (monthIndex: number, field: keyof T12MonthData, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value)
    if (isNaN(numValue) && field !== 'month') return

    setData((prev) =>
      prev.map((month, index) =>
        index === monthIndex
          ? { ...month, [field]: field === 'month' ? value : numValue }
          : month
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

  // Calculate totals row
  const totals = data.reduce(
    (acc, month) => {
      const grossRevenue = calculateGrossRevenue(
        month.roomRent,
        month.locFees,
        month.otherIncome
      )
      const totalExpenses = calculateTotalExpenses(
        month.payroll,
        month.dietary,
        month.utilities,
        month.insurance,
        month.managementFee,
        month.maintenance,
        month.marketing,
        month.admin,
        month.otherExpenses
      )
      const noi = grossRevenue - totalExpenses

      return {
        roomRent: acc.roomRent + month.roomRent,
        locFees: acc.locFees + month.locFees,
        otherIncome: acc.otherIncome + month.otherIncome,
        grossRevenue: acc.grossRevenue + grossRevenue,
        payroll: acc.payroll + month.payroll,
        dietary: acc.dietary + month.dietary,
        utilities: acc.utilities + month.utilities,
        insurance: acc.insurance + month.insurance,
        managementFee: acc.managementFee + month.managementFee,
        maintenance: acc.maintenance + month.maintenance,
        marketing: acc.marketing + month.marketing,
        admin: acc.admin + month.admin,
        otherExpenses: acc.otherExpenses + month.otherExpenses,
        totalExpenses: acc.totalExpenses + totalExpenses,
        noi: acc.noi + noi,
      }
    },
    {
      roomRent: 0,
      locFees: 0,
      otherIncome: 0,
      grossRevenue: 0,
      payroll: 0,
      dietary: 0,
      utilities: 0,
      insurance: 0,
      managementFee: 0,
      maintenance: 0,
      marketing: 0,
      admin: 0,
      otherExpenses: 0,
      totalExpenses: 0,
      noi: 0,
    }
  )

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="sticky left-0 bg-muted p-3 text-left font-medium min-w-[100px]">Month</th>
              <th className="p-3 text-right font-medium min-w-[140px]">Room Rent</th>
              <th className="p-3 text-right font-medium min-w-[140px]">LOC Fees</th>
              <th className="p-3 text-right font-medium min-w-[140px]">Other Income</th>
              <th className="p-3 text-right font-medium bg-muted-foreground/10 min-w-[140px]">
                Gross Revenue
              </th>
              <th className="p-3 text-right font-medium min-w-[120px]">Occupied Units</th>
              <th className="p-3 text-right font-medium bg-muted-foreground/10 min-w-[120px]">
                Occupancy %
              </th>
              <th className="p-3 text-right font-medium min-w-[140px]">Payroll</th>
              <th className="p-3 text-right font-medium min-w-[140px]">Dietary</th>
              <th className="p-3 text-right font-medium min-w-[140px]">Utilities</th>
              <th className="p-3 text-right font-medium min-w-[140px]">Insurance</th>
              <th className="p-3 text-right font-medium min-w-[140px]">Mgmt Fee</th>
              <th className="p-3 text-right font-medium min-w-[140px]">Maintenance</th>
              <th className="p-3 text-right font-medium min-w-[140px]">Marketing</th>
              <th className="p-3 text-right font-medium min-w-[140px]">Admin</th>
              <th className="p-3 text-right font-medium min-w-[140px]">Other Exp</th>
              <th className="p-3 text-right font-medium bg-muted-foreground/10 min-w-[140px]">
                Total Expenses
              </th>
              <th className="p-3 text-right font-medium bg-muted-foreground/10 min-w-[140px]">NOI</th>
            </tr>
          </thead>
          <tbody>
            {data.map((month, monthIndex) => {
              const grossRevenue = calculateGrossRevenue(
                month.roomRent,
                month.locFees,
                month.otherIncome
              )
              const totalExpenses = calculateTotalExpenses(
                month.payroll,
                month.dietary,
                month.utilities,
                month.insurance,
                month.managementFee,
                month.maintenance,
                month.marketing,
                month.admin,
                month.otherExpenses
              )
              const noi = grossRevenue - totalExpenses
              const occupancyRate =
                calculateOccupancyRate(month.occupiedUnits, totalUnits) * 100

              return (
                <tr key={monthIndex} className="border-t hover:bg-muted/50">
                  <td className="sticky left-0 bg-background p-2">
                    <Input
                      type="text"
                      value={month.month}
                      onChange={(e) => updateField(monthIndex, 'month', e.target.value)}
                      className="h-11 min-w-[90px] border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.roomRent || ''}
                      onChange={(e) => updateField(monthIndex, 'roomRent', e.target.value)}
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.locFees || ''}
                      onChange={(e) => updateField(monthIndex, 'locFees', e.target.value)}
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.otherIncome || ''}
                      onChange={(e) =>
                        updateField(monthIndex, 'otherIncome', e.target.value)
                      }
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2 text-right font-mono bg-muted/50 text-muted-foreground">
                    {formatCurrency(grossRevenue)}
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.occupiedUnits || ''}
                      onChange={(e) =>
                        updateField(monthIndex, 'occupiedUnits', e.target.value)
                      }
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2 text-right font-mono bg-muted/50 text-muted-foreground">
                    {occupancyRate.toFixed(1)}%
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.payroll || ''}
                      onChange={(e) => updateField(monthIndex, 'payroll', e.target.value)}
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.dietary || ''}
                      onChange={(e) => updateField(monthIndex, 'dietary', e.target.value)}
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.utilities || ''}
                      onChange={(e) =>
                        updateField(monthIndex, 'utilities', e.target.value)
                      }
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.insurance || ''}
                      onChange={(e) =>
                        updateField(monthIndex, 'insurance', e.target.value)
                      }
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.managementFee || ''}
                      onChange={(e) =>
                        updateField(monthIndex, 'managementFee', e.target.value)
                      }
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.maintenance || ''}
                      onChange={(e) =>
                        updateField(monthIndex, 'maintenance', e.target.value)
                      }
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.marketing || ''}
                      onChange={(e) =>
                        updateField(monthIndex, 'marketing', e.target.value)
                      }
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.admin || ''}
                      onChange={(e) => updateField(monthIndex, 'admin', e.target.value)}
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={month.otherExpenses || ''}
                      onChange={(e) =>
                        updateField(monthIndex, 'otherExpenses', e.target.value)
                      }
                      className="h-11 min-w-[120px] text-right font-mono border-l-2 border-l-accent text-base"
                    />
                  </td>
                  <td className="p-2 text-right font-mono bg-muted/50 text-muted-foreground">
                    {formatCurrency(totalExpenses)}
                  </td>
                  <td className="p-2 text-right font-mono bg-muted/50 font-semibold">
                    {formatCurrency(noi)}
                  </td>
                </tr>
              )
            })}

            {/* Totals Row */}
            <tr className="border-t-2 border-t-foreground bg-muted font-semibold">
              <td className="sticky left-0 bg-muted p-2">TOTAL</td>
              <td className="p-2 text-right font-mono">{formatCurrency(totals.roomRent)}</td>
              <td className="p-2 text-right font-mono">{formatCurrency(totals.locFees)}</td>
              <td className="p-2 text-right font-mono">
                {formatCurrency(totals.otherIncome)}
              </td>
              <td className="p-2 text-right font-mono bg-muted-foreground/20">
                {formatCurrency(totals.grossRevenue)}
              </td>
              <td className="p-2"></td>
              <td className="p-2"></td>
              <td className="p-2 text-right font-mono">{formatCurrency(totals.payroll)}</td>
              <td className="p-2 text-right font-mono">{formatCurrency(totals.dietary)}</td>
              <td className="p-2 text-right font-mono">{formatCurrency(totals.utilities)}</td>
              <td className="p-2 text-right font-mono">{formatCurrency(totals.insurance)}</td>
              <td className="p-2 text-right font-mono">
                {formatCurrency(totals.managementFee)}
              </td>
              <td className="p-2 text-right font-mono">
                {formatCurrency(totals.maintenance)}
              </td>
              <td className="p-2 text-right font-mono">{formatCurrency(totals.marketing)}</td>
              <td className="p-2 text-right font-mono">{formatCurrency(totals.admin)}</td>
              <td className="p-2 text-right font-mono">
                {formatCurrency(totals.otherExpenses)}
              </td>
              <td className="p-2 text-right font-mono bg-muted-foreground/20">
                {formatCurrency(totals.totalExpenses)}
              </td>
              <td className="p-2 text-right font-mono bg-muted-foreground/20 text-lg">
                {formatCurrency(totals.noi)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>💡 Editable fields have a gold left border</p>
        <p>🔢 Calculated fields (gray background) update automatically</p>
      </div>
    </div>
  )
}
