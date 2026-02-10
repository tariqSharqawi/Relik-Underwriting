'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { NapkinAnalysisResult } from '@/components/napkin/napkin-analysis-container'
import type { RiskAssessment } from '@/lib/ai/risk-assessment'
import type { InvestmentMemo } from '@/lib/ai/memo-generation'

interface ExportButtonProps {
  dealId: number
  exportData?: {
    napkin?: NapkinAnalysisResult
    riskAssessment?: RiskAssessment
    memo?: InvestmentMemo
  }
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportButton({
  dealId,
  exportData,
  variant = 'default',
  size = 'default',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportingType, setExportingType] = useState<string | null>(null)

  const handleExport = async (
    type: string,
    format: 'pdf' | 'excel',
    data?: Record<string, unknown>
  ) => {
    setIsExporting(true)
    setExportingType(`${type}-${format}`)

    try {
      const endpoint = format === 'pdf' ? '/api/export/pdf' : '/api/export/excel'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId,
          type,
          data,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : `export.${format === 'pdf' ? 'pdf' : 'xlsx'}`

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`${format.toUpperCase()} exported successfully`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to export')
    } finally {
      setIsExporting(false)
      setExportingType(null)
    }
  }

  const isLoading = (type: string, format: string) =>
    isExporting && exportingType === `${type}-${format}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {exportData?.napkin && (
          <>
            <DropdownMenuItem
              onClick={() =>
                handleExport('napkin', 'pdf', { analysis: exportData.napkin })
              }
              disabled={isLoading('napkin', 'pdf')}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isLoading('napkin', 'pdf') ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Exporting...
                </span>
              ) : (
                'Napkin Summary (PDF)'
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          onClick={() => handleExport('t12', 'excel')}
          disabled={isLoading('t12', 'excel')}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {isLoading('t12', 'excel') ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Exporting...
            </span>
          ) : (
            'T12 Data (Excel)'
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport('proforma', 'excel')}
          disabled={isLoading('proforma', 'excel')}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {isLoading('proforma', 'excel') ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Exporting...
            </span>
          ) : (
            'Proforma (Excel)'
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() =>
            handleExport('full', 'pdf', {
              napkin: exportData?.napkin,
              riskAssessment: exportData?.riskAssessment,
            })
          }
          disabled={isLoading('full', 'pdf')}
        >
          <FileText className="mr-2 h-4 w-4" />
          {isLoading('full', 'pdf') ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Exporting...
            </span>
          ) : (
            'Full Underwriting (PDF)'
          )}
        </DropdownMenuItem>

        {exportData?.memo && (
          <DropdownMenuItem
            onClick={() =>
              handleExport('memo', 'pdf', { memo: exportData.memo })
            }
            disabled={isLoading('memo', 'pdf')}
          >
            <FileText className="mr-2 h-4 w-4" />
            {isLoading('memo', 'pdf') ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Exporting...
              </span>
            ) : (
              'Investment Memo (PDF)'
            )}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => handleExport('full', 'excel')}
          disabled={isLoading('full', 'excel')}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {isLoading('full', 'excel') ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Exporting...
            </span>
          ) : (
            'Complete Package (Excel)'
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
