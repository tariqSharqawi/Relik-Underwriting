import { notFound } from 'next/navigation'
import { TabsContent } from '@/components/ui/tabs'
import { getDealById } from '@/lib/db/deals'
import { getComps } from '@/lib/db/comps'
import { CompsContainer } from '@/components/comps/comps-container'

interface CompsPageProps {
  params: Promise<{ id: string }>
}

export default async function CompsPage({ params }: CompsPageProps) {
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

  const existingComps = await getComps(dealId)

  return (
    <TabsContent value="comps" className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Comparable Sales</h2>
        <p className="mt-2 text-muted-foreground">
          Market comparables and pricing analysis
        </p>
      </div>

      <CompsContainer
        dealId={dealId}
        deal={deal}
        existingComps={existingComps}
      />
    </TabsContent>
  )
}
