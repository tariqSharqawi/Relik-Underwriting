import { notFound } from 'next/navigation'
import { TabsContent } from '@/components/ui/tabs'
import { getDealById } from '@/lib/db/deals'
import { getT12Totals } from '@/lib/db/t12'
import { ProformaContainer } from '@/components/proforma/proforma-container'
import { getDefaultProformaAssumptions } from '@/lib/ai/proforma-generation'

interface ProformaPageProps {
  params: Promise<{ id: string }>
}

export default async function ProformaPage({ params }: ProformaPageProps) {
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

  const t12Totals = await getT12Totals(dealId)

  // Calculate current metrics
  const currentNOI = t12Totals.totalNOI || deal.noi_current || 0
  const currentOccupancy = t12Totals.avgOccupancy || 0.85
  const purchasePrice = deal.asking_price || 0
  const purchaseCapRate =
    purchasePrice > 0 && currentNOI > 0 ? currentNOI / purchasePrice : 0.08

  // Get default assumptions
  const defaultAssumptions = getDefaultProformaAssumptions(
    currentOccupancy,
    purchaseCapRate
  )

  return (
    <TabsContent value="proforma" className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Proforma Projections</h2>
        <p className="mt-2 text-muted-foreground">
          Multi-year financial projections and return analysis
        </p>
      </div>

      <ProformaContainer
        dealId={dealId}
        deal={deal}
        currentNOI={currentNOI}
        currentOccupancy={currentOccupancy}
        defaultAssumptions={defaultAssumptions}
      />
    </TabsContent>
  )
}
