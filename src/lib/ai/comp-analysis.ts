import * as z from 'zod'
import { createAnthropicClient, AI_MODEL, AI_MAX_TOKENS } from './client'
import { logAIAnalysis } from './logging'

const comparableSchema = z.object({
  name: z.string(),
  city: z.string(),
  state: z.string(),
  units: z.number(),
  salePrice: z.number(),
  saleDate: z.string(),
  capRate: z.number(),
  pricePerUnit: z.number(),
  notes: z.string(),
})

const compAnalysisSchema = z.object({
  comps: z.array(comparableSchema),
  marketAnalysis: z.string(),
  priceAssessment: z.enum(['below_market', 'at_market', 'above_market']),
  suggestedPriceRange: z.object({
    low: z.number(),
    high: z.number(),
    basis: z.string(),
  }),
})

export type Comparable = z.infer<typeof comparableSchema>
export type CompAnalysis = z.infer<typeof compAnalysisSchema>

interface CompAnalysisInput {
  dealId: number
  dealName: string
  city?: string
  state?: string
  propertyType?: string
  totalUnits?: number
  askingPrice?: number
  currentNOI?: number
}

function buildCompAnalysisPrompt(input: CompAnalysisInput): string {
  const location = [input.city, input.state].filter(Boolean).join(', ') || 'Location TBD'

  return `You are a real estate market analyst for Relik Capital Group specializing in senior living properties.

Provide comparable sales analysis for this property acquisition:

Subject Property:
- Name: ${input.dealName}
- Location: ${location}
- Type: ${input.propertyType || 'Senior Living'}
- Units: ${input.totalUnits || 'N/A'}
- Asking Price: ${input.askingPrice ? `$${input.askingPrice.toLocaleString()}` : 'TBD'}
- Current NOI: ${input.currentNOI ? `$${input.currentNOI.toLocaleString()}` : 'TBD'}

Task: Suggest 3-5 comparable senior living property sales that would help validate the pricing.

For each comparable, provide:
- Property name
- City and State (prioritize same market, then regional, then similar markets)
- Number of units (prefer within 20% of subject property size)
- Sale price
- Sale date (prefer last 12-24 months, note if older)
- Cap rate at sale
- Price per unit
- Brief notes on similarity/adjustments needed

Then provide:
1. **Market Analysis** (2-3 paragraphs)
   - Overview of senior living market in the subject property's region
   - Recent transaction trends
   - Cap rate trends and market dynamics
   - Supply/demand balance

2. **Price Assessment**
   - Is the asking price below market, at market, or above market?
   - Consider cap rate, price per unit, and market conditions

3. **Suggested Price Range**
   - Low end (conservative)
   - High end (aggressive)
   - Basis for the range

Note: Since this is AI-generated, these are EXAMPLE comparables based on typical market data.
The user should verify actual sales data through CoStar, Real Capital Analytics, or local brokers.

Response format (JSON only, no markdown):
{
  "comps": [
    {
      "name": "Property Name",
      "city": "City",
      "state": "ST",
      "units": number,
      "salePrice": number,
      "saleDate": "YYYY-MM",
      "capRate": number (decimal, e.g., 0.075 for 7.5%),
      "pricePerUnit": number,
      "notes": "Brief description and adjustments"
    }
  ],
  "marketAnalysis": "string (2-3 paragraphs)",
  "priceAssessment": "below_market" | "at_market" | "above_market",
  "suggestedPriceRange": {
    "low": number,
    "high": number,
    "basis": "Explanation of how range was determined"
  }
}`
}

export async function analyzeComps(input: CompAnalysisInput): Promise<CompAnalysis> {
  const client = createAnthropicClient()
  const prompt = buildCompAnalysisPrompt(input)

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

  const result = compAnalysisSchema.parse(parsed)

  // Log the analysis
  await logAIAnalysis({
    dealId: input.dealId,
    analysisType: 'comp_analysis',
    prompt,
    response: JSON.stringify(result),
    model: AI_MODEL,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  })

  return result
}
