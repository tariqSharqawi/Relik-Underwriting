'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { T12Table } from './t12-table'
import { T12Chart } from './t12-chart'
import { ExpenseBreakdown } from './expense-breakdown'
import { UnitMixTable } from './unit-mix-table'
import { saveT12DataAction, saveUnitMixAction, deleteUnitMixAction } from '@/app/actions/t12'
import {
  calculateGrossRevenue,
  calculateTotalExpenses,
  calculateT12Totals,
  getExpenseBreakdown,
  type T12Month,
} from '@/lib/calculations/t12'

interface UnitMixData {
  id?: number
  unitType: string
  unitCount: number
  currentRent: number
  marketRent: number
  avgLocFee: number
}

interface T12MonthData {
  id?: number
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

interface T12ContainerProps {
  dealId: number
  totalUnits: number
  initialT12Data?: T12Month[]
  initialUnitMixData?: UnitMixData[]
}

// Generate default 12 months if no data exists
function generateDefaultMonths(): T12Month[] {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]

  return monthNames.map((name) => ({
    month: name,
    roomRent: 0,
    locFees: 0,
    otherIncome: 0,
    grossRevenue: 0,
    occupiedUnits: 0,
    totalUnits: 0,
    occupancyRate: 0,
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
  }))
}

export function T12Container({
  dealId,
  totalUnits,
  initialT12Data,
  initialUnitMixData,
}: T12ContainerProps) {
  const [t12Data, setT12Data] = useState<T12Month[]>(
    initialT12Data && initialT12Data.length > 0 ? initialT12Data : generateDefaultMonths()
  )
  const [unitMixData, setUnitMixData] = useState<UnitMixData[]>(initialUnitMixData || [])

  const handleSaveT12 = async (data: T12MonthData[]) => {
    const result = await saveT12DataAction(dealId, data)

    if (result.success) {
      toast.success('T12 data saved successfully')
    } else {
      toast.error(result.error || 'Failed to save T12 data')
    }
  }

  const handleSaveUnitMix = async (data: UnitMixData[]) => {
    const result = await saveUnitMixAction(dealId, data)

    if (result.success) {
      toast.success('Unit mix saved successfully')
    } else {
      toast.error(result.error || 'Failed to save unit mix')
    }
  }

  const handleDeleteUnitMix = async (id: number) => {
    const result = await deleteUnitMixAction(id)

    if (result.success) {
      toast.success('Unit type deleted')
    } else {
      toast.error(result.error || 'Failed to delete unit type')
    }
  }

  // Calculate totals and chart data
  const totals = calculateT12Totals(t12Data)
  const expenseBreakdown = getExpenseBreakdown(totals)

  const chartData = t12Data.map((month) => {
    const grossRevenue = calculateGrossRevenue(month.roomRent, month.locFees, month.otherIncome)
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
      month: month.month,
      grossRevenue,
      totalExpenses,
      noi,
    }
  })

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Annual Gross Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">{formatCurrency(totals.totalGrossRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Annual Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">{formatCurrency(totals.totalExpenses)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Annual NOI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono text-green-600">
              {formatCurrency(totals.totalNOI)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Data Entry, Charts, and Unit Mix */}
      <Tabs defaultValue="data" className="space-y-6">
        <TabsList>
          <TabsTrigger value="data">Data Entry</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="unit-mix">Unit Mix</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4">
          <T12Table initialData={t12Data} totalUnits={totalUnits} onSave={handleSaveT12} />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <T12Chart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Proportion of each expense category to gross revenue
              </p>
            </CardHeader>
            <CardContent>
              <ExpenseBreakdown data={expenseBreakdown} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Occupancy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono">
                  {formatPercent(totals.avgOccupancyRate)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Expense Ratio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold font-mono ${
                    totals.avgExpenseRatio > 0.75 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {formatPercent(totals.avgExpenseRatio)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="unit-mix">
          <UnitMixTable
            initialData={unitMixData}
            onSave={handleSaveUnitMix}
            onDelete={handleDeleteUnitMix}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
