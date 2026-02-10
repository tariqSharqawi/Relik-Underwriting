import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { getDeals, getDealsByStatus } from '@/lib/db/deals'
import { DealCard } from '@/components/deals/deal-card'
import { DealTable } from '@/components/deals/deal-table'

export default async function DealsPage() {
  const [allDeals, napkinDeals, underwritingDeals, contractDeals, closedDeals, passedDeals] =
    await Promise.all([
      getDeals(),
      getDealsByStatus('napkin'),
      getDealsByStatus('underwriting'),
      getDealsByStatus('under_contract'),
      getDealsByStatus('closed'),
      getDealsByStatus('passed'),
    ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Deals</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your real estate investment opportunities
          </p>
        </div>
        <Button asChild>
          <Link href="/deals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All <span className="ml-2 text-muted-foreground">({allDeals.length})</span>
          </TabsTrigger>
          <TabsTrigger value="napkin">
            Napkin <span className="ml-2 text-muted-foreground">({napkinDeals.length})</span>
          </TabsTrigger>
          <TabsTrigger value="underwriting">
            Underwriting <span className="ml-2 text-muted-foreground">({underwritingDeals.length})</span>
          </TabsTrigger>
          <TabsTrigger value="contract">
            Under Contract <span className="ml-2 text-muted-foreground">({contractDeals.length})</span>
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed <span className="ml-2 text-muted-foreground">({closedDeals.length})</span>
          </TabsTrigger>
          <TabsTrigger value="passed">
            Passed <span className="ml-2 text-muted-foreground">({passedDeals.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {allDeals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <p className="text-muted-foreground mb-4">No deals yet</p>
              <Button asChild>
                <Link href="/deals/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Deal
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allDeals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
              <div className="pt-6">
                <h3 className="text-lg font-heading font-semibold mb-4">Table View</h3>
                <DealTable deals={allDeals} />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="napkin">
          {napkinDeals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No napkin deals</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {napkinDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="underwriting">
          {underwritingDeals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No deals in underwriting</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {underwritingDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contract">
          {contractDeals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No deals under contract</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contractDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed">
          {closedDeals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No closed deals</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {closedDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="passed">
          {passedDeals.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No passed deals</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {passedDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
