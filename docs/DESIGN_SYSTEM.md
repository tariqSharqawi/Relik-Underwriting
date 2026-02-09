# DESIGN_SYSTEM.md - Relik Capital Underwriting Platform

## Brand Colors

### Primary Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Evergreen | `#18312E` | Primary buttons, sidebar background, headers |
| Dark Teal | `#020E0E` | Text on light backgrounds, high-contrast elements |
| Off-White | `#F9FCFC` | Page backgrounds, card backgrounds |
| Neutral Gray | `#697374` | Secondary text, borders, muted elements |
| Gold Accent | `#B8986A` | Accent buttons, highlights, input focus rings, editable field indicators |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Success | `#22C55E` | Go indicators, positive metrics, deal proceed |
| Warning | `#EAB308` | Caution flags, anomaly warnings |
| Danger | `#EF4444` | No-go indicators, red flags, delete actions |
| Info | `#3B82F6` | Informational badges, links |

### shadcn/ui CSS Variables

Apply these in `src/app/globals.css`:

```css
@layer base {
  :root {
    --background: 168 33% 98%;        /* #F9FCFC */
    --foreground: 170 75% 5%;         /* #020E0E */
    --card: 0 0% 100%;
    --card-foreground: 170 75% 5%;
    --popover: 0 0% 100%;
    --popover-foreground: 170 75% 5%;
    --primary: 168 30% 15%;           /* #18312E */
    --primary-foreground: 168 33% 98%;
    --secondary: 170 4% 44%;          /* #697374 */
    --secondary-foreground: 168 33% 98%;
    --muted: 168 10% 92%;
    --muted-foreground: 170 4% 44%;
    --accent: 37 35% 57%;             /* #B8986A */
    --accent-foreground: 170 75% 5%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 168 10% 88%;
    --input: 168 10% 88%;
    --ring: 37 35% 57%;               /* Gold focus ring */
    --radius: 0.5rem;
  }
}
```

---

## Typography

### Fonts
- **Headlines:** Montserrat (SemiBold 600, Bold 700)
- **Body:** Inter (Regular 400, Medium 500)
- **Monospace (data tables, numbers):** JetBrains Mono

### Loading Fonts

In `src/app/layout.tsx`:
```tsx
import { Montserrat, Inter, JetBrains_Mono } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})
```

Apply to `<html>` tag:
```tsx
<html className={`${montserrat.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
```

### Tailwind Config

In `tailwind.config.ts`:
```ts
theme: {
  extend: {
    fontFamily: {
      heading: ['var(--font-heading)', 'sans-serif'],
      body: ['var(--font-body)', 'sans-serif'],
      mono: ['var(--font-mono)', 'monospace'],
    },
  },
}
```

### Usage
- Page titles and section headers: `font-heading text-2xl font-semibold`
- Body text, labels, descriptions: `font-body text-sm` or `font-body text-base`
- Financial data, numbers in tables: `font-mono text-sm tabular-nums text-right`

---

## Layout

### Dashboard Structure
- **Sidebar:** 256px wide, Evergreen (#18312E) background, white text. Collapses to a Sheet on mobile (< 768px).
- **Main content area:** Off-White (#F9FCFC) background, max-width 1280px, centered.
- **Deal sub-navigation:** Horizontal tabs below the deal header (Overview, Napkin, T12, Proforma, Analysis, Comps, Export).

### Spacing
Use Tailwind's scale consistently:
- Between sections: `space-y-8` or `gap-8`
- Between cards: `gap-6`
- Card padding: `p-6`
- Form field spacing: `space-y-4`

---

## Component Guidelines

### Data Tables
- Use shadcn `<Table>` component
- Financial numbers: `font-mono tabular-nums text-right`
- Editable cells: Gold accent left border (`border-l-2 border-[#B8986A]`) and slightly warm background
- Calculated/read-only cells: Default background, no border accent
- Totals row: `font-semibold` with top border

### Cards
- White background with subtle border
- Section title in Montserrat SemiBold
- Consistent `p-6` padding

### Status Badges
| Status | Color |
|--------|-------|
| napkin | `bg-blue-100 text-blue-800` |
| underwriting | `bg-amber-100 text-amber-800` |
| under_contract | `bg-purple-100 text-purple-800` |
| closed | `bg-green-100 text-green-800` |
| passed | `bg-gray-100 text-gray-800` |

### AI Recommendation Badges
| Recommendation | Color |
|----------------|-------|
| strong_buy | `bg-green-600 text-white` |
| buy | `bg-green-100 text-green-800` |
| hold | `bg-amber-100 text-amber-800` |
| pass | `bg-red-100 text-red-800` |
| strong_pass | `bg-red-600 text-white` |

### Buttons
- Primary action (one per view): Default `<Button>` (Evergreen)
- Secondary actions: `<Button variant="secondary">`
- Destructive: `<Button variant="destructive">`
- Ghost/tertiary: `<Button variant="ghost">`

### Charts (Recharts)
Color palette for chart series:
1. `#18312E` (Evergreen)
2. `#B8986A` (Gold)
3. `#697374` (Gray)
4. `#3B82F6` (Blue)
5. `#22C55E` (Green)

---

## Voice & Copy

Relik's written voice: clear, direct, calm confidence. Think experienced investor writing for other experienced investors.

- No marketing fluff in the UI. Labels should be precise: "NOI" not "Net Operating Income (NOI)" in space-constrained areas.
- Use abbreviations the team already uses: T12, LOC, NOI, IRR, Cap Rate, EM (equity multiple).
- Error messages should be specific: "T12 data missing for months 3-5" not "Incomplete data."
- AI-generated content should read as analyst notes, not marketing copy.
