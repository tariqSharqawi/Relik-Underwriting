import * as z from 'zod'
import { createAnthropicClient, AI_MODEL, AI_MAX_TOKENS } from './client'
import { logAIAnalysis } from './logging'
import type { T12Month } from '@/lib/calculations/t12'

const expenseAnomalySchema = z.object({
  month: z.string(),
  category: z.string(),
  actualValue: z.number(),
  expectedRange: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  explanation: z.string(),
})

const anomalyDetectionResultSchema = z.object({
  anomalies: z.array(expenseAnomalySchema),
  overallAssessment: z.string(),
  expenseRatioTrend: z.enum(['improving', 'stable', 'deteriorating']),
})

export type ExpenseAnomaly = z.infer<typeof expenseAnomalySchema>
export type AnomalyDetectionResult = z.infer<typeof anomalyDetectionResultSchema>

interface AnomalyDetectionInput {
  dealId: number
  dealName: string
  t12Data: T12Month[]
  totalUnits: number
}

function buildAnomalyDetectionPrompt(input: AnomalyDetectionInput): string {
  const { dealName, t12Data, totalUnits } = input

  // Calculate averages and ranges
  const monthlyStats = t12Data.map((month) => {
    const payrollPct = month.grossRevenue > 0 ? month.payroll / month.grossRevenue : 0
    const dietaryPct = month.grossRevenue > 0 ? month.dietary / month.grossRevenue : 0
    const expenseRatio =
      month.grossRevenue > 0 ? month.totalExpenses / month.grossRevenue : 0

    return {
      month: month.month,
      grossRevenue: month.grossRevenue,
      totalExpenses: month.totalExpenses,
      noi: month.noi,
      occupancyRate: month.occupancyRate,
      payrollPct,
      dietaryPct,
      expenseRatio,
    }
  })

  const dataTable = monthlyStats
    .map(
      (m) =>
        `${m.month}: Revenue: $${m.grossRevenue.toLocaleString()}, Expenses: $${m.totalExpenses.toLocaleString()}, NOI: $${m.noi.toLocaleString()}, Occupancy: ${(m.occupancyRate * 100).toFixed(1)}%, Payroll: ${(m.payrollPct * 100).toFixed(1)}%, Dietary: ${(m.dietaryPct * 100).toFixed(1)}%, Expense Ratio: ${(m.expenseRatio * 100).toFixed(1)}%`
    )
    .join('\n')

  return `You are a senior financial analyst for Relik Capital Group, specializing in senior living properties.

Analyze the trailing 12-month financials for "${dealName}" and identify any expense anomalies or concerning trends.

Property Details:
- Total Units: ${totalUnits}

Monthly Data:
${dataTable}

Anomaly Detection Rules:
1. **Payroll > 45%** of gross revenue = flag as anomaly
2. **Dietary > 15%** of gross revenue = flag as anomaly
3. **Total Expense Ratio > 80%** = major concern
4. **Category spike > 25%** vs 12-month average = investigate
5. **Revenue drop > 10%** month-over-month = red flag
6. **Occupancy < 85%** = concerning for stabilized property

For each anomaly detected:
- Identify the specific month and category
- Calculate the actual value and expected range
- Assess severity (low, medium, high)
- Explain the potential impact

Also provide:
- Overall assessment of financial health
- Expense ratio trend (improving, stable, deteriorating)

Response format (JSON only, no markdown):
{
  "anomalies": [
    {
      "month": "string",
      "category": "string (e.g., 'Payroll', 'Dietary', 'Occupancy', 'Revenue')",
      "actualValue": number,
      "expectedRange": "string (e.g., '40-45%', '$150k-$175k')",
      "severity": "low" | "medium" | "high",
      "explanation": "string (detailed explanation of the anomaly and its impact)"
    }
  ],
  "overallAssessment": "string (2-3 sentences summarizing financial health)",
  "expenseRatioTrend": "improving" | "stable" | "deteriorating"
}`
}

export async function detectExpenseAnomalies(
  input: AnomalyDetectionInput
): Promise<AnomalyDetectionResult> {
  const client = createAnthropicClient()
  const prompt = buildAnomalyDetectionPrompt(input)

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

  const result = anomalyDetectionResultSchema.parse(parsed)

  // Log the analysis
  await logAIAnalysis({
    dealId: input.dealId,
    analysisType: 'expense_anomaly',
    prompt,
    response: JSON.stringify(result),
    model: AI_MODEL,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  })

  return result
}

/**
 * Simple local anomaly detection (no AI)
 * Can be used as a fallback or for quick checks
 */
export function detectLocalAnomalies(t12Data: T12Month[]): ExpenseAnomaly[] {
  const anomalies: ExpenseAnomaly[] = []

  t12Data.forEach((month) => {
    const payrollPct = month.grossRevenue > 0 ? month.payroll / month.grossRevenue : 0
    const dietaryPct = month.grossRevenue > 0 ? month.dietary / month.grossRevenue : 0
    const expenseRatio =
      month.grossRevenue > 0 ? month.totalExpenses / month.grossRevenue : 0

    // Check payroll ratio
    if (payrollPct > 0.45) {
      anomalies.push({
        month: month.month,
        category: 'Payroll',
        actualValue: payrollPct,
        expectedRange: '40-45%',
        severity: payrollPct > 0.5 ? 'high' : 'medium',
        explanation: `Payroll is ${(payrollPct * 100).toFixed(1)}% of gross revenue, exceeding the recommended maximum of 45%.`,
      })
    }

    // Check dietary ratio
    if (dietaryPct > 0.15) {
      anomalies.push({
        month: month.month,
        category: 'Dietary',
        actualValue: dietaryPct,
        expectedRange: '12-15%',
        severity: dietaryPct > 0.18 ? 'high' : 'medium',
        explanation: `Dietary expenses are ${(dietaryPct * 100).toFixed(1)}% of gross revenue, exceeding the recommended maximum of 15%.`,
      })
    }

    // Check expense ratio
    if (expenseRatio > 0.8) {
      anomalies.push({
        month: month.month,
        category: 'Total Expenses',
        actualValue: expenseRatio,
        expectedRange: '70-75%',
        severity: expenseRatio > 0.85 ? 'high' : 'medium',
        explanation: `Expense ratio is ${(expenseRatio * 100).toFixed(1)}%, significantly above the target of 70-75%.`,
      })
    }

    // Check occupancy
    if (month.occupancyRate < 0.85) {
      anomalies.push({
        month: month.month,
        category: 'Occupancy',
        actualValue: month.occupancyRate,
        expectedRange: '85-93%',
        severity: month.occupancyRate < 0.75 ? 'high' : 'medium',
        explanation: `Occupancy is ${(month.occupancyRate * 100).toFixed(1)}%, below the minimum target of 85%.`,
      })
    }
  })

  return anomalies
}
