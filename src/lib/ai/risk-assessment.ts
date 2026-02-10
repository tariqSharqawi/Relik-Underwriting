import * as z from 'zod'
import { createAnthropicClient, AI_MODEL, AI_MAX_TOKENS } from './client'
import { logAIAnalysis } from './logging'

const riskDimensionSchema = z.object({
  name: z.string(),
  score: z.number().min(1).max(10),
  factors: z.array(z.string()),
})

const riskAssessmentSchema = z.object({
  overallScore: z.number().min(1).max(10),
  dimensions: z.array(riskDimensionSchema),
  topMitigants: z.array(z.string()),
  dealBreakers: z.array(z.string()),
  summary: z.string(),
})

export type RiskDimension = z.infer<typeof riskDimensionSchema>
export type RiskAssessment = z.infer<typeof riskAssessmentSchema>

interface RiskAssessmentInput {
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
  equityMultiple?: number
  irr?: number
  t12Summary?: {
    grossRevenue: number
    totalExpenses: number
    noi: number
    payrollPct: number
    dietaryPct: number
  }
}

function buildRiskAssessmentPrompt(input: RiskAssessmentInput): string {
  const location = [input.city, input.state].filter(Boolean).join(', ') || 'Location TBD'

  return `You are a senior risk analyst for Relik Capital Group, specializing in senior living real estate investments.

Conduct a comprehensive risk assessment for this acquisition:

Property: ${input.dealName}
Location: ${location}
Type: ${input.propertyType || 'Senior Living'}
Units: ${input.totalUnits || 'N/A'} | Licensed Beds: ${input.licensedBeds || 'N/A'}
Asking Price: ${input.askingPrice ? `$${input.askingPrice.toLocaleString()}` : 'N/A'}

Current Performance:
- Purchase Cap Rate: ${input.purchaseCapRate ? `${(input.purchaseCapRate * 100).toFixed(2)}%` : 'N/A'}
- Occupancy: ${input.currentOccupancy ? `${(input.currentOccupancy * 100).toFixed(1)}%` : 'N/A'}
- Expense Ratio: ${input.currentExpenseRatio ? `${(input.currentExpenseRatio * 100).toFixed(1)}%` : 'N/A'}

${input.t12Summary ? `
T12 Summary:
- Gross Revenue: $${input.t12Summary.grossRevenue.toLocaleString()}
- Total Expenses: $${input.t12Summary.totalExpenses.toLocaleString()}
- NOI: $${input.t12Summary.noi.toLocaleString()}
- Payroll: ${(input.t12Summary.payrollPct * 100).toFixed(1)}% of revenue
- Dietary: ${(input.t12Summary.dietaryPct * 100).toFixed(1)}% of revenue
` : ''}

${input.equityMultiple ? `Projected Equity Multiple: ${input.equityMultiple.toFixed(2)}x` : ''}
${input.irr ? `Projected IRR: ${(input.irr * 100).toFixed(2)}%` : ''}

Evaluate risk across 5 dimensions (score 1-10, where 10 = highest risk):

1. **Market Risk**
   - Local demand/supply dynamics
   - Demographic trends (aging population, income levels)
   - Competitive landscape
   - Geographic concentration risk
   - Economic conditions in the market

2. **Operational Risk**
   - Current management performance
   - Staffing challenges (payroll ratio, turnover)
   - Quality of care issues
   - Occupancy volatility
   - Regulatory compliance history

3. **Financial Risk**
   - Debt service coverage
   - Expense volatility (especially payroll and dietary)
   - Revenue concentration
   - Liquidity and working capital
   - Cap rate risk (compression/expansion)

4. **Regulatory Risk**
   - Licensing requirements and compliance
   - Reimbursement rate changes (Medicaid, Medicare)
   - State-specific regulations
   - Certificate of Need (CON) requirements
   - Inspection and survey results

5. **Execution Risk**
   - Value-add plan feasibility
   - Occupancy ramp timeline
   - Capital improvement requirements
   - Management transition risk
   - Exit strategy viability

For each dimension:
- Provide a score (1 = low risk, 10 = high risk)
- List 2-4 specific risk factors

Also provide:
- Overall risk score (weighted average of dimensions)
- Top 3 risk mitigants (actions to reduce risk)
- Deal breakers (if any) - critical issues that would kill the deal
- Summary (2-3 sentences on overall risk profile)

Response format (JSON only, no markdown):
{
  "overallScore": number (1-10),
  "dimensions": [
    {
      "name": "Market Risk",
      "score": number (1-10),
      "factors": ["factor 1", "factor 2", ...]
    },
    // ... 4 more dimensions
  ],
  "topMitigants": ["mitigant 1", "mitigant 2", "mitigant 3"],
  "dealBreakers": ["deal breaker 1", ...] or [],
  "summary": "string (2-3 sentences)"
}`
}

export async function assessRisk(input: RiskAssessmentInput): Promise<RiskAssessment> {
  const client = createAnthropicClient()
  const prompt = buildRiskAssessmentPrompt(input)

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

  const result = riskAssessmentSchema.parse(parsed)

  // Ensure we have exactly 5 dimensions
  if (result.dimensions.length !== 5) {
    throw new Error('Risk assessment must include exactly 5 dimensions')
  }

  // Log the analysis
  await logAIAnalysis({
    dealId: input.dealId,
    analysisType: 'risk_assessment',
    prompt,
    response: JSON.stringify(result),
    model: AI_MODEL,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  })

  return result
}
