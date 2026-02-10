import { getDealById } from '@/lib/db/deals'
import { getT12Totals } from '@/lib/db/t12'
import { getProforma } from '@/lib/db/proforma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExportButton } from '@/components/export/export-button'
import { FileText, FileSpreadsheet, Package } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dealId = parseInt(id)

  if (isNaN(dealId)) {
    redirect('/deals')
  }

  const deal = await getDealById(dealId)

  if (!deal) {
    redirect('/deals')
  }

  // Check what data is available
  const t12Totals = await getT12Totals(dealId)
  const proformaYears = await getProforma(dealId)

  const hasT12Data = t12Totals && t12Totals.totalGrossRevenue > 0
  const hasProformaData = proformaYears.length > 0
  const hasNapkinData = deal.cap_rate_purchase && deal.max_offer_price

  const exportOptions = [
    {
      title: 'Napkin Summary',
      description: 'Quick 1-page summary with key metrics and AI recommendation',
      icon: FileText,
      formats: ['PDF'],
      available: hasNapkinData,
      content: [
        'Property information',
        'Financial metrics (NOI, Cap Rate, Equity Multiple)',
        'AI analysis and recommendation',
        'Red flags and key assumptions',
      ],
    },
    {
      title: 'T12 Financials',
      description: 'Trailing 12-month financial data with charts and analysis',
      icon: FileSpreadsheet,
      formats: ['Excel'],
      available: hasT12Data,
      content: [
        'Month-by-month revenue and expenses',
        'Calculated totals and averages',
        'Occupancy tracking',
        'Expense breakdown by category',
      ],
    },
    {
      title: 'Proforma Projections',
      description: '5-10 year financial projections with returns analysis',
      icon: FileSpreadsheet,
      formats: ['Excel'],
      available: hasProformaData || hasT12Data,
      content: [
        'Year-by-year projections',
        'Cash flow analysis',
        'Refi and exit events',
        'IRR and equity multiple calculations',
      ],
    },
    {
      title: 'Full Underwriting Package',
      description: 'Comprehensive multi-page PDF with all analysis',
      icon: FileText,
      formats: ['PDF'],
      available: hasT12Data,
      content: [
        'Deal summary',
        'T12 financials',
        'Proforma projections',
        'Risk assessment (if available)',
        'Investment returns',
      ],
    },
    {
      title: 'Investment Memo',
      description: 'Investor-ready memo with AI-generated content',
      icon: FileText,
      formats: ['PDF'],
      available: deal.ai_summary !== null,
      content: [
        'Executive summary',
        'Property overview',
        'Financial analysis',
        'Risk factors',
        'Investment recommendation',
      ],
    },
    {
      title: 'Complete Package',
      description: 'Full Excel workbook with all deal data',
      icon: Package,
      formats: ['Excel'],
      available: hasT12Data,
      content: [
        'Deal summary sheet',
        'T12 financials',
        'Proforma projections',
        'Returns analysis',
        'Exportable formulas',
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Export</h1>
          <p className="text-muted-foreground mt-1">
            Download professional reports and data exports
          </p>
        </div>
        <ExportButton dealId={dealId} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {exportOptions.map((option, index) => {
          const Icon = option.icon
          return (
            <Card
              key={index}
              className={!option.available ? 'opacity-60' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#18312E]/10 p-2">
                      <Icon className="h-5 w-5 text-[#18312E]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {option.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Includes:</p>
                  <ul className="space-y-1">
                    {option.content.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start">
                        <span className="mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Formats:</span>
                  {option.formats.map((format, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-2 py-1 rounded bg-muted"
                    >
                      {format}
                    </span>
                  ))}
                </div>

                {!option.available && (
                  <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
                    ⚠ Complete required sections to enable this export
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p className="font-medium">Getting the most from your exports:</p>
            <ul className="space-y-1 text-muted-foreground ml-4">
              <li>• Complete the Napkin analysis before exporting summary PDFs</li>
              <li>• Enter full T12 data for accurate Excel exports with formulas</li>
              <li>• Generate the proforma to include 5-year projections in exports</li>
              <li>• Run the risk assessment before exporting the full underwriting PDF</li>
              <li>• Generate the investment memo for a polished investor presentation</li>
              <li>• Excel exports preserve formulas for easy customization</li>
              <li>• All exports are branded with Relik Capital Group identity</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
