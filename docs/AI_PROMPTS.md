# AI_PROMPTS.md - Relik Capital Underwriting Platform

All prompts use the Anthropic Claude API. Model: `claude-sonnet-4-20250514` (or latest available).

Every AI call should be logged to the `ai_analysis_log` table with: deal_id, analysis_type, prompt, response, model, input_tokens, output_tokens.

---

## System Prompt (shared across all analysis types)

```
You are a senior real estate underwriter at Relik Capital Group, a private equity firm that acquires and operates senior living communities (assisted living, memory care, independent living).

You think like a conservative investor. You favor deals where the numbers work even under pessimistic assumptions. You are direct, specific, and never vague. When you flag a risk, you quantify it. When you make an assumption, you state it.

Key underwriting standards at Relik:
- Target equity multiple: 3x+ over a 5-year hold
- Acceptable expense ratio: 70-75% (above 80% is a red flag)
- Occupancy ceiling: cap projections at 93%
- Payroll should not exceed 45% of gross revenue
- Dietary costs should not exceed 15% of gross revenue
- Conservative loan terms: 30% down, 8% interest, 25-year amortization
- Always use P&L data for revenue, never rent roll
- Management company fees (~$15,500/month) must be accounted for in expense projections
- Cap rate compression exists in senior living: use conservative exit caps (higher than purchase cap)
```

---

## 1. Seven-Minute Napkin Analysis

**analysis_type:** `napkin`

### User Prompt Template
```
Analyze this deal for a quick go/no-go decision.

Property: {name}
Location: {city}, {state}
Type: {property_type}
Units: {total_units} | Licensed Beds: {licensed_beds}
Asking Price: ${asking_price}

Trailing 12-Month Summary:
- Gross Revenue: ${gross_revenue}
- Total Expenses: ${total_expenses}
- NOI: ${noi}
- Current Occupancy: {occupancy}%

Loan Assumptions:
- Down Payment: {down_payment_pct}%
- Interest Rate: {interest_rate}%
- Loan Term: {loan_term_years} years

Fee Structure:
- Acquisition Fee: {acquisition_fee_pct}%
- Asset Management Fee: {asset_mgmt_fee_pct}%
- Refi Fee: {refi_fee_pct}%
- Exit Fee: {exit_fee_pct}%

Calculate and return JSON only, no other text:
{
  "cap_rate": <NOI / Asking Price as decimal>,
  "expense_ratio": <Total Expenses / Gross Revenue as decimal>,
  "max_offer_price": <maximum price that achieves 3x equity multiple over 5-year hold>,
  "debt_service_annual": <annual mortgage payment>,
  "cash_on_cash_return": <year 1 cash flow / total equity invested>,
  "recommendation": "strong_buy" | "buy" | "hold" | "pass" | "strong_pass",
  "confidence": <1-10>,
  "summary": "<3 sentences max. State the key numbers and your verdict.>",
  "red_flags": ["<specific, quantified concerns>"],
  "key_assumptions": ["<what you assumed to reach your conclusion>"]
}
```

---

## 2. T12 Data Extraction

**analysis_type:** `extraction`

### User Prompt Template (text-based documents)
```
Extract financial data from this P&L statement into a structured monthly format.

Document content:
---
{extracted_text}
---

Return JSON only. Map every line item to the closest standard category. If a line item doesn't fit, put it in other_income or other_expenses.

Standard revenue categories: room_rent, level_of_care_fees, other_income
Standard expense categories: payroll, dietary, utilities, insurance, management_fee, maintenance, marketing, admin, other_expenses

{
  "months": [
    {
      "month": "YYYY-MM-DD",
      "room_rent": <number>,
      "level_of_care_fees": <number>,
      "other_income": <number>,
      "gross_revenue": <sum of revenue items>,
      "occupied_units": <number or null if not stated>,
      "occupancy_rate": <decimal or null>,
      "payroll": <number>,
      "dietary": <number>,
      "utilities": <number>,
      "insurance": <number>,
      "management_fee": <number>,
      "maintenance": <number>,
      "marketing": <number>,
      "admin": <number>,
      "other_expenses": <number>,
      "total_expenses": <sum of expense items>,
      "noi": <gross_revenue - total_expenses>
    }
  ],
  "unmapped_items": [
    {"name": "<original line item name>", "amount": <number>, "suggested_category": "<best fit>"}
  ],
  "warnings": ["<any data quality issues noticed>"]
}
```

### Vision Prompt (scanned documents / images)
```
This is a scanned financial document (P&L or income statement) for a senior living property. Extract all monthly financial data you can read.

[Same output format as above]

If any numbers are unclear or partially legible, include them in the warnings array with your best guess and a note about uncertainty.
```

---

## 3. Expense Anomaly Detection

**analysis_type:** `full`

### User Prompt Template
```
Review the trailing 12-month financials for this senior living property and flag anomalies.

Property: {name} ({city}, {state})
Type: {property_type} | Units: {total_units}

Monthly T12 Data:
{t12_json}

For each month, check:
- Payroll > 45% of gross revenue
- Dietary > 15% of gross revenue
- Total expense ratio > 80%
- Any single month where an expense category spikes >25% vs the T12 average for that category
- Revenue drops >10% month-over-month
- Occupancy below 85%

Return JSON only:
{
  "anomalies": [
    {
      "month": "YYYY-MM-DD",
      "category": "<expense or revenue category>",
      "actual_value": <number>,
      "expected_range": "<what normal looks like>",
      "severity": "low" | "medium" | "high",
      "explanation": "<short, specific note>"
    }
  ],
  "overall_assessment": "<2-3 sentences on the financial health trend>",
  "expense_ratio_trend": "improving" | "stable" | "deteriorating"
}
```

---

## 4. Proforma Generation

**analysis_type:** `full`

### User Prompt Template
```
Generate a {hold_years}-year proforma projection for this senior living property.

Property: {name} ({city}, {state})
Type: {property_type} | Units: {total_units}
Purchase Price: ${purchase_price}

Current T12 Totals:
- Gross Revenue: ${t12_gross_revenue}
- Total Expenses: ${t12_total_expenses}
- NOI: ${t12_noi}
- Current Occupancy: {current_occupancy}%

Unit Mix:
{unit_mix_json}

Loan Terms:
- Down Payment: {down_payment_pct}%
- Interest Rate: {interest_rate}%
- Amortization: {loan_term_years} years

Assumptions to apply:
- Annual rent growth: {rent_growth}% (default 3%)
- Expense inflation: {expense_inflation}% (default 2.5%)
- Occupancy ramp: reach {target_occupancy}% by year {ramp_year} (cap at 93%)
- Refi in year {refi_year} at {refi_rate}% (return 100% of investor capital if possible)
- Exit in year {exit_year} at {exit_cap_rate}% cap rate

Return JSON only:
{
  "years": [
    {
      "year": <1-N>,
      "occupancy": <decimal>,
      "gross_revenue": <number>,
      "total_expenses": <number>,
      "noi": <number>,
      "debt_service": <number>,
      "cash_flow": <number>,
      "is_refi_year": <boolean>,
      "refi_loan_amount": <number or null>,
      "capital_returned": <number or null>,
      "is_exit_year": <boolean>,
      "exit_sale_price": <number or null>
    }
  ],
  "summary_metrics": {
    "total_equity_invested": <number>,
    "total_distributions": <number>,
    "equity_multiple": <number>,
    "irr": <number>,
    "average_cash_on_cash": <number>
  },
  "assumptions_used": ["<list all assumptions applied>"]
}
```

---

## 5. Risk Assessment

**analysis_type:** `risk`

### User Prompt Template
```
Evaluate the risk profile of this senior living investment.

{full_deal_json}

Score each dimension from 1 (low risk) to 10 (high risk). Be specific about why.

Return JSON only:
{
  "overall_score": <1-10>,
  "dimensions": [
    {
      "name": "Market Risk",
      "score": <1-10>,
      "factors": ["<specific factor with data>"]
    },
    {
      "name": "Operational Risk",
      "score": <1-10>,
      "factors": ["<specific factor with data>"]
    },
    {
      "name": "Financial Risk",
      "score": <1-10>,
      "factors": ["<specific factor with data>"]
    },
    {
      "name": "Regulatory Risk",
      "score": <1-10>,
      "factors": ["<specific factor with data>"]
    },
    {
      "name": "Execution Risk",
      "score": <1-10>,
      "factors": ["<specific factor with data>"]
    }
  ],
  "top_mitigants": ["<3 strongest risk mitigants>"],
  "deal_breakers": ["<any factors that should kill the deal, empty array if none>"],
  "summary": "<3 sentences. State the biggest risk and whether it's manageable.>"
}
```

---

## 6. Investment Memo

**analysis_type:** `memo`

### User Prompt Template
```
Write an investment memo for Relik Capital Group's investors.

{full_deal_json}

Write in a direct, professional tone. No marketing language. State facts and numbers. Flag concerns where they exist. Structure:

1. Executive Summary (3-4 sentences)
2. Property Overview (location, type, unit count, condition)
3. Financial Summary (T12 performance, key metrics)
4. Proforma & Returns (projected equity multiple, IRR, cash-on-cash)
5. Fee Structure (acquisition fee, asset mgmt, refi/exit fees)
6. Risk Factors (top 3 risks with mitigation strategies)
7. Recommendation (buy/pass with reasoning)

Return the memo as a single string with markdown formatting. Keep total length under 1500 words.
```

---

## 7. Comparable Analysis

**analysis_type:** `comp`

### User Prompt Template
```
Suggest comparable senior living property sales for this deal.

Property: {name}
Location: {city}, {state}
Type: {property_type}
Units: {total_units}
Asking Price: ${asking_price} (${price_per_unit}/unit)

Based on your knowledge of the senior living transaction market, suggest 3-5 comparable sales. For each comp, estimate realistic figures based on typical market data for the region.

Return JSON only:
{
  "comps": [
    {
      "name": "<property or transaction name>",
      "city": "<city>",
      "state": "<state>",
      "units": <number>,
      "sale_price": <number>,
      "sale_date": "YYYY-MM-DD",
      "cap_rate": <decimal>,
      "price_per_unit": <number>,
      "notes": "<why this is a good comp>"
    }
  ],
  "market_analysis": "<3-4 sentences on local market conditions and pricing trends>",
  "price_assessment": "below_market" | "at_market" | "above_market",
  "suggested_price_range": {
    "low": <number>,
    "high": <number>,
    "basis": "<how you arrived at this range>"
  }
}
```

---

## 8. Interactive Chat (Deal Q&A)

**analysis_type:** `chat`

### System Prompt Addition (prepend to base system prompt)
```
You are answering questions about a specific deal. All deal data is provided below. Answer based only on this data. If you don't have enough information, say so.

When the analyst asks a question:
- Reference specific numbers from the data
- If they ask "what if" scenarios, calculate the impact
- Keep answers concise (under 200 words unless they ask for detail)

Deal Data:
{full_deal_json}
```

---

## Implementation Notes

### Response Parsing
All prompts request JSON-only responses. In `src/lib/ai/`, each module should:
1. Build the prompt by interpolating deal data
2. Call the Claude API with the system prompt + user prompt
3. Parse the JSON response (strip markdown code fences if present)
4. Validate the parsed response against a Zod schema
5. Log the interaction to `ai_analysis_log`
6. Return typed data to the caller

### Error Handling
- If Claude returns invalid JSON, retry once with a note: "Your previous response was not valid JSON. Return only the JSON object, no other text."
- If retry fails, return a structured error to the UI: "AI analysis failed. Try again or enter data manually."
- Always set a reasonable timeout (30s for napkin, 60s for memo/proforma).

### Token Management
- Napkin analysis: ~1,000 input, ~500 output
- T12 extraction: ~2,000-5,000 input (depends on document), ~2,000 output
- Proforma: ~2,000 input, ~1,500 output
- Risk assessment: ~3,000 input, ~1,000 output
- Memo: ~3,000 input, ~2,000 output
- Set `max_tokens` appropriately per analysis type to control costs
