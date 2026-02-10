import { createServiceClient } from '@/lib/supabase/service'

export async function logAIAnalysis(params: {
  dealId: number
  analysisType: string
  prompt: string
  response: string
  model: string
  inputTokens: number
  outputTokens: number
}) {
  const supabase = createServiceClient()

  const { error } = await supabase.from('ai_analysis_log').insert({
    deal_id: params.dealId,
    analysis_type: params.analysisType,
    prompt: params.prompt,
    response: params.response,
    model: params.model,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
  })

  if (error) {
    console.error('Failed to log AI analysis:', error)
  }
}
