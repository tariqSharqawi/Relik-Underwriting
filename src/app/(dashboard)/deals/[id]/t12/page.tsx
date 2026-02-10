import { notFound } from 'next/navigation'
import { TabsContent } from '@/components/ui/tabs'
import { getDealById } from '@/lib/db/deals'
import { getT12Data } from '@/lib/db/t12'
import { getUnitMix } from '@/lib/db/unit-mix'
import { T12Container } from '@/components/t12/t12-container'
import type { T12Month } from '@/lib/calculations/t12'

interface T12PageProps {
  params: Promise<{ id: string }>
}

export default async function T12Page({ params }: T12PageProps) {
  const { id } = await params
  const dealId = parseInt(id)

  if (isNaN(dealId)) {
    notFound()
  }

  let deal
  try {
    deal = await getDealById(dealId)
  } catch (error) {
    notFound()
  }

  const totalUnits = deal.total_units || 0

  // Fetch T12 data and map DB rows (snake_case) to component types (camelCase)
  const t12DbData = await getT12Data(dealId)
  const t12Data: T12Month[] = t12DbData.map((row) => {
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
      totalExpenses:
        payroll + dietary + utilities + insurance + managementFee +
        maintenance + marketing + admin + otherExpenses,
      noi:
        roomRent + locFees + otherIncome -
        (payroll + dietary + utilities + insurance + managementFee +
          maintenance + marketing + admin + otherExpenses),
    }
  })

  // Fetch unit mix data and map to camelCase
  const unitMixDbData = await getUnitMix(dealId)
  const unitMixData = unitMixDbData.map((row) => ({
    id: row.id,
    unitType: row.unit_type,
    unitCount: row.unit_count,
    currentRent: Number(row.current_rent) || 0,
    marketRent: Number(row.market_rent) || 0,
    avgLocFee: Number(row.avg_loc_fee) || 0,
  }))

  return (
    <TabsContent value="t12" className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">T12 Financials</h2>
        <p className="mt-2 text-muted-foreground">
          Trailing 12-month financial data and unit mix analysis
        </p>
      </div>

      <T12Container
        dealId={dealId}
        totalUnits={totalUnits}
        initialT12Data={t12Data}
        initialUnitMixData={unitMixData}
      />
    </TabsContent>
  )
}
