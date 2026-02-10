import { calculateAnnualDebtService } from './loan'

/**
 * Core financial calculations for napkin analysis
 */

export function calculateNOI(grossRevenue: number, totalExpenses: number): number {
  return grossRevenue - totalExpenses
}

export function calculateCapRate(noi: number, purchasePrice: number): number {
  if (purchasePrice === 0) return 0
  return noi / purchasePrice
}

export function calculateExpenseRatio(totalExpenses: number, grossRevenue: number): number {
  if (grossRevenue === 0) return 0
  return totalExpenses / grossRevenue
}

export function calculateCashFlow(noi: number, debtService: number): number {
  return noi - debtService
}

export function calculateCashOnCashReturn(
  cashFlow: number,
  equityInvested: number
): number {
  if (equityInvested === 0) return 0
  return cashFlow / equityInvested
}

export function calculateEquityMultiple(
  totalDistributions: number,
  totalInvested: number
): number {
  if (totalInvested === 0) return 0
  return totalDistributions / totalInvested
}

/**
 * Calculate maximum offer price based on target equity multiple
 * Assumes 5-year hold, refi at year 2, exit at year 5
 */
export function calculateMaxOfferPrice(params: {
  noi: number
  targetEquityMultiple: number
  downPaymentPct: number
  interestRate: number
  loanTermYears: number
  exitCapRate: number
  holdYears?: number
  refiYear?: number
}): number {
  const {
    noi,
    targetEquityMultiple,
    downPaymentPct,
    interestRate,
    loanTermYears,
    exitCapRate,
    holdYears = 5,
    refiYear = 2,
  } = params

  // Simplified calculation - work backwards from exit
  // This is a rough approximation; real calculation would need full proforma

  // Assume NOI grows at 2% per year
  const noiGrowthRate = 0.02
  const exitNOI = noi * Math.pow(1 + noiGrowthRate, holdYears)

  // Calculate exit value
  const exitValue = exitNOI / exitCapRate

  // Rough estimate of total cash distributions
  // Annual cash flow + refi return + exit proceeds
  const estimatedAnnualCashFlow = noi * 0.10 // Rough estimate of 10% of NOI
  const operatingCashFlow = estimatedAnnualCashFlow * holdYears

  // Target total return
  const targetTotalReturn = targetEquityMultiple

  // Work backwards to find max purchase price
  // This is a simplified approach
  let testPrice = noi / 0.08 // Start with 8% cap rate

  for (let i = 0; i < 20; i++) {
    const equity = testPrice * downPaymentPct
    const loanAmount = testPrice * (1 - downPaymentPct)
    const annualDebtService = calculateAnnualDebtService(loanAmount, interestRate, loanTermYears)
    const annualCashFlow = noi - annualDebtService

    // Estimate total distributions
    const totalCashFlow = annualCashFlow * holdYears
    const remainingLoan = loanAmount * 0.85 // Rough estimate after 5 years
    const exitProceeds = exitValue - remainingLoan
    const totalDistributions = totalCashFlow + exitProceeds

    const equityMultiple = totalDistributions / equity

    if (Math.abs(equityMultiple - targetEquityMultiple) < 0.1) {
      return testPrice
    }

    // Adjust test price
    if (equityMultiple > targetEquityMultiple) {
      testPrice *= 1.05
    } else {
      testPrice *= 0.95
    }
  }

  return testPrice
}
