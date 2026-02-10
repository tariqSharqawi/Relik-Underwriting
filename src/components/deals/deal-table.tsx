import Link from 'next/link'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DealStatusBadge } from './deal-status-badge'
import { DeleteDealButton } from './delete-deal-button'
import { Eye, Pencil } from 'lucide-react'
import type { Database } from '@/types/supabase'
import type { DealStatus, PropertyType } from '@/lib/validations/deal'

type Deal = Database['public']['Tables']['deals']['Row']

interface DealTableProps {
  deals: Deal[]
}

const propertyTypeLabels: Record<PropertyType, string> = {
  assisted_living: 'Assisted Living',
  memory_care: 'Memory Care',
  independent_living: 'Independent Living',
  mixed: 'Mixed',
}

export function DealTable({ deals }: DealTableProps) {
  if (deals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No deals found</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Units</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => {
            const location = [deal.city, deal.state].filter(Boolean).join(', ') || '—'
            const propertyType = deal.property_type
              ? propertyTypeLabels[deal.property_type as PropertyType]
              : '—'

            return (
              <TableRow key={deal.id}>
                <TableCell className="font-medium">{deal.name}</TableCell>
                <TableCell>{location}</TableCell>
                <TableCell>{propertyType}</TableCell>
                <TableCell className="text-right font-mono">
                  {deal.total_units || '—'}
                </TableCell>
                <TableCell>
                  <DealStatusBadge status={deal.status as DealStatus} />
                </TableCell>
                <TableCell>
                  {format(new Date(deal.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <Link href={`/deals/${deal.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <Link href={`/deals/${deal.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteDealButton
                      dealId={deal.id}
                      dealName={deal.name}
                      variant="icon"
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
