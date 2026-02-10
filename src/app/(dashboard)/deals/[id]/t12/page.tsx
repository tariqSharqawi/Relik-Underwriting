import { notFound } from 'next/navigation'
import { TabsContent } from '@/components/ui/tabs'
import { getDealById } from '@/lib/db/deals'
import { T12Container } from '@/components/t12/t12-container'

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

  return (
    <TabsContent value="t12" className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">T12 Financials</h2>
        <p className="mt-2 text-muted-foreground">
          Trailing 12-month financial data and unit mix analysis
        </p>
      </div>

      <T12Container dealId={dealId} totalUnits={deal.total_units || 0} />
    </TabsContent>
  )
}
