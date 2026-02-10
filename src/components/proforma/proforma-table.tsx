'use client'

import type { ProformaYear } from '@/lib/calculations/proforma'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface ProformaTableProps {
  years: ProformaYear[]
}

export function ProformaTable({ years }: ProformaTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  // Calculate totals
  const totals = years.reduce(
    (acc, year) => ({
      totalRevenue: acc.totalRevenue + year.grossRevenue,
      totalExpenses: acc.totalExpenses + year.totalExpenses,
      totalNOI: acc.totalNOI + year.noi,
      totalDebtService: acc.totalDebtService + year.debtService,
      totalCashFlow: acc.totalCashFlow + year.cashFlow,
      totalRefiDist: acc.totalRefiDist + (year.refiDistribution || 0),
      totalCapitalReturned: acc.totalCapitalReturned + (year.capitalReturned || 0),
    }),
    {
      totalRevenue: 0,
      totalExpenses: 0,
      totalNOI: 0,
      totalDebtService: 0,
      totalCashFlow: 0,
      totalRefiDist: 0,
      totalCapitalReturned: 0,
    }
  )

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-background z-10">Year</TableHead>
            <TableHead className="text-right">Occupancy</TableHead>
            <TableHead className="text-right">Gross Revenue</TableHead>
            <TableHead className="text-right">Total Expenses</TableHead>
            <TableHead className="text-right">NOI</TableHead>
            <TableHead className="text-right">Debt Service</TableHead>
            <TableHead className="text-right">Cash Flow</TableHead>
            <TableHead className="text-right">Capital Events</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {years.map((year) => (
            <TableRow
              key={year.year}
              className={
                year.isRefiYear || year.isExitYear ? 'bg-muted/50 font-medium' : ''
              }
            >
              <TableCell className="sticky left-0 bg-background z-10 font-medium">
                <div className="flex items-center gap-2">
                  Year {year.year}
                  {year.isRefiYear && (
                    <Badge variant="secondary" className="text-xs">
                      Refi
                    </Badge>
                  )}
                  {year.isExitYear && (
                    <Badge className="text-xs">Exit</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatPercent(year.occupancy)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(year.grossRevenue)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(year.totalExpenses)}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {formatCurrency(year.noi)}
              </TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">
                {formatCurrency(year.debtService)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(year.cashFlow)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {year.refiDistribution ? (
                  <span className="text-green-600">
                    +{formatCurrency(year.refiDistribution)}
                  </span>
                ) : year.exitProceeds ? (
                  <span className="text-green-600 font-semibold">
                    +{formatCurrency(year.exitProceeds)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}

          {/* Totals Row */}
          <TableRow className="bg-muted font-semibold border-t-2">
            <TableCell className="sticky left-0 bg-muted z-10">TOTAL</TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(totals.totalRevenue)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(totals.totalExpenses)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(totals.totalNOI)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(totals.totalDebtService)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(totals.totalCashFlow)}
            </TableCell>
            <TableCell className="text-right font-mono text-green-600">
              +{formatCurrency(totals.totalRefiDist + totals.totalCapitalReturned)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
