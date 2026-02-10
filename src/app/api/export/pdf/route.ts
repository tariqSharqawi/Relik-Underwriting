import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import {
  NapkinPDFDocument,
  FullUnderwritingPDFDocument,
  InvestmentMemoPDFDocument,
} from '@/lib/export/pdf'
import { getDealById } from '@/lib/db/deals'
import { getT12Data } from '@/lib/db/t12'
import { getProforma } from '@/lib/db/proforma'
import { generateProforma, type ProformaYear, type ProformaMetrics } from '@/lib/calculations/proforma'
import { calculateT12Totals, type T12Month } from '@/lib/calculations/t12'
import type { NapkinAnalysisResult } from '@/components/napkin/napkin-analysis-container'
import type { RiskAssessment } from '@/lib/ai/risk-assessment'
import type { InvestmentMemo } from '@/lib/ai/memo-generation'
import type { T12Financial, ProformaRow } from '@/types/supabase'

/**
 * Map a DB T12 row to the calculation T12Month type
 */
function mapDbT12ToMonth(row: T12Financial, totalUnits: number): T12Month {
  const roomRent = Number(row.room_rent) || 0
  const locFees = Number(row.level_of_care_fees) || 0
  const otherIncome = Number(row.other_income) || 0
  const payroll = Number(row.payroll) || 0
  const dietary = Number(row.dietary) || 0
  const utilities = Number(row.utilities) || 0
  const insurance = Number(row.insurance) || 0
  const managementFee = Number(row.management_fee) || 0
  const maintenance = Number(row.maintenance) || 0
  const marketing = Number(row.marketing) || 0
  const admin = Number(row.admin) || 0
  const otherExpenses = Number(row.other_expenses) || 0
  const occupiedUnits = row.occupied_units || 0

  return {
    month: row.month,
    roomRent,
    locFees,
    otherIncome,
    grossRevenue: roomRent + locFees + otherIncome,
    occupiedUnits,
    totalUnits,
    occupancyRate: totalUnits > 0 ? occupiedUnits / totalUnits : 0,
    payroll,
    dietary,
    utilities,
    insurance,
    managementFee,
    maintenance,
    marketing,
    admin,
    otherExpenses,
    totalExpenses: payroll + dietary + utilities + insurance + managementFee + maintenance + marketing + admin + otherExpenses,
    noi: (roomRent + locFees + otherIncome) - (payroll + dietary + utilities + insurance + managementFee + maintenance + marketing + admin + otherExpenses),
  }
}

/**
 * Map DB proforma rows to calculation ProformaYear type
 */
function mapDbProformaToYear(row: ProformaRow): ProformaYear {
  return {
    year: row.year,
    occupancy: Number(row.target_occupancy) || 0,
    grossRevenue: Number(row.projected_revenue) || 0,
    totalExpenses: Number(row.projected_expenses) || 0,
    noi: Number(row.projected_noi) || 0,
    debtService: Number(row.debt_service) || 0,
    cashFlow: Number(row.cash_flow) || 0,
    isRefiYear: row.is_refi_year || false,
    refiLoanAmount: Number(row.refi_loan_amount) || null,
    refiDistribution: null,
    isExitYear: row.is_exit_year || false,
    exitSalePrice: Number(row.exit_sale_price) || null,
    exitProceeds: null,
    capitalReturned: Number(row.capital_returned) || null,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealId, type, data } = body

    if (!dealId || !type) {
      return NextResponse.json(
        { error: 'dealId and type are required' },
        { status: 400 }
      )
    }

    const deal = await getDealById(dealId)

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const totalUnits = deal.total_units || 0

    let pdfBuffer: Buffer

    switch (type) {
      case 'napkin': {
        if (!data || !data.analysis) {
          return NextResponse.json(
            { error: 'Napkin analysis data is required' },
            { status: 400 }
          )
        }
        const analysis = data.analysis as NapkinAnalysisResult
        pdfBuffer = await renderToBuffer(
          NapkinPDFDocument({ deal, analysis })
        )
        break
      }

      case 'full': {
        const t12DbData = await getT12Data(dealId)

        if (t12DbData.length === 0) {
          return NextResponse.json(
            { error: 'No T12 data available for this deal' },
            { status: 400 }
          )
        }

        const t12Data = t12DbData.map((row) => mapDbT12ToMonth(row, totalUnits))
        const t12Totals = calculateT12Totals(t12Data)

        const dbProforma = await getProforma(dealId)
        let proformaYears: ProformaYear[]

        if (dbProforma.length === 0) {
          const currentNOI = t12Totals.totalNOI
          const purchasePrice = Number(deal.asking_price) || 0
          const purchaseCapRate = purchasePrice > 0 ? currentNOI / purchasePrice : 0.065

          const proformaResult = generateProforma({
            currentNOI,
            currentOccupancy: t12Totals.avgOccupancyRate || 0.85,
            purchasePrice,
            downPaymentPct: Number(deal.down_payment_pct) || 0.3,
            interestRate: Number(deal.interest_rate) || 0.08,
            loanTermYears: deal.loan_term_years || 25,
            annualRentGrowth: 0.03,
            annualExpenseInflation: 0.025,
            targetOccupancy: 0.93,
            occupancyRampYears: 2,
            holdYears: 5,
            refiYear: 2,
            refiInterestRate: Number(deal.interest_rate) || 0.08,
            refiLoanToValue: 0.75,
            exitYear: 5,
            exitCapRate: purchaseCapRate + 0.01,
            acquisitionFeePct: 0.02,
            assetMgmtFeePct: 0.02,
            refiFeePct: 0.01,
            exitFeePct: 0.02,
          })
          proformaYears = proformaResult.years
        } else {
          proformaYears = dbProforma.map(mapDbProformaToYear)
        }

        const equity =
          (Number(deal.asking_price) || 0) *
          (Number(deal.down_payment_pct) || 0.3)

        const totalDistributions = proformaYears.reduce(
          (sum, year) =>
            sum + year.cashFlow + (year.capitalReturned || 0),
          0
        )

        const proformaMetrics: ProformaMetrics = {
          totalEquityInvested: equity,
          totalDistributions,
          totalOperatingCashFlow: proformaYears.reduce((sum, y) => sum + y.cashFlow, 0),
          refiDistribution: proformaYears.find((y) => y.isRefiYear)?.refiDistribution || 0,
          exitProceeds: proformaYears.find((y) => y.isExitYear)?.exitProceeds || 0,
          equityMultiple: equity > 0 ? totalDistributions / equity : 0,
          irr: Number(deal.irr) || 0,
          averageCashOnCash:
            equity > 0
              ? proformaYears.reduce((sum, year) => sum + year.cashFlow / equity, 0) /
                proformaYears.length
              : 0,
        }

        const riskAssessment =
          data?.riskAssessment as RiskAssessment | undefined
        const napkin =
          data?.napkin as NapkinAnalysisResult | undefined

        pdfBuffer = await renderToBuffer(
          FullUnderwritingPDFDocument({
            deal,
            napkin,
            t12Data,
            t12Totals,
            proformaYears,
            proformaMetrics,
            riskAssessment,
          })
        )
        break
      }

      case 'memo': {
        if (!data || !data.memo) {
          return NextResponse.json(
            { error: 'Investment memo data is required' },
            { status: 400 }
          )
        }
        const memo = data.memo as InvestmentMemo
        pdfBuffer = await renderToBuffer(
          InvestmentMemoPDFDocument({ deal, memo })
        )
        break
      }

      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        )
    }

    const fileName = `${deal.name.replace(/[^a-zA-Z0-9]/g, '_')}_${type}_${
      new Date().toISOString().split('T')[0]
    }.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
