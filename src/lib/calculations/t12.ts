/**
 * T12 financial calculations
 */

export interface T12Month {
  month: string
  roomRent: number
  locFees: number
  otherIncome: number
  grossRevenue: number
  occupiedUnits: number
  totalUnits: number
  occupancyRate: number
  payroll: number
  dietary: number
  utilities: number
  insurance: number
  managementFee: number
  maintenance: number
  marketing: number
  admin: number
  otherExpenses: number
  totalExpenses: number
  noi: number
}

export interface T12Totals {
  totalGrossRevenue: number
  totalRoomRent: number
  totalLocFees: number
  totalOtherIncome: number
  totalExpenses: number
  totalPayroll: number
  totalDietary: number
  totalUtilities: number
  totalInsurance: number
  totalManagementFee: number
  totalMaintenance: number
  totalMarketing: number
  totalAdmin: number
  totalOtherExpenses: number
  totalNOI: number
  avgOccupancyRate: number
  avgExpenseRatio: number
}

/**
 * Calculate gross revenue from components
 */
export function calculateGrossRevenue(
  roomRent: number,
  locFees: number,
  otherIncome: number
): number {
  return roomRent + locFees + otherIncome
}

/**
 * Calculate total expenses from all categories
 */
export function calculateTotalExpenses(
  payroll: number,
  dietary: number,
  utilities: number,
  insurance: number,
  managementFee: number,
  maintenance: number,
  marketing: number,
  admin: number,
  otherExpenses: number
): number {
  return (
    payroll +
    dietary +
    utilities +
    insurance +
    managementFee +
    maintenance +
    marketing +
    admin +
    otherExpenses
  )
}

/**
 * Calculate occupancy rate
 */
export function calculateOccupancyRate(
  occupiedUnits: number,
  totalUnits: number
): number {
  if (totalUnits === 0) return 0
  return occupiedUnits / totalUnits
}

/**
 * Calculate expense ratio for a month
 */
export function calculateExpenseRatioPerMonth(
  totalExpenses: number,
  grossRevenue: number
): number {
  if (grossRevenue === 0) return 0
  return totalExpenses / grossRevenue
}

/**
 * Calculate T12 totals from monthly data
 */
export function calculateT12Totals(months: T12Month[]): T12Totals {
  if (months.length === 0) {
    return {
      totalGrossRevenue: 0,
      totalRoomRent: 0,
      totalLocFees: 0,
      totalOtherIncome: 0,
      totalExpenses: 0,
      totalPayroll: 0,
      totalDietary: 0,
      totalUtilities: 0,
      totalInsurance: 0,
      totalManagementFee: 0,
      totalMaintenance: 0,
      totalMarketing: 0,
      totalAdmin: 0,
      totalOtherExpenses: 0,
      totalNOI: 0,
      avgOccupancyRate: 0,
      avgExpenseRatio: 0,
    }
  }

  const totals = months.reduce(
    (acc, month) => ({
      totalGrossRevenue: acc.totalGrossRevenue + month.grossRevenue,
      totalRoomRent: acc.totalRoomRent + month.roomRent,
      totalLocFees: acc.totalLocFees + month.locFees,
      totalOtherIncome: acc.totalOtherIncome + month.otherIncome,
      totalExpenses: acc.totalExpenses + month.totalExpenses,
      totalPayroll: acc.totalPayroll + month.payroll,
      totalDietary: acc.totalDietary + month.dietary,
      totalUtilities: acc.totalUtilities + month.utilities,
      totalInsurance: acc.totalInsurance + month.insurance,
      totalManagementFee: acc.totalManagementFee + month.managementFee,
      totalMaintenance: acc.totalMaintenance + month.maintenance,
      totalMarketing: acc.totalMarketing + month.marketing,
      totalAdmin: acc.totalAdmin + month.admin,
      totalOtherExpenses: acc.totalOtherExpenses + month.otherExpenses,
      totalNOI: acc.totalNOI + month.noi,
      totalOccupancy: acc.totalOccupancy + month.occupancyRate,
    }),
    {
      totalGrossRevenue: 0,
      totalRoomRent: 0,
      totalLocFees: 0,
      totalOtherIncome: 0,
      totalExpenses: 0,
      totalPayroll: 0,
      totalDietary: 0,
      totalUtilities: 0,
      totalInsurance: 0,
      totalManagementFee: 0,
      totalMaintenance: 0,
      totalMarketing: 0,
      totalAdmin: 0,
      totalOtherExpenses: 0,
      totalNOI: 0,
      totalOccupancy: 0,
    }
  )

  return {
    ...totals,
    avgOccupancyRate: totals.totalOccupancy / months.length,
    avgExpenseRatio:
      totals.totalGrossRevenue > 0
        ? totals.totalExpenses / totals.totalGrossRevenue
        : 0,
  }
}

/**
 * Calculate expense category as percentage of gross revenue
 */
export function calculateExpenseCategoryPercent(
  categoryAmount: number,
  grossRevenue: number
): number {
  if (grossRevenue === 0) return 0
  return categoryAmount / grossRevenue
}

/**
 * Get expense breakdown percentages for all categories
 */
export function getExpenseBreakdown(totals: T12Totals) {
  const totalRevenue = totals.totalGrossRevenue

  return {
    payroll: calculateExpenseCategoryPercent(totals.totalPayroll, totalRevenue),
    dietary: calculateExpenseCategoryPercent(totals.totalDietary, totalRevenue),
    utilities: calculateExpenseCategoryPercent(totals.totalUtilities, totalRevenue),
    insurance: calculateExpenseCategoryPercent(totals.totalInsurance, totalRevenue),
    managementFee: calculateExpenseCategoryPercent(totals.totalManagementFee, totalRevenue),
    maintenance: calculateExpenseCategoryPercent(totals.totalMaintenance, totalRevenue),
    marketing: calculateExpenseCategoryPercent(totals.totalMarketing, totalRevenue),
    admin: calculateExpenseCategoryPercent(totals.totalAdmin, totalRevenue),
    otherExpenses: calculateExpenseCategoryPercent(totals.totalOtherExpenses, totalRevenue),
  }
}
