import { notFound } from 'next/navigation'
import { TabsContent } from '@/components/ui/tabs'
import { getDealById } from '@/lib/db/deals'
import { NapkinAnalysisContainer } from '@/components/napkin/napkin-analysis-container'

interface NapkinPageProps {
  params: Promise<{ id: string }>
}

export default async function NapkinPage({ params }: NapkinPageProps) {
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
    <TabsContent value="napkin" className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Seven-Minute Napkin Analysis</h2>
        <p className="mt-2 text-muted-foreground">
          Quick assessment to determine if this deal is worth pursuing
        </p>
      </div>

      <NapkinAnalysisContainer deal={deal} />
    </TabsContent>
  )
}
