import * as z from 'zod'
import { createAnthropicClient, AI_MODEL, AI_MAX_TOKENS } from './client'
import { logAIAnalysis } from './logging'
import type { ProformaAssumptions } from '@/lib/calculations/proforma'

const aiProformaAssumptionsSchema = z.object({
  annualRentGrowth: z.number(),
  annualExpenseInflation: z.number(),
  targetOccupancy: z.number(),
  occupancyRampYears: z.number(),
  refiYear: z.number().nullable(),
  exitCapRate: z.number(),
  reasoning: z.string(),
  marketConditions: z.string(),
  recommendations: z.array(z.string()),
})

export type AIProformaAssumptions = z.infer<typeof aiProformaAssumptionsSchema>

interface ProformaGenerationInput {
  dealId: number
  dealName: string
  city?: string
  state?: string
  propertyType?: string
  totalUnits?: number
  currentNOI: number
  currentOccupancy: number
  currentExpenseRatio: number
  purchaseCapRate: number
  holdYears: number
}

function buildProformaGenerationPrompt(input: ProformaGenerationInput): string {
  const location = [input.city, input.state].filter(Boolean).join(', ') || 'Location TBD'

  return `You are a senior real estate analyst for Relik Capital Group, specializing in senior living properties.

Generate conservative proforma assumptions for this ${input.holdYears}-year hold period:

Property: ${input.dealName}
Location: ${location}
Type: ${input.propertyType || 'Senior Living'}
Units: ${input.totalUnits || 'N/A'}

Current Performance:
- NOI: $${input.currentNOI.toLocaleString()}
- Occupancy: ${(input.currentOccupancy * 100).toFixed(1)}%
- Expense Ratio: ${(input.currentExpenseRatio * 100).toFixed(1)}%
- Purchase Cap Rate: ${(input.purchaseCapRate * 100).toFixed(2)}%

Provide assumptions for a ${input.holdYears}-year proforma:

1. **Annual Rent Growth** - Based on market conditions and CPI, what's a reasonable annual rent increase? (Conservative estimate)

2. **Annual Expense Inflation** - Operating expenses typically grow with inflation, what rate should we assume?

3. **Target Occupancy** - What's a realistic stabilized occupancy for this property? (Hard cap at 93% per company policy)

4. **Occupancy Ramp** - How many years to reach target occupancy from current ${(input.currentOccupancy * 100).toFixed(1)}%?

5. **Refi Timing** - Should we plan a refinance? If yes, in which year? (Typically year 2-3 to return investor capital)

6. **Exit Cap Rate** - What cap rate should we assume for exit valuation? (Should be HIGHER than purchase cap due to market risk and age of property)

Consider:
- Senior living market trends (2024-2026)
- Local market conditions
- Property age and condition implications
- Conservative underwriting standards
- Market cap rate compression/expansion risk

Response format (JSON only, no markdown):
{
  "annualRentGrowth": number (e.g., 0.03 for 3%),
  "annualExpenseInflation": number (e.g., 0.025 for 2.5%),
  "targetOccupancy": number (e.g., 0.93 for 93%, max 0.93),
  "occupancyRampYears": number (e.g., 2),
  "refiYear": number | null (e.g., 2, or null if no refi recommended),
  "exitCapRate": number (e.g., 0.085 for 8.5%, should be > purchase cap),
  "reasoning": "string (1-2 sentences explaining the assumptions)",
  "marketConditions": "string (brief market assessment)",
  "recommendations": ["string array of 2-3 key recommendations"]
}`
}

export async function generateProformaAssumptions(
  input: ProformaGenerationInput
): Promise<AIProformaAssumptions> {
  const client = createAnthropicClient()
  const prompt = buildProformaGenerationPrompt(input)

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

  const result = aiProformaAssumptionsSchema.parse(parsed)

  // Log the analysis
  await logAIAnalysis({
    dealId: input.dealId,
    analysisType: 'proforma_generation',
    prompt,
    response: JSON.stringify(result),
    model: AI_MODEL,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  })

  return result
}

/**
 * Get default conservative assumptions (no AI)
 */
export function getDefaultProformaAssumptions(
  currentOccupancy: number,
  purchaseCapRate: number
): Partial<ProformaAssumptions> {
  return {
    annualRentGrowth: 0.03, // 3% annual growth
    annualExpenseInflation: 0.025, // 2.5% inflation
    targetOccupancy: 0.93, // 93% target (hard cap)
    occupancyRampYears: currentOccupancy < 0.85 ? 2 : 1,
    refiYear: 2, // Default refi in year 2
    refiInterestRate: null, // Will use current rate * 0.9
    refiLoanToValue: 0.75, // 75% LTV on refi
    exitCapRate: purchaseCapRate * 1.1, // 10% higher than purchase (more conservative)
    acquisitionFeePct: 0.02,
    assetMgmtFeePct: 0.02,
    refiFeePct: 0.01,
    exitFeePct: 0.02,
  }
}
