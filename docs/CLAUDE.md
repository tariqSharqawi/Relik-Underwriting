# Relik Capital Underwriting Platform

Web app replacing Excel-based underwriting for senior living real estate investments. Two-tier analysis: quick "7-Minute Napkin" assessments and full underwriting with AI automation.

## Stack
- Next.js 16.1.1 (App Router, Turbopack, proxy.ts)
- Supabase (Auth + PostgreSQL)
- Anthropic Claude API (analysis automation)
- shadcn/ui + Tailwind CSS 4
- Recharts (data visualization)
- React Hook Form + Zod (validation)
- Lucide React (icons)
- Vercel (deployment)

## Key Directories
- `src/app/` - Pages, layouts, route handlers, server actions
- `src/components/` - All React components (NEVER put components in app/)
- `src/lib/` - Utilities, configs, Supabase clients
- `src/lib/supabase/` - client.ts, server.ts, proxy.ts
- `src/lib/calculations/` - Underwriting math (cap rate, IRR, equity multiple, NOI)
- `src/lib/ai/` - Claude API integration, prompt builders, response parsers
- `src/hooks/` - Client-side custom hooks
- `src/types/` - TypeScript types including generated Supabase types

## Commands
- `npm run dev` - Start dev server (Turbopack)
- `npm run build` - Production build
- `npm run lint` - ESLint check
- `npm run typecheck` - TypeScript check
- `npx supabase gen types typescript --project-id [ID] > src/types/supabase.ts`

## Critical Rules
1. NEVER use middleware.ts. Use proxy.ts (function named `proxy`, not `middleware`)
2. NEVER use `getSession()` for auth. Use `getUser()` always
3. NEVER put components in `app/` directory
4. NEVER use `any` type in TypeScript
5. NEVER leave placeholder text, TODOs, or Lorem ipsum
6. NEVER use inline styles. Tailwind only
7. NEVER use `console.log` in production code
8. NEVER use emojis in UI or code
9. ALWAYS use Server Components by default
10. ONLY add "use client" when component needs useState, useEffect, or event handlers
11. ALWAYS run `npm run typecheck` after changes
12. ALWAYS commit after completing each feature

## Server vs Client Components
**Server (default, no directive):** Data fetching, database queries, sensitive logic, heavy computation.
**Client ("use client"):** useState/useEffect, event handlers, browser APIs, interactive forms.
**Rule: Push "use client" to the leaves of the component tree.**

## Auth Pattern
- Email/password only (internal team, 2-3 users)
- proxy.ts refreshes sessions on every request
- Protected routes check auth in Server Components via `getUser()`
- All authenticated users can access all deals (small team, no per-user isolation)

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Domain Context
- Senior living real estate: assisted living, memory care, independent living
- Revenue = Room Rent + Level of Care Fees + Other Income
- Largest expense is always payroll, then dietary
- Target expense ratio: 70-75%. Above 80% is a red flag
- Occupancy calculated as occupied units / total units (not beds)
- Equity multiple must exceed 3x for a deal to proceed
- Always use P&L for revenue, never rent roll
- Cap rate = NOI / Purchase Price
- Conservative loan defaults: 30% down, 8% interest, 25-year term

## Planning Docs
- `PHASES.md` - Implementation phases with deliverables
- `DATABASE_SCHEMA.md` - Full Supabase schema with RLS
- `DESIGN_SYSTEM.md` - Brand colors, typography, component guidelines
- `AI_PROMPTS.md` - All AI prompt templates for analysis features

## Debugging Protocol
1. Read the full error message. Identify file and line.
2. Form one hypothesis about root cause.
3. Make the minimal change to test it.
4. If stuck after 3 attempts: check docs, search the exact error, simplify to isolate.
