# PHASES.md - Relik Capital Underwriting Platform

## Phase 0: Foundation

**Goal:** Project scaffolding, Supabase connection, basic layout shell.

### Setup
```bash
npx create-next-app@16.1.1 relik-underwriting --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd relik-underwriting
npm install @supabase/supabase-js @supabase/ssr
npm install zod react-hook-form @hookform/resolvers
npm install recharts lucide-react
npm install -D @types/node
npx shadcn@latest init
npx shadcn@latest add button card input label form toast sonner table tabs badge dialog select separator sheet skeleton dropdown-menu tooltip
```

### Deliverables
- [ ] Project created with Next.js 16.1.1
- [ ] Supabase project created, env vars configured in `.env.local`
- [ ] `src/lib/supabase/client.ts` - Browser client
- [ ] `src/lib/supabase/server.ts` - Server client
- [ ] `src/lib/supabase/proxy.ts` - Session update helper
- [ ] `src/proxy.ts` - Next.js 16 proxy (NOT middleware.ts)
- [ ] `src/lib/utils.ts` - cn() helper
- [ ] Root layout with brand fonts loaded (Montserrat + Inter from Google Fonts)
- [ ] Basic app shell: sidebar nav placeholder, main content area
- [ ] Tailwind configured with Relik brand colors (see DESIGN_SYSTEM.md)
- [ ] `.env.example` committed with all required variable names

---

## Phase 1: Authentication

**Goal:** Working login/logout for internal team.

### Deliverables
- [ ] `src/app/(auth)/login/page.tsx` - Login page (Server Component)
- [ ] `src/components/forms/login-form.tsx` - Login form (Client Component)
- [ ] Auth confirmation route at `src/app/auth/confirm/route.ts`
- [ ] `profiles` table created in Supabase (see DATABASE_SCHEMA.md)
- [ ] Auto-create profile trigger on signup
- [ ] Protected dashboard layout at `src/app/(dashboard)/layout.tsx` that redirects unauthenticated users
- [ ] Logout functionality in sidebar/header
- [ ] No signup page (admin creates accounts manually in Supabase dashboard)

---

## Phase 2: Core Data Model + Deal CRUD

**Goal:** Create all database tables, generate types, build deal management.

### Database
- [ ] Run full migration from DATABASE_SCHEMA.md
- [ ] Generate TypeScript types: `npx supabase gen types typescript`
- [ ] Verify RLS policies work for authenticated users

### Deal CRUD
- [ ] `src/app/(dashboard)/page.tsx` - Dashboard home showing deal pipeline overview
- [ ] `src/app/(dashboard)/deals/page.tsx` - Deals list with status filters
- [ ] `src/app/(dashboard)/deals/new/page.tsx` - New deal form (basic info only: name, city, state, property type, units, beds, asking price)
- [ ] `src/app/(dashboard)/deals/[id]/page.tsx` - Deal detail overview
- [ ] `src/app/(dashboard)/deals/[id]/layout.tsx` - Deal sub-navigation (Overview, Napkin, T12, Proforma, Analysis, Export)
- [ ] `src/components/deals/deal-card.tsx` - Card for pipeline view
- [ ] `src/components/deals/deal-table.tsx` - Table for list view
- [ ] `src/components/deals/deal-status-badge.tsx` - Status indicator
- [ ] `src/components/deals/deal-metrics-grid.tsx` - Key metrics display
- [ ] Server actions for create, update, delete deals
- [ ] Deal status transitions: napkin → underwriting → under_contract → closed/passed

---

## Phase 3: Seven-Minute Napkin Tool

**Goal:** Rapid deal qualification with AI-assisted analysis.

### Input Form
- [ ] `src/app/(dashboard)/deals/[id]/napkin/page.tsx` - Napkin analysis page
- [ ] `src/components/napkin/napkin-form.tsx` - Input form with fields:
  - Gross revenue (annual), total expenses (annual), current occupancy
  - Loan assumptions (down payment %, interest rate, loan term) with conservative defaults pre-filled
  - Fee structure (acquisition fee %, asset mgmt fee %, refi fee %, exit fee %)

### Calculations (in `src/lib/calculations/`)
- [ ] `napkin.ts` - All napkin math:
  - NOI = Gross Revenue - Total Expenses
  - Cap Rate = NOI / Purchase Price
  - Expense Ratio = Total Expenses / Gross Revenue
  - Debt Service (annual) = mortgage payment calculation
  - Cash Flow = NOI - Debt Service
  - Maximum Offer Price (targeting 3x equity multiple over 5-year hold)
  - Equity Multiple projection

### AI Analysis
- [ ] `src/lib/ai/napkin-analysis.ts` - Claude API call using napkin prompt from AI_PROMPTS.md
- [ ] Parse structured JSON response from Claude
- [ ] Store analysis in `ai_analysis_log` table

### Results Display
- [ ] `src/components/napkin/napkin-results.tsx` - Results panel showing all calculated metrics
- [ ] `src/components/napkin/go-nogo-indicator.tsx` - Visual go/no-go based on equity multiple threshold
- [ ] `src/components/ai/ai-analysis-card.tsx` - AI summary, red flags, key assumptions
- [ ] `src/components/ai/recommendation-badge.tsx` - strong_buy through strong_pass
- [ ] Auto-save napkin results to deal record

---

## Phase 4: Full Underwriting - T12 + Proforma

**Goal:** Detailed financial analysis with T12 data entry/extraction and proforma projections.

### T12 Data Entry & Extraction
- [ ] `src/app/(dashboard)/deals/[id]/t12/page.tsx` - T12 management page
- [ ] `src/components/t12/t12-upload.tsx` - File upload (PDF, Excel, images) with drag-and-drop
- [ ] `src/lib/ai/t12-extraction.ts` - Extraction pipeline:
  1. Detect file type (PDF text, scanned PDF, Excel)
  2. For text PDFs: extract text with pdf-parse
  3. For scanned PDFs/images: send to Claude Vision API for OCR
  4. For Excel: parse with SheetJS
  5. Send extracted text to Claude for categorization into standard line items
  6. Return structured T12 data for user review
  7. Discard uploaded file after extraction (no storage)
- [ ] `src/components/t12/t12-table.tsx` - Editable 12-month data grid
  - Columns: Month, Room Rent, LOC Fees, Other Income, Gross Revenue, then expense categories, Total Expenses, NOI
  - Input cells styled distinctly (Relik gold/accent border) so users know what's editable vs calculated
  - Row and column totals auto-calculate
- [ ] `src/components/t12/t12-chart.tsx` - Revenue vs expenses trend (Recharts line chart)
- [ ] `src/components/t12/expense-breakdown.tsx` - Pie/bar chart of expense categories
- [ ] `src/lib/ai/expense-anomaly.ts` - Flag expenses outside normal ranges:
  - Payroll > 45% of revenue
  - Dietary > 15% of revenue
  - Total expense ratio > 80%
- [ ] Server actions for saving/updating T12 records

### Unit Mix
- [ ] `src/components/t12/unit-mix-table.tsx` - Unit type, count, current rent, market rent, avg LOC fee
- [ ] Save to `unit_mix` table

### Proforma Projections
- [ ] `src/app/(dashboard)/deals/[id]/proforma/page.tsx` - Proforma page
- [ ] `src/components/proforma/proforma-assumptions.tsx` - Editable assumptions:
  - Annual rent growth rate, expense inflation, occupancy ramp schedule
  - Refi year and terms, exit year and cap rate
- [ ] `src/lib/ai/proforma-generation.ts` - AI-assisted proforma using prompt from AI_PROMPTS.md
- [ ] `src/lib/calculations/proforma.ts` - Year-by-year projection math:
  - Revenue projection (occupancy ramp * unit count * blended rent)
  - Expense projection (base expenses * inflation)
  - NOI, debt service, cash flow per year
  - Refi event: new loan amount, capital returned to investors
  - Exit event: sale price at exit cap, net proceeds, final distribution
  - IRR calculation (Newton's method or bisection)
  - Equity multiple = total distributions / total equity invested
- [ ] `src/components/proforma/proforma-table.tsx` - 5-10 year projection grid
- [ ] `src/components/proforma/cash-flow-chart.tsx` - Stacked bar chart (Recharts)
- [ ] `src/components/proforma/returns-calculator.tsx` - Interactive what-if: adjust exit cap, hold period, rent growth and see returns update

---

## Phase 5: AI Features - Risk, Memo, Comps, Chat

**Goal:** Full AI-powered analysis suite.

### Risk Assessment
- [ ] `src/app/(dashboard)/deals/[id]/analysis/page.tsx` - Analysis hub
- [ ] `src/lib/ai/risk-assessment.ts` - Claude API call with risk prompt
- [ ] `src/components/ai/risk-score-gauge.tsx` - Visual gauge (1-10 scale)
- [ ] Display 5 risk dimensions: Market, Operational, Financial, Regulatory, Execution
- [ ] Each dimension scored 1-10 with explanation

### Investment Memo
- [ ] `src/lib/ai/memo-generation.ts` - Generate full memo from deal data
- [ ] `src/components/ai/memo-preview.tsx` - Preview with sections:
  - Executive summary, property overview, market analysis
  - Financial summary (T12 + proforma), fee structure
  - Risk factors, return expectations, recommendation
- [ ] Memo content editable before export

### Comparable Analysis
- [ ] `src/app/(dashboard)/deals/[id]/comps/page.tsx` - Comps page
- [ ] `src/components/comps/comp-entry-form.tsx` - Manual comp entry
- [ ] `src/lib/ai/comp-analysis.ts` - AI-assisted comp suggestions:
  - Given property location and type, Claude suggests comparable properties and pricing benchmarks
  - Uses web search tool if available for recent transactions
- [ ] `src/components/comps/comp-table.tsx` - Comp grid with price/unit, cap rate comparisons
- [ ] Save to `comparables` table

### Interactive Analysis Chat
- [ ] `src/components/ai/analysis-chat.tsx` - Chat interface scoped to current deal
- [ ] Context includes all deal data (T12, proforma, comps, napkin results)
- [ ] User can ask follow-up questions about the deal
- [ ] Conversation logged in `ai_analysis_log`

---

## Phase 6: Export

**Goal:** Professional PDF and Excel exports.

### PDF Export
- [ ] `src/app/api/export/pdf/route.ts` - Server-side PDF generation
- [ ] Use a server-side PDF library (e.g., puppeteer or @react-pdf/renderer)
- [ ] Export types:
  - Napkin summary (1-page)
  - Full underwriting package (T12 + proforma + analysis)
  - Investment memo
- [ ] `src/components/export/pdf-preview.tsx` - Preview before download
- [ ] Branded with Relik colors and logo

### Excel Export
- [ ] `src/app/api/export/excel/route.ts` - Server-side Excel generation (SheetJS)
- [ ] Export T12 data and proforma to formatted worksheets
- [ ] Preserve formulas where possible

### Export UI
- [ ] `src/app/(dashboard)/deals/[id]/export/page.tsx` - Export hub
- [ ] `src/components/export/export-button.tsx` - Download trigger with format selection

---

## Phase 7: Polish + Performance

**Goal:** Production-ready quality.

- [ ] Loading states for all async operations (skeleton components)
- [ ] Error boundaries on all route segments
- [ ] Empty states for deals list, T12, proforma, comps
- [ ] Mobile responsive layout (sidebar collapses to sheet on mobile)
- [ ] Cache Components (`use cache`) for deal list and dashboard metrics
- [ ] Optimistic updates on deal status changes
- [ ] Form validation error messages
- [ ] Toast notifications for save/delete/export actions
- [ ] Keyboard navigation for data entry grids (Tab between cells)
- [ ] Final typecheck, lint, build verification
- [ ] Deploy to Vercel with production env vars
