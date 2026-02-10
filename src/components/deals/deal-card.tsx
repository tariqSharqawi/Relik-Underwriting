import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DealStatusBadge } from './deal-status-badge'
import type { Database } from '@/types/supabase'
import type { DealStatus } from '@/lib/validations/deal'

type Deal = Database['public']['Tables']['deals']['Row']

interface DealCardProps {
  deal: Deal
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

export function DealCard({ deal }: DealCardProps) {
  const location = [deal.city, deal.state].filter(Boolean).join(', ') || 'Location TBD'

  return (
    <Link href={`/deals/${deal.id}`}>
      <Card className="hover:border-accent transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{deal.name}</CardTitle>
            <DealStatusBadge status={deal.status as DealStatus} />
          </div>
          <p className="text-sm text-muted-foreground">{location}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Asking Price</p>
              <p className="font-mono font-medium">{formatCurrency(deal.asking_price)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Units</p>
              <p className="font-mono font-medium">{deal.total_units || 'N/A'}</p>
            </div>
            {deal.cap_rate_purchase && (
              <div>
                <p className="text-muted-foreground">Cap Rate</p>
                <p className="font-mono font-medium">
                  {(deal.cap_rate_purchase * 100).toFixed(2)}%
                </p>
              </div>
            )}
            {deal.max_offer_price && (
              <div>
                <p className="text-muted-foreground">Max Offer</p>
                <p className="font-mono font-medium">{formatCurrency(deal.max_offer_price)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
