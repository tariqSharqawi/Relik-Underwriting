import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getDealCount, getDealCountByStatus } from '@/lib/db/deals'

export default async function DashboardPage() {
  const [totalDeals, dealsByStatus] = await Promise.all([
    getDealCount(),
    getDealCountByStatus(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to the Relik Capital Underwriting Platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Deals
          </h3>
          <p className="mt-2 text-3xl font-bold font-mono">{totalDeals}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Active Underwriting
          </h3>
          <p className="mt-2 text-3xl font-bold font-mono">{dealsByStatus.underwriting}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Under Contract
          </h3>
          <p className="mt-2 text-3xl font-bold font-mono">{dealsByStatus.under_contract}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Closed Deals
          </h3>
          <p className="mt-2 text-3xl font-bold font-mono">{dealsByStatus.closed}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-heading font-semibold mb-4">Getting Started</h2>
        {totalDeals === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Start by creating your first deal to begin the underwriting process.
            </p>
            <Button asChild>
              <Link href="/deals/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Deal
              </Link>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            You have {totalDeals} deal{totalDeals !== 1 ? 's' : ''} in your pipeline.{' '}
            <Link href="/deals" className="text-primary hover:underline">
              View all deals
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
