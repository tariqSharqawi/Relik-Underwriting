import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import {
  NapkinPDFDocument,
  FullUnderwritingPDFDocument,
  InvestmentMemoPDFDocument,
} from '@/lib/export/pdf'
import { getDealById } from '@/lib/db/deals'
import { getT12Data, getT12Totals } from '@/lib/db/t12'
import { getProforma } from '@/lib/db/proforma'
import { generateProforma } from '@/lib/calculations/proforma'
import type { NapkinAnalysisResult } from '@/components/napkin/napkin-analysis-container'
import type { RiskAssessment } from '@/lib/ai/risk-assessment'
import type { InvestmentMemo } from '@/lib/ai/memo-generation'

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
        const t12Data = await getT12Data(dealId)
        const t12Totals = await getT12Totals(dealId)

        if (t12Data.length === 0) {
          return NextResponse.json(
            { error: 'No T12 data available for this deal' },
            { status: 400 }
          )
        }

        let proformaYears = await getProforma(dealId)

        // If no proforma saved, generate default
        if (proformaYears.length === 0) {
          const defaultAssumptions = {
            holdYears: 5,
            rentGrowth: 0.03,
            expenseInflation: 0.025,
            targetOccupancy: 0.93,
            occupancyRampYears: 2,
            refiYear: 2,
            refiInterestRate: Number(deal.interest_rate) || 0.08,
            exitYear: 5,
            exitCapRate:
              (Number(deal.cap_rate_purchase) || 0.065) + 0.01,
          }

          const proformaResult = generateProforma(
            deal,
            t12Totals,
            defaultAssumptions
          )
          proformaYears = proformaResult.years
        }

        const proformaMetrics = {
          totalEquityInvested:
            (Number(deal.asking_price) || 0) *
            (Number(deal.down_payment_percent) || 0.3),
          totalDistributions: proformaYears.reduce(
            (sum, year) =>
              sum + year.cashFlow + (year.capitalReturned || 0),
            0
          ),
          equityMultiple: 0, // Will be calculated
          irr: Number(deal.irr) || 0,
          averageCashOnCash: 0, // Will be calculated
        }

        const equity = proformaMetrics.totalEquityInvested
        proformaMetrics.equityMultiple =
          equity > 0 ? proformaMetrics.totalDistributions / equity : 0
        proformaMetrics.averageCashOnCash =
          proformaYears.reduce(
            (sum, year) => sum + year.cashFlow / equity,
            0
          ) / proformaYears.length

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
