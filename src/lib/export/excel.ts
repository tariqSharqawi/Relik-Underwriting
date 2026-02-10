import * as XLSX from 'xlsx'
import type { T12Month, T12Totals } from '@/lib/calculations/t12'
import type { ProformaYear, ProformaMetrics } from '@/lib/calculations/proforma'
import type { Deal } from '@/types/supabase'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

const formatPercent = (value: number, decimals: number = 2) =>
  `${(value * 100).toFixed(decimals)}%`

/**
 * Generate Excel file for T12 Financials
 */
export function generateT12Excel(
  deal: Deal,
  t12Data: T12Month[],
  t12Totals: T12Totals
): ArrayBuffer {
  const wb = XLSX.utils.book_new()

  // Sort months chronologically
  const sortedMonths = [...t12Data].sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
  )

  // Create T12 data sheet
  const t12SheetData = [
    // Header
    [
      'Month',
      'Room Rent',
      'LOC Fees',
      'Other Income',
      'Gross Revenue',
      'Occupied Units',
      'Occupancy %',
      'Payroll',
      'Dietary',
      'Utilities',
      'Insurance',
      'Management',
      'Maintenance',
      'Marketing',
      'Admin',
      'Other',
      'Total Expenses',
      'NOI',
    ],
    // Data rows
    ...sortedMonths.map((month) => [
      new Date(month.month).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      }),
      month.roomRent,
      month.locFees,
      month.otherIncome,
      month.grossRevenue,
      month.occupiedUnits,
      month.occupancyRate,
      month.payroll,
      month.dietary,
      month.utilities,
      month.insurance,
      month.managementFee,
      month.maintenance,
      month.marketing,
      month.admin,
      month.otherExpenses,
      month.totalExpenses,
      month.noi,
    ]),
    // Totals row
    [
      'TOTAL',
      t12Totals.totalRoomRent,
      t12Totals.totalLocFees,
      t12Totals.totalOtherIncome,
      t12Totals.totalGrossRevenue,
      '',
      t12Totals.avgOccupancyRate,
      t12Totals.totalPayroll,
      t12Totals.totalDietary,
      t12Totals.totalUtilities,
      t12Totals.totalInsurance,
      t12Totals.totalManagementFee,
      t12Totals.totalMaintenance,
      t12Totals.totalMarketing,
      t12Totals.totalAdmin,
      t12Totals.totalOtherExpenses,
      t12Totals.totalExpenses,
      t12Totals.totalNOI,
    ],
  ]

  const t12Sheet = XLSX.utils.aoa_to_sheet(t12SheetData)

  // Set column widths
  t12Sheet['!cols'] = [
    { wch: 12 }, // Month
    { wch: 12 }, // Room Rent
    { wch: 12 }, // LOC Fees
    { wch: 12 }, // Other Income
    { wch: 14 }, // Gross Revenue
    { wch: 14 }, // Occupied Units
    { wch: 12 }, // Occupancy %
    { wch: 12 }, // Payroll
    { wch: 12 }, // Dietary
    { wch: 12 }, // Utilities
    { wch: 12 }, // Insurance
    { wch: 12 }, // Management
    { wch: 12 }, // Maintenance
    { wch: 12 }, // Marketing
    { wch: 12 }, // Admin
    { wch: 12 }, // Other
    { wch: 14 }, // Total Expenses
    { wch: 14 }, // NOI
  ]

  // Format currency columns (B to E, H to R)
  const currencyCols = ['B', 'C', 'D', 'E', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']
  const dataRowCount = sortedMonths.length + 2 // +1 for header, +1 for totals

  for (let row = 2; row <= dataRowCount; row++) {
    currencyCols.forEach((col) => {
      const cellRef = `${col}${row}`
      if (t12Sheet[cellRef]) {
        t12Sheet[cellRef].z = '$#,##0.00'
      }
    })
  }

  // Format percentage column (G)
  for (let row = 2; row <= dataRowCount; row++) {
    const cellRef = `G${row}`
    if (t12Sheet[cellRef]) {
      t12Sheet[cellRef].z = '0.00%'
    }
  }

  XLSX.utils.book_append_sheet(wb, t12Sheet, 'T12 Financials')

  // Create Summary sheet
  const summaryData = [
    ['TRAILING 12-MONTH SUMMARY'],
    ['Property:', deal.name],
    ['Location:', `${deal.city}, ${deal.state}`],
    [''],
    ['REVENUE'],
    ['Total Room Rent', t12Totals.totalRoomRent],
    ['Total Level of Care Fees', t12Totals.totalLocFees],
    ['Total Other Income', t12Totals.totalOtherIncome],
    ['TOTAL GROSS REVENUE', t12Totals.totalGrossRevenue],
    [''],
    ['EXPENSES'],
    ['Total Payroll', t12Totals.totalPayroll],
    ['Total Dietary', t12Totals.totalDietary],
    ['Total Utilities', t12Totals.totalUtilities],
    ['Total Insurance', t12Totals.totalInsurance],
    ['Total Management', t12Totals.totalManagementFee],
    ['Total Maintenance', t12Totals.totalMaintenance],
    ['Total Marketing', t12Totals.totalMarketing],
    ['Total Admin', t12Totals.totalAdmin],
    ['Total Other', t12Totals.totalOtherExpenses],
    ['TOTAL EXPENSES', t12Totals.totalExpenses],
    [''],
    ['NET OPERATING INCOME', t12Totals.totalNOI],
    [''],
    ['METRICS'],
    ['Average Occupancy', t12Totals.avgOccupancyRate],
    [
      'Expense Ratio',
      t12Totals.totalGrossRevenue > 0
        ? t12Totals.totalExpenses / t12Totals.totalGrossRevenue
        : 0,
    ],
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 18 }]

  // Format currency cells in summary
  const currencyRows = [5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22]
  currencyRows.forEach((row) => {
    const cellRef = `B${row}`
    if (summarySheet[cellRef]) {
      summarySheet[cellRef].z = '$#,##0.00'
    }
  })

  // Format percentage cells in summary
  const percentRows = [25, 26]
  percentRows.forEach((row) => {
    const cellRef = `B${row}`
    if (summarySheet[cellRef]) {
      summarySheet[cellRef].z = '0.00%'
    }
  })

  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

/**
 * Generate Excel file for Proforma Projections
 */
export function generateProformaExcel(
  deal: Deal,
  proformaYears: ProformaYear[],
  proformaMetrics: ProformaMetrics
): ArrayBuffer {
  const wb = XLSX.utils.book_new()

  // Create Proforma sheet
  const proformaData = [
    // Header
    [
      'Year',
      'Occupancy %',
      'Gross Revenue',
      'Total Expenses',
      'NOI',
      'Debt Service',
      'Cash Flow',
      'Refi?',
      'Refi Amount',
      'Exit?',
      'Exit Sale Price',
      'Capital Returned',
    ],
    // Data rows
    ...proformaYears.map((year) => [
      year.year,
      year.occupancy,
      year.grossRevenue,
      year.totalExpenses,
      year.noi,
      year.debtService,
      year.cashFlow,
      year.isRefiYear ? 'Yes' : 'No',
      year.refiLoanAmount || 0,
      year.isExitYear ? 'Yes' : 'No',
      year.exitSalePrice || 0,
      year.capitalReturned || 0,
    ]),
  ]

  const proformaSheet = XLSX.utils.aoa_to_sheet(proformaData)

  // Set column widths
  proformaSheet['!cols'] = [
    { wch: 8 }, // Year
    { wch: 12 }, // Occupancy
    { wch: 15 }, // Revenue
    { wch: 15 }, // Expenses
    { wch: 15 }, // NOI
    { wch: 15 }, // Debt Service
    { wch: 15 }, // Cash Flow
    { wch: 8 }, // Refi?
    { wch: 15 }, // Refi Amount
    { wch: 8 }, // Exit?
    { wch: 15 }, // Exit Price
    { wch: 15 }, // Capital Returned
  ]

  // Format percentage column (B)
  for (let row = 2; row <= proformaYears.length + 1; row++) {
    const cellRef = `B${row}`
    if (proformaSheet[cellRef]) {
      proformaSheet[cellRef].z = '0.00%'
    }
  }

  // Format currency columns (C to G, I, K, L)
  const currencyCols = ['C', 'D', 'E', 'F', 'G', 'I', 'K', 'L']
  for (let row = 2; row <= proformaYears.length + 1; row++) {
    currencyCols.forEach((col) => {
      const cellRef = `${col}${row}`
      if (proformaSheet[cellRef]) {
        proformaSheet[cellRef].z = '$#,##0.00'
      }
    })
  }

  XLSX.utils.book_append_sheet(wb, proformaSheet, 'Proforma')

  // Create Returns sheet
  const returnsData = [
    ['INVESTMENT RETURNS SUMMARY'],
    ['Property:', deal.name],
    [''],
    ['INVESTMENT METRICS'],
    ['Total Equity Invested', proformaMetrics.totalEquityInvested],
    ['Total Distributions', proformaMetrics.totalDistributions],
    ['Equity Multiple', proformaMetrics.equityMultiple],
    ['IRR', proformaMetrics.irr],
    ['Average Cash-on-Cash Return', proformaMetrics.averageCashOnCash],
    [''],
    ['CASH FLOW BY YEAR'],
    ['Year', 'Cash Flow', 'Cumulative'],
  ]

  let cumulative = 0
  proformaYears.forEach((year) => {
    cumulative += year.cashFlow + (year.capitalReturned || 0)
    returnsData.push([
      `Year ${year.year}`,
      year.cashFlow + (year.capitalReturned || 0),
      cumulative,
    ])
  })

  const returnsSheet = XLSX.utils.aoa_to_sheet(returnsData)
  returnsSheet['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 18 }]

  // Format currency cells
  const currencyRows = [4, 5]
  currencyRows.forEach((row) => {
    const cellRef = `B${row}`
    if (returnsSheet[cellRef]) {
      returnsSheet[cellRef].z = '$#,##0.00'
    }
  })

  // Format percentage/decimal cells
  if (returnsSheet['B7']) returnsSheet['B7'].z = '0.00' // Equity Multiple
  if (returnsSheet['B8']) returnsSheet['B8'].z = '0.00%' // IRR
  if (returnsSheet['B9']) returnsSheet['B9'].z = '0.00%' // Cash-on-Cash

  // Format cash flow data
  const cashFlowStartRow = 12
  for (let row = cashFlowStartRow; row < cashFlowStartRow + proformaYears.length; row++) {
    if (returnsSheet[`B${row}`]) returnsSheet[`B${row}`].z = '$#,##0.00'
    if (returnsSheet[`C${row}`]) returnsSheet[`C${row}`].z = '$#,##0.00'
  }

  XLSX.utils.book_append_sheet(wb, returnsSheet, 'Returns')

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

/**
 * Generate complete Excel workbook with all data
 */
export function generateCompleteExcel(
  deal: Deal,
  t12Data: T12Month[],
  t12Totals: T12Totals,
  proformaYears: ProformaYear[],
  proformaMetrics: ProformaMetrics
): ArrayBuffer {
  const wb = XLSX.utils.book_new()

  // Deal Summary sheet
  const summaryData = [
    ['RELIK CAPITAL GROUP'],
    ['INVESTMENT ANALYSIS'],
    [''],
    ['Property Name:', deal.name],
    ['Location:', `${deal.city}, ${deal.state}`],
    ['Property Type:', deal.property_type?.replace(/_/g, ' ')],
    ['Total Units:', deal.total_units],
    ['Licensed Beds:', deal.licensed_beds],
    [''],
    ['PRICING'],
    ['Asking Price:', Number(deal.asking_price)],
    ['Maximum Offer:', Number(deal.max_offer_price) || 0],
    [''],
    ['KEY METRICS'],
    ['Purchase Cap Rate:', Number(deal.cap_rate_purchase) || 0],
    ['Exit Cap Rate:', Number(deal.cap_rate_exit) || 0],
    ['Equity Multiple:', Number(deal.equity_multiple) || 0],
    ['IRR:', Number(deal.irr) || 0],
    ['Expense Ratio:', Number(deal.expense_ratio) || 0],
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }]

  // Format currency
  if (summarySheet['B10']) summarySheet['B10'].z = '$#,##0.00'
  if (summarySheet['B11']) summarySheet['B11'].z = '$#,##0.00'

  // Format percentages
  if (summarySheet['B14']) summarySheet['B14'].z = '0.00%'
  if (summarySheet['B15']) summarySheet['B15'].z = '0.00%'
  if (summarySheet['B17']) summarySheet['B17'].z = '0.00%'
  if (summarySheet['B18']) summarySheet['B18'].z = '0.00%'

  // Format equity multiple
  if (summarySheet['B16']) summarySheet['B16'].z = '0.00'

  XLSX.utils.book_append_sheet(wb, summarySheet, 'Deal Summary')

  // Add T12 sheets from generateT12Excel
  const sortedMonths = [...t12Data].sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
  )

  const t12SheetData = [
    [
      'Month',
      'Room Rent',
      'LOC Fees',
      'Other Income',
      'Gross Revenue',
      'Occupied Units',
      'Occupancy %',
      'Payroll',
      'Dietary',
      'Utilities',
      'Insurance',
      'Management',
      'Maintenance',
      'Marketing',
      'Admin',
      'Other',
      'Total Expenses',
      'NOI',
    ],
    ...sortedMonths.map((month) => [
      new Date(month.month).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      }),
      month.roomRent,
      month.locFees,
      month.otherIncome,
      month.grossRevenue,
      month.occupiedUnits,
      month.occupancyRate,
      month.payroll,
      month.dietary,
      month.utilities,
      month.insurance,
      month.managementFee,
      month.maintenance,
      month.marketing,
      month.admin,
      month.otherExpenses,
      month.totalExpenses,
      month.noi,
    ]),
    [
      'TOTAL',
      t12Totals.totalRoomRent,
      t12Totals.totalLocFees,
      t12Totals.totalOtherIncome,
      t12Totals.totalGrossRevenue,
      '',
      t12Totals.avgOccupancyRate,
      t12Totals.totalPayroll,
      t12Totals.totalDietary,
      t12Totals.totalUtilities,
      t12Totals.totalInsurance,
      t12Totals.totalManagementFee,
      t12Totals.totalMaintenance,
      t12Totals.totalMarketing,
      t12Totals.totalAdmin,
      t12Totals.totalOtherExpenses,
      t12Totals.totalExpenses,
      t12Totals.totalNOI,
    ],
  ]

  const t12Sheet = XLSX.utils.aoa_to_sheet(t12SheetData)
  t12Sheet['!cols'] = Array(18).fill({ wch: 12 })
  XLSX.utils.book_append_sheet(wb, t12Sheet, 'T12 Financials')

  // Add Proforma sheet
  const proformaData = [
    [
      'Year',
      'Occupancy %',
      'Gross Revenue',
      'Total Expenses',
      'NOI',
      'Debt Service',
      'Cash Flow',
      'Refi?',
      'Refi Amount',
      'Exit?',
      'Exit Sale Price',
      'Capital Returned',
    ],
    ...proformaYears.map((year) => [
      year.year,
      year.occupancy,
      year.grossRevenue,
      year.totalExpenses,
      year.noi,
      year.debtService,
      year.cashFlow,
      year.isRefiYear ? 'Yes' : 'No',
      year.refiLoanAmount || 0,
      year.isExitYear ? 'Yes' : 'No',
      year.exitSalePrice || 0,
      year.capitalReturned || 0,
    ]),
  ]

  const proformaSheet = XLSX.utils.aoa_to_sheet(proformaData)
  proformaSheet['!cols'] = Array(12).fill({ wch: 14 })
  XLSX.utils.book_append_sheet(wb, proformaSheet, 'Proforma')

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}
