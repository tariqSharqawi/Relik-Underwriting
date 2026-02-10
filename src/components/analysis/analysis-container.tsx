'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RiskScoreGauge } from '@/components/ai/risk-score-gauge'
import { RiskDimensionCard } from '@/components/ai/risk-dimension-card'
import { MemoPreview } from '@/components/ai/memo-preview'
import { AnalysisChat } from '@/components/ai/analysis-chat'
import { Sparkles, FileText, MessageSquare } from 'lucide-react'
import {
  runRiskAssessmentAction,
  generateMemoAction,
  sendChatMessageAction,
} from '@/app/actions/analysis'
import type { RiskAssessment } from '@/lib/ai/risk-assessment'
import type { InvestmentMemo } from '@/lib/ai/memo-generation'
import type { ChatMessage } from '@/lib/ai/chat'

interface AnalysisContainerProps {
  dealId: number
  dealName: string
}

export function AnalysisContainer({ dealId, dealName }: AnalysisContainerProps) {
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null)
  const [memo, setMemo] = useState<InvestmentMemo | null>(null)
  const [isLoadingRisk, setIsLoadingRisk] = useState(false)
  const [isLoadingMemo, setIsLoadingMemo] = useState(false)

  const handleRunRiskAssessment = async () => {
    setIsLoadingRisk(true)
    try {
      const result = await runRiskAssessmentAction(dealId)

      if (result.success) {
        setRiskAssessment(result.result!)
        toast.success('Risk assessment complete!')
      } else {
        toast.error(result.error || 'Failed to assess risk')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error('Risk assessment error:', error)
    } finally {
      setIsLoadingRisk(false)
    }
  }

  const handleGenerateMemo = async () => {
    setIsLoadingMemo(true)
    try {
      const result = await generateMemoAction(dealId)

      if (result.success) {
        setMemo(result.result!)
        toast.success('Investment memo generated!')
      } else {
        toast.error(result.error || 'Failed to generate memo')
      }
    } catch (error) {
      toast.error('An error occurred')
      console.error('Memo generation error:', error)
    } finally {
      setIsLoadingMemo(false)
    }
  }

  const handleSendChatMessage = async (
    message: string,
    history: ChatMessage[]
  ): Promise<string> => {
    const result = await sendChatMessageAction(dealId, message, history)

    if (!result.success) {
      throw new Error(result.error || 'Failed to send message')
    }

    return result.response!
  }

  return (
    <Tabs defaultValue="risk" className="space-y-6">
      <TabsList>
        <TabsTrigger value="risk">
          <Sparkles className="mr-2 h-4 w-4" />
          Risk Assessment
        </TabsTrigger>
        <TabsTrigger value="memo">
          <FileText className="mr-2 h-4 w-4" />
          Investment Memo
        </TabsTrigger>
        <TabsTrigger value="chat">
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat
        </TabsTrigger>
      </TabsList>

      <TabsContent value="risk" className="space-y-6">
        {!riskAssessment && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No risk assessment yet. Generate one to see comprehensive risk analysis.
              </p>
              <Button onClick={handleRunRiskAssessment} disabled={isLoadingRisk}>
                {isLoadingRisk ? 'Analyzing...' : 'Generate Risk Assessment'}
              </Button>
            </CardContent>
          </Card>
        )}

        {riskAssessment && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-semibold">Risk Analysis</h3>
              <Button
                variant="outline"
                onClick={handleRunRiskAssessment}
                disabled={isLoadingRisk}
              >
                {isLoadingRisk ? 'Regenerating...' : 'Regenerate Assessment'}
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6 flex justify-center">
                <RiskScoreGauge score={riskAssessment.overallScore} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {riskAssessment.dimensions.map((dimension, index) => (
                <RiskDimensionCard key={index} dimension={dimension} />
              ))}
            </div>

            {riskAssessment.topMitigants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Risk Mitigants</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {riskAssessment.topMitigants.map((mitigant, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm">{mitigant}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {riskAssessment.dealBreakers.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-900">Deal Breakers</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {riskAssessment.dealBreakers.map((breaker, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        <span className="text-sm text-red-900">{breaker}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{riskAssessment.summary}</p>
              </CardContent>
            </Card>
          </>
        )}
      </TabsContent>

      <TabsContent value="memo" className="space-y-6">
        {!memo && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No investment memo yet. Generate one to create an investor-ready document.
              </p>
              <Button onClick={handleGenerateMemo} disabled={isLoadingMemo}>
                {isLoadingMemo ? 'Generating...' : 'Generate Investment Memo'}
              </Button>
            </CardContent>
          </Card>
        )}

        {memo && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-semibold">Investment Memorandum</h3>
              <Button
                variant="outline"
                onClick={handleGenerateMemo}
                disabled={isLoadingMemo}
              >
                {isLoadingMemo ? 'Regenerating...' : 'Regenerate Memo'}
              </Button>
            </div>

            <MemoPreview memo={memo} dealName={dealName} />
          </>
        )}
      </TabsContent>

      <TabsContent value="chat">
        <AnalysisChat dealName={dealName} onSendMessage={handleSendChatMessage} />
      </TabsContent>
    </Tabs>
  )
}
