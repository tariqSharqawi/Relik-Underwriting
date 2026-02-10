import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DealForm } from '@/components/forms/deal-form'

export default function NewDealPage() {
  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/deals">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Deals
          </Link>
        </Button>
        <h1 className="text-3xl font-heading font-bold">Create New Deal</h1>
        <p className="mt-2 text-muted-foreground">
          Enter basic information about the property
        </p>
      </div>

      <div className="max-w-3xl">
        <DealForm />
      </div>
    </div>
  )
}
