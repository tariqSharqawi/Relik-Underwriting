import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDealById } from '@/lib/db/deals'
import { EditDealForm } from '@/components/forms/edit-deal-form'

interface EditDealPageProps {
  params: Promise<{ id: string }>
}

export default async function EditDealPage({ params }: EditDealPageProps) {
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
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/deals/${id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Deal
          </Link>
        </Button>
        <h1 className="text-3xl font-heading font-bold">Edit Deal</h1>
        <p className="mt-2 text-muted-foreground">
          Update the details for {deal.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deal Information</CardTitle>
          <CardDescription>
            Modify the property details and loan assumptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditDealForm deal={deal} />
        </CardContent>
      </Card>
    </div>
  )
}
