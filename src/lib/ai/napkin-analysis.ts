import * as z from 'zod'
import { createAnthropicClient, AI_MODEL, AI_MAX_TOKENS } from './client'
import { logAIAnalysis } from './logging'

const napkinAnalysisResultSchema = z.object({
  capRate: z.number(),
  expenseRatio: z.number(),
  maxOfferPrice: z.number(),
  debtServiceAnnual: z.number(),
  cashOnCashReturn: z.number(),
  recommendation: z.enum(['strong_buy', 'buy', 'hold', 'pass', 'strong_pass']),
  confidence: z.number().min(1).max(10),
  summary: z.string(),
  redFlags: z.array(z.string()),
  keyAssumptions: z.array(z.string()),
})

export type NapkinAnalysisResult = z.infer<typeof napkinAnalysisResultSchema>

export interface NapkinAnalysisInput {
  dealId: number
  dealName: string
  city?: string
  state?: string
  propertyType?: string
  totalUnits?: number
  licensedBeds?: number
  askingPrice: number
  grossRevenue: number
  totalExpenses: number
  noi: number
  occupancy: number
  downPaymentPct: number
  interestRate: number
  loanTermYears: number
  acquisitionFeePct?: number
  assetMgmtFeePct?: number
}

function buildNapkinPrompt(input: NapkinAnalysisInput): string {
  const location = [input.city, input.state].filter(Boolean).join(', ') || 'Location TBD'

  return `You are a senior real estate underwriter for Relik Capital Group, specializing in senior living properties.

Analyze this deal for a quick go/no-go decision:

Property: ${input.dealName}
Location: ${location}
Type: ${input.propertyType || 'Not specified'}
Units: ${input.totalUnits || 'N/A'} | Licensed Beds: ${input.licensedBeds || 'N/A'}
Asking Price: $${input.askingPrice.toLocaleString()}

T12 Summary:
- Gross Revenue: $${input.grossRevenue.toLocaleString()}
- Total Expenses: $${input.totalExpenses.toLocaleString()}
- NOI: $${input.noi.toLocaleString()}
- Occupancy: ${input.occupancy}%

Loan Assumptions:
- Down Payment: ${(input.downPaymentPct * 100).toFixed(1)}%
- Interest Rate: ${(input.interestRate * 100).toFixed(2)}%
- Loan Term: ${input.loanTermYears} years

Calculate and provide:
1. Current cap rate (NOI / Asking Price)
2. Expense ratio (Total Expenses / Gross Revenue)
3. Maximum offer price (target 3x equity multiple, 5-year hold, conservative assumptions)
4. Annual debt service
5. Cash-on-cash return estimate
6. Go/No-Go recommendation based on:
   - Expense ratio should be ≤ 75% (ideally 70%)
   - Occupancy should be ≥ 85%
   - Cap rate should be reasonable for market
   - Equity multiple projection ≥ 3x
7. Identify any red flags
8. List key assumptions

Response format (JSON only, no markdown):
{
  "capRate": number,
  "expenseRatio": number,
  "maxOfferPrice": number,
  "debtServiceAnnual": number,
  "cashOnCashReturn": number,
  "recommendation": "strong_buy" | "buy" | "hold" | "pass" | "strong_pass",
  "confidence": number (1-10),
  "summary": "3 sentence summary explaining the recommendation",
  "redFlags": ["flag1", "flag2"],
  "keyAssumptions": ["assumption1", "assumption2"]
}`
}

export async function analyzeNapkin(input: NapkinAnalysisInput): Promise<NapkinAnalysisResult> {
  const client = createAnthropicClient()
  const prompt = buildNapkinPrompt(input)

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

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract JSON from response (might be wrapped in markdown code blocks)
  let jsonText = responseText.trim()
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '')
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '')
  }

  // Parse and validate
  const parsed = JSON.parse(jsonText)
  const result = napkinAnalysisResultSchema.parse(parsed)

  // Log the analysis
  await logAIAnalysis({
    dealId: input.dealId,
    analysisType: 'napkin',
    prompt,
    response: responseText,
    model: AI_MODEL,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  })

  return result
}
