import { Badge } from '@/components/ui/badge'
import type { DealStatus } from '@/lib/validations/deal'

interface DealStatusBadgeProps {
  status: DealStatus
}

const statusConfig: Record<
  DealStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  napkin: { label: 'Napkin', variant: 'secondary' },
  underwriting: { label: 'Underwriting', variant: 'default' },
  under_contract: { label: 'Under Contract', variant: 'outline' },
  closed: { label: 'Closed', variant: 'default' },
  passed: { label: 'Passed', variant: 'destructive' },
}

export function DealStatusBadge({ status }: DealStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className="font-medium">
      {config.label}
    </Badge>
  )
}
