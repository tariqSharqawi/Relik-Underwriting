# DATABASE_SCHEMA.md - Relik Capital Underwriting Platform

## Conventions
- `BIGINT GENERATED ALWAYS AS IDENTITY` for all IDs (except profiles, which uses UUID from auth.users)
- `TIMESTAMPTZ` for all timestamps
- `created_at` and `updated_at` on every table with auto-update trigger
- RLS enabled on all tables immediately
- Indexes on all foreign keys
- TEXT with CHECK constraints instead of VARCHAR
- No GENERATED columns for calculated fields (application-level calculations allow analyst overrides)

---

## Migration: 001_foundation.sql

```sql
-- ============================================
-- UTILITY: auto-update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'analyst' CHECK (role IN ('admin', 'analyst', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Small team: all authenticated users see all profiles
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- DEALS (main entity)
-- ============================================
CREATE TABLE public.deals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'napkin'
    CHECK (status IN ('napkin', 'underwriting', 'under_contract', 'closed', 'passed')),

  -- Location
  city TEXT,
  state TEXT,

  -- Property
  property_type TEXT CHECK (property_type IN ('assisted_living', 'memory_care', 'independent_living', 'mixed')),
  total_units INTEGER,
  licensed_beds INTEGER,

  -- Pricing
  asking_price NUMERIC(14,2),
  max_offer_price NUMERIC(14,2),
  final_offer_price NUMERIC(14,2),

  -- Key Metrics (application-calculated, stored for quick access)
  cap_rate_purchase NUMERIC(7,4),
  cap_rate_exit NUMERIC(7,4),
  equity_multiple NUMERIC(6,2),
  irr NUMERIC(7,4),
  noi_current NUMERIC(14,2),
  noi_stabilized NUMERIC(14,2),
  expense_ratio NUMERIC(7,4),

  -- Loan Assumptions
  down_payment_pct NUMERIC(5,3) DEFAULT 0.300,
  interest_rate NUMERIC(7,5) DEFAULT 0.08000,
  loan_term_years INTEGER DEFAULT 25,

  -- Fee Structure
  acquisition_fee_pct NUMERIC(5,4),
  asset_mgmt_fee_pct NUMERIC(5,4),
  refi_fee_pct NUMERIC(5,4),
  exit_fee_pct NUMERIC(5,4),

  -- AI Analysis (summary cached on deal)
  ai_summary TEXT,
  ai_risk_score INTEGER CHECK (ai_risk_score BETWEEN 1 AND 10),
  ai_recommendation TEXT CHECK (ai_recommendation IN ('strong_buy', 'buy', 'hold', 'pass', 'strong_pass')),

  -- Metadata
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX deals_status_idx ON public.deals(status);
CREATE INDEX deals_created_by_idx ON public.deals(created_by);
CREATE INDEX deals_created_at_idx ON public.deals(created_at);

CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Small team: all authenticated users have full access
CREATE POLICY "Auth users select deals" ON public.deals
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users insert deals" ON public.deals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users update deals" ON public.deals
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users delete deals" ON public.deals
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- T12 FINANCIALS (Trailing 12 Months)
-- One row per month per deal
-- ============================================
CREATE TABLE public.t12_financials (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  deal_id BIGINT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  month DATE NOT NULL,

  -- Revenue
  room_rent NUMERIC(12,2) DEFAULT 0,
  level_of_care_fees NUMERIC(12,2) DEFAULT 0,
  other_income NUMERIC(12,2) DEFAULT 0,
  gross_revenue NUMERIC(12,2) DEFAULT 0,

  -- Occupancy
  occupied_units INTEGER,
  occupancy_rate NUMERIC(5,3),

  -- Expenses
  payroll NUMERIC(12,2) DEFAULT 0,
  dietary NUMERIC(12,2) DEFAULT 0,
  utilities NUMERIC(12,2) DEFAULT 0,
  insurance NUMERIC(12,2) DEFAULT 0,
  management_fee NUMERIC(12,2) DEFAULT 0,
  maintenance NUMERIC(12,2) DEFAULT 0,
  marketing NUMERIC(12,2) DEFAULT 0,
  admin NUMERIC(12,2) DEFAULT 0,
  other_expenses NUMERIC(12,2) DEFAULT 0,
  total_expenses NUMERIC(12,2) DEFAULT 0,

  -- NOI (app-calculated, stored)
  noi NUMERIC(12,2) DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(deal_id, month)
);

CREATE INDEX t12_deal_id_idx ON public.t12_financials(deal_id);
CREATE INDEX t12_month_idx ON public.t12_financials(month);

CREATE TRIGGER t12_financials_updated_at
  BEFORE UPDATE ON public.t12_financials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.t12_financials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users select t12" ON public.t12_financials
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users insert t12" ON public.t12_financials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users update t12" ON public.t12_financials
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users delete t12" ON public.t12_financials
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- PROFORMA PROJECTIONS (up to 10 years)
-- ============================================
CREATE TABLE public.proforma (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  deal_id BIGINT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 10),

  -- Assumptions for this year
  target_occupancy NUMERIC(5,3),
  rent_growth_rate NUMERIC(5,4),
  expense_inflation_rate NUMERIC(5,4),

  -- Revenue
  projected_revenue NUMERIC(14,2),

  -- Expenses
  projected_expenses NUMERIC(14,2),

  -- NOI
  projected_noi NUMERIC(14,2),

  -- Debt
  debt_service NUMERIC(14,2),
  cash_flow NUMERIC(14,2),

  -- Capital Events
  is_refi_year BOOLEAN DEFAULT FALSE,
  refi_loan_amount NUMERIC(14,2),
  is_exit_year BOOLEAN DEFAULT FALSE,
  exit_sale_price NUMERIC(14,2),
  capital_returned NUMERIC(14,2),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(deal_id, year)
);

CREATE INDEX proforma_deal_id_idx ON public.proforma(deal_id);

CREATE TRIGGER proforma_updated_at
  BEFORE UPDATE ON public.proforma
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.proforma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users select proforma" ON public.proforma
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users insert proforma" ON public.proforma
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users update proforma" ON public.proforma
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users delete proforma" ON public.proforma
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- UNIT MIX
-- ============================================
CREATE TABLE public.unit_mix (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  deal_id BIGINT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  unit_type TEXT NOT NULL,
  unit_count INTEGER NOT NULL DEFAULT 0,
  current_rent NUMERIC(10,2),
  market_rent NUMERIC(10,2),
  avg_loc_fee NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX unit_mix_deal_id_idx ON public.unit_mix(deal_id);

CREATE TRIGGER unit_mix_updated_at
  BEFORE UPDATE ON public.unit_mix
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.unit_mix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users select unit_mix" ON public.unit_mix
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users insert unit_mix" ON public.unit_mix
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users update unit_mix" ON public.unit_mix
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users delete unit_mix" ON public.unit_mix
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- COMPARABLES
-- ============================================
CREATE TABLE public.comparables (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  deal_id BIGINT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  comp_name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  units INTEGER,
  sale_price NUMERIC(14,2),
  sale_date DATE,
  cap_rate NUMERIC(7,4),
  price_per_unit NUMERIC(12,2),
  source TEXT, -- 'manual', 'ai_suggested'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX comparables_deal_id_idx ON public.comparables(deal_id);

CREATE TRIGGER comparables_updated_at
  BEFORE UPDATE ON public.comparables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.comparables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users select comparables" ON public.comparables
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users insert comparables" ON public.comparables
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users update comparables" ON public.comparables
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users delete comparables" ON public.comparables
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- AI ANALYSIS LOG
-- ============================================
CREATE TABLE public.ai_analysis_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  deal_id BIGINT NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL
    CHECK (analysis_type IN ('napkin', 'full', 'risk', 'comp', 'memo', 'chat', 'extraction')),
  prompt TEXT,
  response TEXT,
  model TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ai_log_deal_id_idx ON public.ai_analysis_log(deal_id);
CREATE INDEX ai_log_type_idx ON public.ai_analysis_log(analysis_type);

ALTER TABLE public.ai_analysis_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users select ai_log" ON public.ai_analysis_log
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users insert ai_log" ON public.ai_analysis_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- TYPE GENERATION
-- ============================================
-- After running this migration, generate types:
-- npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

## Notes
- All financial fields use NUMERIC instead of DECIMAL for consistency. They are functionally identical in PostgreSQL.
- No GENERATED columns. All computed values (gross_revenue, noi, expense_ratio, etc.) are calculated in `src/lib/calculations/` and written to the database. This lets analysts override any number.
- The `t12_financials` table has a UNIQUE constraint on (deal_id, month) to prevent duplicate months.
- The `proforma` table has a UNIQUE constraint on (deal_id, year) for the same reason.
- `ai_analysis_log` is append-only (no update/delete policies). This creates an audit trail of all AI interactions.
- The `comparables.source` field tracks whether a comp was manually entered or suggested by AI.
