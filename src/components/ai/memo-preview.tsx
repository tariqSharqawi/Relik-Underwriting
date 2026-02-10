'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Download, Edit, Eye } from 'lucide-react'
import type { InvestmentMemo } from '@/lib/ai/memo-generation'

interface MemoPreviewProps {
  memo: InvestmentMemo
  dealName: string
  onExport?: () => void
}

export function MemoPreview({ memo, dealName, onExport }: MemoPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedMemo, setEditedMemo] = useState(memo)

  const sections = [
    { title: 'Executive Summary', key: 'executiveSummary' as const },
    { title: 'Property Overview', key: 'propertyOverview' as const },
    { title: 'Financial Summary', key: 'financialSummary' as const },
    { title: 'Proforma and Returns', key: 'proformaAndReturns' as const },
    { title: 'Fee Structure', key: 'feeStructure' as const },
    { title: 'Risk Factors', key: 'riskFactors' as const },
    { title: 'Recommendation', key: 'recommendation' as const },
  ]

  const handleSectionEdit = (key: keyof InvestmentMemo, value: string) => {
    setEditedMemo((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-heading font-semibold">Investment Memorandum</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
          {onExport && (
            <Button size="sm" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-center text-2xl">{dealName}</CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-1">
            Investment Memorandum
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {sections.map((section) => (
            <div key={section.key} className="space-y-2">
              <h4 className="text-lg font-heading font-semibold border-b pb-2">
                {section.title}
              </h4>
              {isEditing ? (
                <Textarea
                  value={editedMemo[section.key]}
                  onChange={(e) => handleSectionEdit(section.key, e.target.value)}
                  rows={6}
                  className="font-body text-sm leading-relaxed"
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  {editedMemo[section.key].split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-sm leading-relaxed mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Generated with AI • Review and verify all information before sharing with investors
      </div>
    </div>
  )
}
