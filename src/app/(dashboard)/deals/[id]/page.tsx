import { notFound } from 'next/navigation'
import { getDealById } from '@/lib/db/deals'
import { DealMetricsGrid } from '@/components/deals/deal-metrics-grid'
import { DeleteDealButton } from '@/components/deals/delete-deal-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DealPageProps {
  params: Promise<{ id: string }>
}

const propertyTypeLabels: Record<string, string> = {
  assisted_living: 'Assisted Living',
  memory_care: 'Memory Care',
  independent_living: 'Independent Living',
  mixed: 'Mixed',
}

function formatCurrency(value: number | null | undefined) {
  if (!value) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number | null | undefined) {
  if (!value) return 'N/A'
  return `${(value * 100).toFixed(2)}%`
}

export default async function DealPage({ params }: DealPageProps) {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-semibold">Key Metrics</h2>
        <DeleteDealButton dealId={deal.id} dealName={deal.name} variant="button" />
      </div>
      <section>
        <DealMetricsGrid deal={deal} />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Property Type</div>
              <div className="font-medium">
                {deal.property_type ? propertyTypeLabels[deal.property_type] : 'N/A'}
              </div>

              <div className="text-muted-foreground">Total Units</div>
              <div className="font-medium font-mono">{deal.total_units || 'N/A'}</div>

              <div className="text-muted-foreground">Licensed Beds</div>
              <div className="font-medium font-mono">{deal.licensed_beds || 'N/A'}</div>

              <div className="text-muted-foreground">Asking Price</div>
              <div className="font-medium font-mono">{formatCurrency(deal.asking_price)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Assumptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Down Payment</div>
              <div className="font-medium font-mono">{formatPercent(deal.down_payment_pct)}</div>

              <div className="text-muted-foreground">Interest Rate</div>
              <div className="font-medium font-mono">{formatPercent(deal.interest_rate)}</div>

              <div className="text-muted-foreground">Loan Term</div>
              <div className="font-medium font-mono">{deal.loan_term_years || 'N/A'} years</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {deal.ai_summary && (
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{deal.ai_summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
