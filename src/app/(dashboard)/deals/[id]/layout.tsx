import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DealStatusBadge } from '@/components/deals/deal-status-badge'
import { getDealById } from '@/lib/db/deals'
import type { DealStatus } from '@/lib/validations/deal'

interface DealLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function DealLayout({ children, params }: DealLayoutProps) {
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

  const location = [deal.city, deal.state].filter(Boolean).join(', ') || 'Location TBD'

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/deals">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Deals
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">{deal.name}</h1>
            <p className="mt-2 text-muted-foreground">{location}</p>
          </div>
          <DealStatusBadge status={deal.status as DealStatus} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" asChild>
            <Link href={`/deals/${id}`}>Overview</Link>
          </TabsTrigger>
          <TabsTrigger value="napkin" asChild>
            <Link href={`/deals/${id}/napkin`}>Napkin</Link>
          </TabsTrigger>
          <TabsTrigger value="t12" asChild>
            <Link href={`/deals/${id}/t12`}>T12</Link>
          </TabsTrigger>
          <TabsTrigger value="proforma" asChild>
            <Link href={`/deals/${id}/proforma`}>Proforma</Link>
          </TabsTrigger>
          <TabsTrigger value="analysis" asChild>
            <Link href={`/deals/${id}/analysis`}>Analysis</Link>
          </TabsTrigger>
          <TabsTrigger value="export" asChild>
            <Link href={`/deals/${id}/export`}>Export</Link>
          </TabsTrigger>
        </TabsList>

        {children}
      </Tabs>
    </div>
  )
}
