/**
 * Loan calculation utilities for real estate financing
 */

export function calculateLoanAmount(purchasePrice: number, downPaymentPct: number): number {
  return purchasePrice * (1 - downPaymentPct)
}

export function calculateDownPayment(purchasePrice: number, downPaymentPct: number): number {
  return purchasePrice * downPaymentPct
}

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 12
  const numPayments = years * 12

  if (monthlyRate === 0) {
    return principal / numPayments
  }

  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)

  return payment
}

export function calculateAnnualDebtService(
  loanAmount: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualRate, termYears)
  return monthlyPayment * 12
}
