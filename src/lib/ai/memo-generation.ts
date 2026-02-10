import * as z from 'zod'
import { createAnthropicClient, AI_MODEL, AI_MAX_TOKENS } from './client'
import { logAIAnalysis } from './logging'

const investmentMemoSchema = z.object({
  executiveSummary: z.string(),
  propertyOverview: z.string(),
  financialSummary: z.string(),
  proformaAndReturns: z.string(),
  feeStructure: z.string(),
  riskFactors: z.string(),
  recommendation: z.string(),
})

export type InvestmentMemo = z.infer<typeof investmentMemoSchema>

interface MemoGenerationInput {
  dealId: number
  dealName: string
  city?: string
  state?: string
  propertyType?: string
  totalUnits?: number
  licensedBeds?: number
  askingPrice?: number
  purchaseCapRate?: number
  currentOccupancy?: number
  currentExpenseRatio?: number
  t12Summary?: {
    grossRevenue: number
    totalExpenses: number
    noi: number
  }
  proformaMetrics?: {
    equityMultiple: number
    irr: number
    totalDistributions: number
    totalInvested: number
  }
  riskScore?: number
  recommendation?: string
}

function buildMemoGenerationPrompt(input: MemoGenerationInput): string {
  const location = [input.city, input.state].filter(Boolean).join(', ') || 'Location TBD'

  return `You are an investment analyst for Relik Capital Group preparing an investor-ready investment memorandum.

Generate a professional investment memo for this senior living acquisition:

Property: ${input.dealName}
Location: ${location}
Type: ${input.propertyType || 'Senior Living'}
Units: ${input.totalUnits || 'N/A'} | Licensed Beds: ${input.licensedBeds || 'N/A'}
Asking Price: ${input.askingPrice ? `$${input.askingPrice.toLocaleString()}` : 'TBD'}

${input.purchaseCapRate ? `Purchase Cap Rate: ${(input.purchaseCapRate * 100).toFixed(2)}%` : ''}
${input.currentOccupancy ? `Current Occupancy: ${(input.currentOccupancy * 100).toFixed(1)}%` : ''}

${input.t12Summary ? `
T12 Performance:
- Gross Revenue: $${input.t12Summary.grossRevenue.toLocaleString()}
- Total Expenses: $${input.t12Summary.totalExpenses.toLocaleString()}
- NOI: $${input.t12Summary.noi.toLocaleString()}
` : ''}

${input.proformaMetrics ? `
Projected Returns:
- Equity Multiple: ${input.proformaMetrics.equityMultiple.toFixed(2)}x
- IRR: ${(input.proformaMetrics.irr * 100).toFixed(2)}%
- Total Distributions: $${input.proformaMetrics.totalDistributions.toLocaleString()}
- Total Invested: $${input.proformaMetrics.totalInvested.toLocaleString()}
` : ''}

${input.riskScore ? `Risk Score: ${input.riskScore}/10` : ''}
${input.recommendation ? `Underwriting Recommendation: ${input.recommendation}` : ''}

Generate a comprehensive investment memorandum with the following sections:

1. **Executive Summary** (2-3 paragraphs)
   - Investment thesis
   - Key deal highlights
   - Expected returns summary

2. **Property Overview** (2-3 paragraphs)
   - Location and market context
   - Property description
   - Current operations and positioning

3. **Financial Summary** (2-3 paragraphs)
   - T12 performance analysis
   - Revenue and expense breakdown
   - NOI and cap rate discussion

4. **Proforma and Returns** (2-3 paragraphs)
   - Projected performance over hold period
   - Return metrics (equity multiple, IRR, cash-on-cash)
   - Refi and exit strategy

5. **Fee Structure** (1-2 paragraphs)
   - Acquisition fee (2% of purchase price)
   - Asset management fee (2% of gross revenue annually)
   - Refinance fee (1% of loan amount)
   - Disposition fee (2% of sale price)

6. **Risk Factors** (2-3 paragraphs)
   - Key risks identified
   - Mitigation strategies
   - Market and operational considerations

7. **Recommendation** (1-2 paragraphs)
   - Investment committee recommendation
   - Deal fit with fund strategy
   - Next steps

Write in a professional, investor-friendly tone. Be specific with numbers and data points. Maintain conservative underwriting standards consistent with Relik Capital Group's approach.

Response format (JSON only, no markdown):
{
  "executiveSummary": "string (2-3 paragraphs)",
  "propertyOverview": "string (2-3 paragraphs)",
  "financialSummary": "string (2-3 paragraphs)",
  "proformaAndReturns": "string (2-3 paragraphs)",
  "feeStructure": "string (1-2 paragraphs)",
  "riskFactors": "string (2-3 paragraphs)",
  "recommendation": "string (1-2 paragraphs)"
}`
}

export async function generateMemo(input: MemoGenerationInput): Promise<InvestmentMemo> {
  const client = createAnthropicClient()
  const prompt = buildMemoGenerationPrompt(input)

  const message = await client.messages.create({
    model: AI_MODEL,
    max_tokens: AI_MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  // Extract text from response
  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : ''

  // Remove markdown code blocks if present
  const jsonText = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  // Parse and validate
  let parsed
  try {
    parsed = JSON.parse(jsonText)
  } catch (error) {
    throw new Error('Failed to parse AI response as JSON')
  }

  const result = investmentMemoSchema.parse(parsed)

  // Log the analysis
  await logAIAnalysis({
    dealId: input.dealId,
    analysisType: 'investment_memo',
    prompt,
    response: JSON.stringify(result),
    model: AI_MODEL,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  })

  return result
}
