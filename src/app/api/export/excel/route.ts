import { NextRequest, NextResponse } from 'next/server'
import {
  generateT12Excel,
  generateProformaExcel,
  generateCompleteExcel,
} from '@/lib/export/excel'
import { getDealById } from '@/lib/db/deals'
import { getT12Data, getT12Totals } from '@/lib/db/t12'
import { getProforma } from '@/lib/db/proforma'
import { generateProforma } from '@/lib/calculations/proforma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealId, type } = body

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

    let excelBuffer: ArrayBuffer
    let fileName: string

    switch (type) {
      case 't12': {
        const t12Data = await getT12Data(dealId)
        const t12Totals = await getT12Totals(dealId)

        if (t12Data.length === 0) {
          return NextResponse.json(
            { error: 'No T12 data available for this deal' },
            { status: 400 }
          )
        }

        excelBuffer = generateT12Excel(deal, t12Data, t12Totals)
        fileName = `${deal.name.replace(
          /[^a-zA-Z0-9]/g,
          '_'
        )}_T12_${new Date().toISOString().split('T')[0]}.xlsx`
        break
      }

      case 'proforma': {
        let proformaYears = await getProforma(dealId)

        if (proformaYears.length === 0) {
          // Generate default proforma if none exists
          const t12Totals = await getT12Totals(dealId)

          if (!t12Totals || t12Totals.totalGrossRevenue === 0) {
            return NextResponse.json(
              { error: 'No T12 data available to generate proforma' },
              { status: 400 }
            )
          }

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
          equityMultiple: 0,
          irr: Number(deal.irr) || 0,
          averageCashOnCash: 0,
        }

        const equity = proformaMetrics.totalEquityInvested
        proformaMetrics.equityMultiple =
          equity > 0 ? proformaMetrics.totalDistributions / equity : 0
        proformaMetrics.averageCashOnCash =
          proformaYears.reduce(
            (sum, year) => sum + year.cashFlow / equity,
            0
          ) / proformaYears.length

        excelBuffer = generateProformaExcel(
          deal,
          proformaYears,
          proformaMetrics
        )
        fileName = `${deal.name.replace(
          /[^a-zA-Z0-9]/g,
          '_'
        )}_Proforma_${new Date().toISOString().split('T')[0]}.xlsx`
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
          equityMultiple: 0,
          irr: Number(deal.irr) || 0,
          averageCashOnCash: 0,
        }

        const equity = proformaMetrics.totalEquityInvested
        proformaMetrics.equityMultiple =
          equity > 0 ? proformaMetrics.totalDistributions / equity : 0
        proformaMetrics.averageCashOnCash =
          proformaYears.reduce(
            (sum, year) => sum + year.cashFlow / equity,
            0
          ) / proformaYears.length

        excelBuffer = generateCompleteExcel(
          deal,
          t12Data,
          t12Totals,
          proformaYears,
          proformaMetrics
        )
        fileName = `${deal.name.replace(
          /[^a-zA-Z0-9]/g,
          '_'
        )}_Complete_${new Date().toISOString().split('T')[0]}.xlsx`
        break
      }

      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        )
    }

    return new NextResponse(Buffer.from(excelBuffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Excel export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    )
  }
}
