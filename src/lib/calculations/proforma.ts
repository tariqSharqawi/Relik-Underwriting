import { calculateAnnualDebtService } from './loan'

export interface ProformaYear {
  year: number
  occupancy: number
  grossRevenue: number
  totalExpenses: number
  noi: number
  debtService: number
  cashFlow: number
  isRefiYear: boolean
  refiLoanAmount: number | null
  refiDistribution: number | null
  isExitYear: boolean
  exitSalePrice: number | null
  exitProceeds: number | null
  capitalReturned: number | null
}

export interface ProformaMetrics {
  totalEquityInvested: number
  totalDistributions: number
  totalOperatingCashFlow: number
  refiDistribution: number
  exitProceeds: number
  equityMultiple: number
  irr: number
  averageCashOnCash: number
}

export interface ProformaAssumptions {
  // Current state
  currentNOI: number
  currentOccupancy: number
  purchasePrice: number

  // Loan terms
  downPaymentPct: number
  interestRate: number
  loanTermYears: number

  // Growth assumptions
  annualRentGrowth: number // e.g., 0.03 for 3%
  annualExpenseInflation: number // e.g., 0.025 for 2.5%

  // Occupancy ramp
  targetOccupancy: number // e.g., 0.93 for 93% (hard cap)
  occupancyRampYears: number // Years to reach target

  // Hold period
  holdYears: number

  // Refi assumptions
  refiYear: number | null
  refiInterestRate: number | null
  refiLoanToValue: number // e.g., 0.75 for 75% LTV

  // Exit assumptions
  exitYear: number
  exitCapRate: number // Should be higher (more conservative) than purchase cap

  // Fees
  acquisitionFeePct: number
  assetMgmtFeePct: number
  refiFeePct: number
  exitFeePct: number
}

/**
 * Calculate occupancy for a given year with ramp-up
 */
export function calculateOccupancyForYear(
  year: number,
  currentOccupancy: number,
  targetOccupancy: number,
  rampYears: number
): number {
  if (year > rampYears) {
    return targetOccupancy
  }

  const occupancyGain = targetOccupancy - currentOccupancy
  const yearlyGain = occupancyGain / rampYears

  return Math.min(currentOccupancy + yearlyGain * year, targetOccupancy)
}

/**
 * Calculate a single proforma year
 */
export function calculateProformaYear(
  year: number,
  assumptions: ProformaAssumptions,
  previousYear: ProformaYear | null
): ProformaYear {
  const {
    currentNOI,
    currentOccupancy,
    purchasePrice,
    downPaymentPct,
    interestRate,
    loanTermYears,
    annualRentGrowth,
    annualExpenseInflation,
    targetOccupancy,
    occupancyRampYears,
    refiYear,
    refiInterestRate,
    refiLoanToValue,
    exitYear,
    exitCapRate,
  } = assumptions

  // Calculate occupancy for this year
  const occupancy = calculateOccupancyForYear(
    year,
    currentOccupancy,
    targetOccupancy,
    occupancyRampYears
  )

  // Calculate revenue with growth and occupancy adjustment
  const occupancyMultiplier = occupancy / currentOccupancy
  const growthMultiplier = Math.pow(1 + annualRentGrowth, year)
  const baseRevenue = currentNOI / (1 - 0.73) // Assume 73% expense ratio to get revenue
  const grossRevenue = baseRevenue * growthMultiplier * occupancyMultiplier

  // Calculate expenses with inflation
  const expenseMultiplier = Math.pow(1 + annualExpenseInflation, year)
  const baseExpenses = currentNOI / (1 - 0.73) * 0.73
  const totalExpenses = baseExpenses * expenseMultiplier * occupancyMultiplier

  // NOI
  const noi = grossRevenue - totalExpenses

  // Debt service
  let loanAmount = purchasePrice * (1 - downPaymentPct)
  let currentInterestRate = interestRate

  // Check if we refinanced in a previous year
  if (previousYear && refiYear && year > refiYear) {
    loanAmount = previousYear.refiLoanAmount || loanAmount
    currentInterestRate = refiInterestRate || interestRate
  }

  const debtService = calculateAnnualDebtService(loanAmount, currentInterestRate, loanTermYears)

  // Cash flow
  const cashFlow = noi - debtService

  // Check if this is refi year
  const isRefiYear = refiYear === year
  let refiLoanAmount = null
  let refiDistribution = null

  if (isRefiYear) {
    // Calculate property value based on current NOI and market cap rate
    const estimatedValue = noi / exitCapRate
    refiLoanAmount = estimatedValue * refiLoanToValue

    // Refi proceeds = new loan - old loan balance
    // Simplified: assume 15% principal paid down per 5 years
    const oldBalance = loanAmount * (1 - 0.15 * (year / 5))
    refiDistribution = refiLoanAmount - oldBalance
  }

  // Check if this is exit year
  const isExitYear = exitYear === year
  let exitSalePrice = null
  let exitProceeds = null
  let capitalReturned = null

  if (isExitYear) {
    exitSalePrice = noi / exitCapRate

    // Calculate remaining loan balance
    const remainingBalance = loanAmount * (1 - 0.15 * (year / 5)) // Simplified

    // Exit proceeds = sale price - remaining loan - exit fees
    const exitFees = exitSalePrice * assumptions.exitFeePct
    exitProceeds = exitSalePrice - remainingBalance - exitFees
    capitalReturned = exitProceeds
  }

  return {
    year,
    occupancy,
    grossRevenue,
    totalExpenses,
    noi,
    debtService,
    cashFlow,
    isRefiYear,
    refiLoanAmount,
    refiDistribution,
    isExitYear,
    exitSalePrice,
    exitProceeds,
    capitalReturned,
  }
}

/**
 * Generate full proforma for all years
 */
export function generateProforma(
  assumptions: ProformaAssumptions
): { years: ProformaYear[]; metrics: ProformaMetrics } {
  const years: ProformaYear[] = []

  for (let year = 1; year <= assumptions.holdYears; year++) {
    const previousYear = year > 1 ? years[year - 2] : null
    const yearData = calculateProformaYear(year, assumptions, previousYear)
    years.push(yearData)
  }

  // Calculate metrics
  const equityInvested = assumptions.purchasePrice * assumptions.downPaymentPct

  const totalOperatingCashFlow = years.reduce((sum, year) => sum + year.cashFlow, 0)

  const refiDistribution = years.find((y) => y.isRefiYear)?.refiDistribution || 0

  const exitProceeds = years.find((y) => y.isExitYear)?.exitProceeds || 0

  const totalDistributions = totalOperatingCashFlow + refiDistribution + exitProceeds

  const equityMultiple = equityInvested > 0 ? totalDistributions / equityInvested : 0

  // Calculate IRR
  const cashFlows = years.map((year) => {
    let cf = year.cashFlow
    if (year.refiDistribution) cf += year.refiDistribution
    if (year.exitProceeds) cf += year.exitProceeds
    return cf
  })
  const irr = calculateIRR([-equityInvested, ...cashFlows])

  const averageCashOnCash =
    equityInvested > 0 ? totalOperatingCashFlow / assumptions.holdYears / equityInvested : 0

  return {
    years,
    metrics: {
      totalEquityInvested: equityInvested,
      totalDistributions,
      totalOperatingCashFlow,
      refiDistribution,
      exitProceeds,
      equityMultiple,
      irr,
      averageCashOnCash,
    },
  }
}

/**
 * Calculate IRR using Newton's method
 * Returns IRR as a decimal (e.g., 0.15 for 15%)
 */
export function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
  const maxIterations = 100
  const tolerance = 0.00001

  let rate = guess

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0
    let dnpv = 0

    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t)
      dnpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1)
    }

    const newRate = rate - npv / dnpv

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate
    }

    rate = newRate
  }

  // If didn't converge, return the last estimate
  return rate
}

/**
 * Calculate equity multiple
 */
export function calculateEquityMultiple(
  totalDistributions: number,
  totalInvested: number
): number {
  if (totalInvested === 0) return 0
  return totalDistributions / totalInvested
}
