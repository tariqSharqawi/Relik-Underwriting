# Relik Capital Underwriting Platform

A modern web application for automating senior living real estate investment analysis, replacing Excel-based underwriting with AI-powered insights and professional reporting.

## Overview

The Relik Capital Underwriting Platform streamlines the investment analysis process for senior living properties through:

- **Seven-Minute Napkin Analysis**: Rapid deal qualification with AI-powered recommendations
- **Comprehensive T12 Financials**: Trailing 12-month data entry with anomaly detection
- **Proforma Projections**: Multi-year financial modeling with IRR calculations
- **AI-Powered Analysis**: Risk assessment, investment memos, and comparable analysis
- **Professional Exports**: Investor-ready PDFs and Excel workbooks

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router, React Server Components)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Cookie-based auth (single password)
- **AI**: Anthropic Claude API (claude-3-5-sonnet-20241022)
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Charts**: Recharts
- **Exports**: @react-pdf/renderer, xlsx (SheetJS)
- **Validation**: Zod
- **TypeScript**: Strict type safety throughout

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ and npm installed
- A Supabase account ([supabase.com](https://supabase.com))
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

## Getting Started

### 1. Install Dependencies

First, install the required dependencies:

```bash
npm install
```

Install additional export dependencies:

```bash
npm install @react-pdf/renderer xlsx
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Create a new project: "relik-underwriting"
3. Wait for the project to finish provisioning
4. Navigate to **Settings > API** to find your credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

#### Run Database Migration

1. Navigate to your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_foundation.sql`
4. Paste into the SQL Editor and click "Run"
5. Verify all tables were created successfully in the **Table Editor**

The migration creates:
- `profiles` - User profile extension
- `deals` - Main deal records
- `t12_financials` - Monthly financial data
- `proforma` - Projection data
- `unit_mix` - Unit breakdown
- `comparables` - Comparable properties
- `ai_analysis_log` - AI interaction logging
- All necessary indexes, triggers, and RLS policies

#### Generate TypeScript Types

After running the migration, generate TypeScript types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

### 3. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Name it "Relik Underwriting"
6. Copy the API key (you won't see it again!)

**Recommended tier**: Pay-as-you-go with rate limits based on your usage needs.

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-your-api-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
AUTH_PASSWORD=your-secure-password-here
```

**Security Notes**:
- Never commit `.env.local` to version control
- Use a strong password for `AUTH_PASSWORD`
- Keep the `SUPABASE_SERVICE_ROLE_KEY` secret (it bypasses RLS!)
- Rotate the `AUTH_PASSWORD` regularly

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### 6. Login

Navigate to `/login` and enter your `AUTH_PASSWORD` to access the platform.

## Features

### Phase 1: Seven-Minute Napkin Tool

Rapid deal qualification in under 7 minutes:

- **Input**: Basic property info + T12 summary (revenue, expenses, occupancy)
- **Output**:
  - Calculated metrics (NOI, Cap Rate, Expense Ratio)
  - Maximum offer price (targeting 3x equity multiple)
  - Go/No-Go recommendation
  - AI-generated red flags and assumptions
  - Confidence score (1-10)

**Location**: `/deals/[id]/napkin`

### Phase 2: T12 Financials

Comprehensive trailing 12-month data management:

- **Data Entry**:
  - 12-month editable grid
  - Revenue categories: Room Rent, LOC Fees, Other Income
  - Expense categories: Payroll, Dietary, Utilities, Insurance, Management, Maintenance, Marketing, Admin
  - Auto-calculated gross revenue, total expenses, NOI
  - Occupancy tracking
- **Visualization**:
  - Revenue vs. Expenses trend chart
  - Expense breakdown pie chart
- **AI Anomaly Detection**:
  - Flags when payroll > 45% of revenue
  - Flags when dietary > 15% of revenue
  - Flags when expense ratio > 80%
  - Identifies unexpected category spikes
- **Unit Mix**: Track different unit types, rents, and LOC fees

**Location**: `/deals/[id]/t12`

### Phase 3: Proforma Projections

Multi-year financial modeling:

- **Assumptions Form**:
  - Hold period (5-10 years)
  - Annual rent growth %
  - Expense inflation %
  - Target occupancy (≤93% hard cap)
  - Refi timing and terms
  - Exit timing and cap rate
- **Calculations**:
  - Year-by-year projections
  - IRR using Newton's method
  - Equity Multiple
  - Average Cash-on-Cash Return
  - Refi and exit event modeling
- **Interactive Calculator**:
  - What-if scenarios with sliders
  - Real-time recalculation
  - Sensitivity analysis
- **Charts**: Cash flow waterfall visualization

**Location**: `/deals/[id]/proforma`

### Phase 4: Advanced AI Features

#### Risk Assessment

5-dimensional risk scoring:

1. **Market Risk**: Local demand/supply dynamics
2. **Operational Risk**: Management performance
3. **Financial Risk**: Debt coverage, expense volatility
4. **Regulatory Risk**: Licensing, compliance
5. **Execution Risk**: Value-add feasibility

Each dimension scored 1-10 with contributing factors. Includes:
- Overall risk score
- Top risk mitigants
- Deal breakers (critical issues)
- Summary analysis

**Location**: `/deals/[id]/analysis` (Risk Assessment tab)

#### Investment Memo Generation

AI-generated investor-ready memorandum with 7 sections:

1. Executive Summary
2. Property Overview
3. Financial Summary
4. Proforma and Returns
5. Fee Structure
6. Risk Factors
7. Recommendation

Editable in real-time with markdown support.

**Location**: `/deals/[id]/analysis` (Investment Memo tab)

#### Comparable Analysis

AI-powered comp suggestions plus manual entry:

- AI suggests comparable properties based on:
  - Location proximity
  - Property type match
  - Unit count similarity
  - Sale date recency
- Market analysis with price assessment:
  - Below Market
  - At Market
  - Above Market
- Suggested price range with basis
- Manual comp entry from CoStar, Real Capital Analytics, brokers
- Comparison table with $/Unit and differentials

**Location**: `/deals/[id]/comps`

#### Interactive Analysis Chat

Deal-specific Q&A powered by Claude:

- Full deal context provided to AI
- Ask questions like:
  - "What if occupancy only reaches 85%?"
  - "Is the payroll ratio concerning?"
  - "How does this compare to our other deals?"
- Conversational history maintained
- Streaming responses for real-time feedback
- All interactions logged for audit trail

**Location**: `/deals/[id]/analysis` (Chat tab)

### Phase 5: Export & Reporting

Professional PDF and Excel exports:

#### PDF Exports

- **Napkin Summary**: 1-page quick summary
- **Full Underwriting**: Multi-page comprehensive package
  - Cover page
  - Deal summary
  - T12 financials
  - Proforma projections
  - Risk assessment
- **Investment Memo**: Formatted memo document

All PDFs feature Relik Capital branding (Evergreen #18312E, Gold #B8986A).

#### Excel Exports

- **T12 Data**: Monthly grid with formulas
- **Proforma**: Year-by-year projections with calculations
- **Complete Package**: Multi-sheet workbook
  - Deal Summary
  - T12 Financials
  - Proforma
  - Returns Analysis

All Excel files preserve formulas for client customization.

**Location**: `/deals/[id]/export`

## Project Structure

```
relik-underwriting/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/          # Authentication
│   │   ├── (dashboard)/
│   │   │   ├── deals/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── napkin/     # Napkin analysis
│   │   │   │   │   ├── t12/        # T12 financials
│   │   │   │   │   ├── proforma/   # Proforma projections
│   │   │   │   │   ├── analysis/   # AI features (risk, memo, chat)
│   │   │   │   │   ├── comps/      # Comparable analysis
│   │   │   │   │   └── export/     # Export hub
│   │   │   │   ├── new/            # New deal creation
│   │   │   │   └── page.tsx        # Deals list
│   │   │   └── page.tsx            # Dashboard home
│   │   ├── actions/                # Server actions
│   │   │   ├── deals.ts
│   │   │   ├── napkin.ts
│   │   │   ├── t12.ts
│   │   │   ├── proforma.ts
│   │   │   ├── analysis.ts
│   │   │   └── comps.ts
│   │   └── api/
│   │       └── export/
│   │           ├── pdf/            # PDF export endpoint
│   │           └── excel/          # Excel export endpoint
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── deals/                  # Deal components
│   │   ├── napkin/                 # Napkin tool components
│   │   ├── t12/                    # T12 components
│   │   ├── proforma/               # Proforma components
│   │   ├── ai/                     # AI feature components
│   │   ├── comps/                  # Comp analysis components
│   │   ├── analysis/               # Analysis container
│   │   └── export/                 # Export components
│   ├── lib/
│   │   ├── supabase/              # Supabase clients
│   │   ├── db/                    # Data access layer
│   │   ├── calculations/          # Business logic
│   │   │   ├── napkin.ts
│   │   │   ├── loan.ts
│   │   │   ├── t12.ts
│   │   │   └── proforma.ts
│   │   ├── ai/                    # AI integration
│   │   │   ├── client.ts
│   │   │   ├── logging.ts
│   │   │   ├── napkin-analysis.ts
│   │   │   ├── expense-anomaly.ts
│   │   │   ├── proforma-generation.ts
│   │   │   ├── risk-assessment.ts
│   │   │   ├── memo-generation.ts
│   │   │   ├── comp-analysis.ts
│   │   │   └── chat.ts
│   │   ├── export/
│   │   │   ├── pdf.ts
│   │   │   └── excel.ts
│   │   ├── validations/           # Zod schemas
│   │   └── auth.ts
│   ├── types/
│   │   └── supabase.ts           # Generated types
│   └── proxy.ts                  # Auth session refresh
├── public/                       # Static assets
├── supabase/
│   └── migrations/
│       └── 001_foundation.sql    # Database schema
├── .env.local                    # Environment variables (not committed)
├── .env.example                  # Environment template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Key Calculations

### Net Operating Income (NOI)

```typescript
NOI = Gross Revenue - Total Expenses
```

### Cap Rate

```typescript
Cap Rate = NOI / Purchase Price
```

### Expense Ratio

```typescript
Expense Ratio = Total Expenses / Gross Revenue
```

Target: 70-75% for senior living properties

### Equity Multiple

```typescript
Equity Multiple = Total Distributions / Total Equity Invested
```

Minimum threshold: 3.0x for deal approval

### Internal Rate of Return (IRR)

Calculated using Newton's method to solve:

```typescript
NPV = Σ(CF_t / (1 + IRR)^t) = 0
```

Where CF_t is the cash flow in year t (negative for initial investment, positive for returns).

### Cash-on-Cash Return

```typescript
Cash-on-Cash = Annual Cash Flow / Equity Invested
```

### Debt Service

```typescript
Monthly Payment = P * [r(1+r)^n] / [(1+r)^n - 1]

Where:
- P = Loan principal
- r = Monthly interest rate
- n = Number of payments

Annual Debt Service = Monthly Payment * 12
```

## AI Prompts

All AI prompts are structured to provide:

1. **Context**: Property type, market, current performance
2. **Data**: Financial metrics, historical trends, assumptions
3. **Task**: Specific analysis request
4. **Format**: Expected JSON schema for structured responses

Key prompt templates are in:
- `src/lib/ai/napkin-analysis.ts` - Quick analysis
- `src/lib/ai/expense-anomaly.ts` - Anomaly detection
- `src/lib/ai/risk-assessment.ts` - 5-dimension risk scoring
- `src/lib/ai/memo-generation.ts` - Investment memo creation
- `src/lib/ai/comp-analysis.ts` - Comparable suggestions
- `src/lib/ai/chat.ts` - Interactive Q&A

All prompts use Claude 3.5 Sonnet and include:
- Conservative bias (senior living industry standards)
- Structured JSON output with Zod validation
- Error handling with retries
- Usage tracking and logging

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run typecheck

# Lint code
npm run lint
```

## Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (copy from `.env.local`)

3. **Set Environment Variables in Vercel**:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your production URL

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - Access your live site at the provided URL

### Post-Deployment

1. **Update CORS in Supabase**:
   - Go to Supabase Dashboard > Settings > API
   - Add your production URL to allowed origins

2. **Monitor Usage**:
   - Supabase: Check database usage and connection limits
   - Anthropic: Monitor API usage and costs
   - Vercel: Check function execution times and errors

3. **Set Up Backups**:
   - Enable automatic backups in Supabase (recommended daily)
   - Document recovery procedure

## Security Best Practices

1. **Never commit secrets**:
   - `.env.local` is gitignored
   - Use Vercel environment variables for production

2. **Row Level Security (RLS)**:
   - All tables have RLS enabled
   - Policies restrict access to authenticated users
   - Service role key used server-side only

3. **Authentication**:
   - Single password stored in environment variable
   - Cookie-based sessions with secure flags
   - Session refresh on every request via proxy

4. **API Security**:
   - Anthropic API key stored server-side only
   - Rate limiting recommended for production
   - Input validation with Zod on all forms

5. **HTTPS**:
   - Enforce HTTPS in production
   - Vercel provides automatic SSL

## Troubleshooting

### Database Connection Issues

**Problem**: "Failed to connect to Supabase"

**Solution**:
1. Check `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the anon key, not service role
3. Ensure Supabase project is not paused (free tier auto-pauses after inactivity)

### AI API Errors

**Problem**: "Anthropic API request failed"

**Solution**:
1. Verify `ANTHROPIC_API_KEY` is correct and starts with `sk-ant-`
2. Check API key has not expired or been revoked
3. Ensure you have available credits
4. Check rate limits (may need to upgrade plan)

### IRR Calculation Not Converging

**Problem**: IRR calculation returns `NaN` or incorrect value

**Solution**:
1. Ensure cash flows are not all positive or all negative
2. Check that initial investment is negative (outflow)
3. Verify at least one positive cash flow (inflow) exists
4. Increase max iterations or adjust tolerance in `calculateIRR()`

### PDF Export Fails

**Problem**: "Failed to generate PDF"

**Solution**:
1. Ensure `@react-pdf/renderer` is installed
2. Check that all required data is present
3. Verify no undefined values in PDF components
4. Check browser console for specific errors

### Excel Export Corrupted

**Problem**: Excel file won't open or shows errors

**Solution**:
1. Ensure `xlsx` package is installed
2. Verify data contains no null values in numeric cells
3. Check that date fields are valid Date objects
4. Try opening with LibreOffice Calc to see specific errors

## License

Proprietary - Relik Capital Group © 2024

## Support

For technical issues or questions, contact the development team.

---

**Built with ❤️ for Relik Capital Group**

Automating senior living investment analysis, one deal at a time.
