import { notFound } from 'next/navigation'
import { TabsContent } from '@/components/ui/tabs'
import { getDealById } from '@/lib/db/deals'
import { AnalysisContainer } from '@/components/analysis/analysis-container'

interface AnalysisPageProps {
  params: Promise<{ id: string }>
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
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
    <TabsContent value="analysis" className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">AI Analysis</h2>
        <p className="mt-2 text-muted-foreground">
          Risk assessment, investment memo, and interactive analysis
        </p>
      </div>

      <AnalysisContainer dealId={dealId} dealName={deal.name} />
    </TabsContent>
  )
}
