import { createAnthropicClient, AI_MODEL, AI_MAX_TOKENS } from './client'
import { logAIAnalysis } from './logging'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface DealContext {
  dealId: number
  dealName: string
  city?: string
  state?: string
  propertyType?: string
  totalUnits?: number
  askingPrice?: number
  currentNOI?: number
  currentOccupancy?: number
  expenseRatio?: number
  t12Summary?: string
  proformaMetrics?: string
  riskAssessment?: string
}

function buildChatSystemPrompt(context: DealContext): string {
  const location = [context.city, context.state].filter(Boolean).join(', ') || 'Location TBD'

  return `You are a senior real estate analyst for Relik Capital Group, providing analysis and answering questions about a specific senior living investment opportunity.

You have access to complete deal information and should provide detailed, data-driven responses.

DEAL CONTEXT:
Property: ${context.dealName}
Location: ${location}
Type: ${context.propertyType || 'Senior Living'}
Units: ${context.totalUnits || 'N/A'}
Asking Price: ${context.askingPrice ? `$${context.askingPrice.toLocaleString()}` : 'N/A'}
Current NOI: ${context.currentNOI ? `$${context.currentNOI.toLocaleString()}` : 'N/A'}
Occupancy: ${context.currentOccupancy ? `${(context.currentOccupancy * 100).toFixed(1)}%` : 'N/A'}
Expense Ratio: ${context.expenseRatio ? `${(context.expenseRatio * 100).toFixed(1)}%` : 'N/A'}

${context.t12Summary || ''}

${context.proformaMetrics || ''}

${context.riskAssessment || ''}

INSTRUCTIONS:
- Answer questions specifically about this deal
- Cite numbers from the deal data when relevant
- If asked about scenarios or what-ifs, provide calculations
- Be concise but thorough (2-4 paragraphs typically)
- If you don't have enough data to answer accurately, say so
- Maintain professional, analytical tone consistent with Relik Capital Group
- Focus on conservative underwriting standards

When performing calculations:
- Show your work
- Use conservative assumptions
- Explain key assumptions
- Compare to market benchmarks where relevant`
}

export async function sendChatMessage(
  context: DealContext,
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  const client = createAnthropicClient()
  const systemPrompt = buildChatSystemPrompt(context)

  // Build message history
  const messages = [
    ...conversationHistory,
    { role: 'user' as const, content: userMessage },
  ]

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: AI_MAX_TOKENS,
    system: systemPrompt,
    messages,
  })

  const responseText =
    response.content[0].type === 'text' ? response.content[0].text : ''

  // Log the interaction
  await logAIAnalysis({
    dealId: context.dealId,
    analysisType: 'chat',
    prompt: `${systemPrompt}\n\nUser: ${userMessage}`,
    response: responseText,
    model: AI_MODEL,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  })

  return responseText
}
