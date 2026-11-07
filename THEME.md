# To-Do App Theme — UI spec for Claude Code

> Paste this file into the project root and tell Claude Code:
> **"Read THEME.md and restyle the app to match it exactly — tokens, components and the three screens."**

Stack target: Next.js (App Router) + Tailwind CSS (+ Framer Motion optional).
Look: dark near-black ground, soft pastel gradient task cards, fully rounded (pill) controls, Urbanist font.

---

## 1. Font

Urbanist (Google Fonts), weights 400 / 500 / 600 / 700.

```tsx
// app/layout.tsx
import { Urbanist } from 'next/font/google'
const urbanist = Urbanist({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-urbanist' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={urbanist.variable}>
      <body className="bg-bg text-white font-sans antialiased">{children}</body>
    </html>
  )
}
```

### Type scale

| Role | Size / line-height | Weight | Notes |
|---|---|---|---|
| Display (onboarding hero) | 44 / 46 px | 600 (accent word 700) | letter-spacing -0.02em |
| H1 (screen title) | 28 / 34 px | 600 | letter-spacing -0.01em |
| Card title | 21–22 / 28 px | 600 | letter-spacing -0.01em |
| Section title | 16 / 22 px | 600 | |
| Body | 14–15 / 22 px | 400 | colour #C8C8CE on dark |
| Meta value | 13–14 px | 600 | |
| Caption / label | 11–12 px | 500 | "Status", "Due to", day names |

---

## 2. Colour tokens

### Base (dark UI)
| Token | Hex | Use |
|---|---|---|
| `bg` | `#0E0E10` | App background |
| `surface` | `#1A1A1D` | Panels, cards on dark |
| `surface-2` | `#2A2A2F` | Selected date pill, icon buttons, active tab = `#2E2E33` |
| `line` | `#2E2E33` | Borders, dividers |
| `muted` | `#8E8E96` | Secondary text, inactive icons |
| `body` | `#C8C8CE` | Paragraph text on dark |
| `text` | `#FFFFFF` | Primary text |
| `ink` | `#141416` | Text on pastel cards / light buttons |

### Gradients
| Name | CSS | Used for | Text colour |
|---|---|---|---|
| Blush | `linear-gradient(120deg, #F9C6D8 0%, #F2B8E2 45%, #CFC6F6 100%)` | **Urgent** task card | ink `#141416`, labels `#4A3F4E` |
| Violet | `linear-gradient(120deg, #7C55EE 0%, #5636D3 100%)` | **Normal** task card | white, labels `#E3DAFF` |
| Mist | `linear-gradient(120deg, #BCC9F8 0%, #E2BDF1 100%)` | **Low** task card | ink, labels `#3F4458` |
| Button | `linear-gradient(90deg, #CFD8F7 0%, #E9C3EC 55%, #F4B6D8 100%)` | Primary CTA, gradient text accent | ink |
| Glow | `linear-gradient(160deg, #BFD3F7 0%, #E7C6EF 50%, #F7C9D9 100%)` | Task-detail header background | ink |

Onboarding background: `radial-gradient(120% 60% at 100% 100%, #2A1E33 0%, #0E0E10 60%)`.

---

## 3. Radius & spacing

- Radius: sm 12 · md 16 (date pill) · card 24 · sheet 32 (bottom sheet top corners) · pill 999 (buttons, chips, tabs, nav)
- Spacing scale: 4 · 8 · 12 · 16 · 20 · 24 · 32
- Screen side gutter 20px · card padding 18px · gap between cards 12px · min touch target 44px

---

## 4. Drop-in config

```css
/* app/globals.css */
@tailwind base; @tailwind components; @tailwind utilities;

:root {
  --bg:#0E0E10; --surface:#1A1A1D; --surface-2:#2A2A2F; --line:#2E2E33;
  --muted:#8E8E96; --body:#C8C8CE; --ink:#141416;
  --g-blush:  linear-gradient(120deg,#F9C6D8 0%,#F2B8E2 45%,#CFC6F6 100%);
  --g-violet: linear-gradient(120deg,#7C55EE 0%,#5636D3 100%);
  --g-mist:   linear-gradient(120deg,#BCC9F8 0%,#E2BDF1 100%);
  --g-button: linear-gradient(90deg,#CFD8F7 0%,#E9C3EC 55%,#F4B6D8 100%);
  --g-glow:   linear-gradient(160deg,#BFD3F7 0%,#E7C6EF 50%,#F7C9D9 100%);
}

@layer utilities {
  .bg-g-blush  { background-image: var(--g-blush); }
  .bg-g-violet { background-image: var(--g-violet); }
  .bg-g-mist   { background-image: var(--g-mist); }
  .bg-g-button { background-image: var(--g-button); }
  .bg-g-glow   { background-image: var(--g-glow); }
  .text-g-button { background-image: var(--g-button); -webkit-background-clip: text; background-clip: text; color: transparent; }
}
```

```js
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0E0E10', surface: '#1A1A1D', 'surface-2': '#2A2A2F', line: '#2E2E33',
        muted: '#8E8E96', body: '#C8C8CE', ink: '#141416',
        blush: '#F9C6D8', lilac: '#CFC6F6', violet: '#7C55EE', mist: '#BCC9F8',
      },
      borderRadius: { card: '24px', sheet: '32px' },
      fontFamily: { sans: ['var(--font-urbanist)', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
```

---

## 5. Components

**Primary button** — h-14 (56px), full width, `rounded-full bg-g-button text-ink text-base font-semibold`.

**Dark button** — h-11/h-12, `rounded-full bg-ink text-white font-semibold px-7` (used on light/gradient backgrounds, e.g. "Start" in task header). On dark backgrounds add `ring-1 ring-line`.

**Icon button** — 44×44 circle. On dark: `bg-surface-2 text-white`. On gradient: `bg-white/55 text-ink`. Add-task FAB: 56×56 `bg-white text-ink`. Icons are 18–22px stroke icons, stroke-width 2, round caps (lucide-react works: Menu, Bookmark, ChevronLeft, Plus, CalendarDays, SquareCheck).

**Priority chip** — `px-3 py-1.5 rounded-full text-[11px] font-semibold`. On light cards: `bg-white/60 text-ink`. On violet card: `bg-white/20 text-white`.

**Date pill** — 48×64, `rounded-2xl`, column: number 17px/600 + day 11px. Inactive: transparent, `text-muted`. Selected: `bg-surface-2 text-white`. Row of 6 days, `justify-between`.

**Task card** — `rounded-card p-[18px] flex flex-col gap-3`, background by priority (Urgent→blush, Normal→violet, Low→mist).
  - Row 1: priority chip (left) + bookmark icon (right)
  - Row 2: project name 12px (label colour) above title 21px/600
  - Row 3: 3-column grid — Status / Priority / Due to (label 11px, value 13px/600)
  - Whole card is a link to the task detail.

**Segmented tabs** — container `bg-[#1F1F23] rounded-full p-1 ring-1 ring-line`, two equal buttons h-10 `rounded-full text-[13px] font-semibold`; active `bg-[#2E2E33] text-white`, inactive `text-muted`.

**Floating bottom nav** — absolutely positioned, centred, `bottom-7`, `rounded-full p-2 bg-[rgba(36,36,40,0.85)] backdrop-blur-md ring-1 ring-line shadow-[0_10px_30px_rgba(0,0,0,0.5)]`, three items: Tasks icon (white), white Add FAB (center, 56px), Calendar icon (muted).

**Avatar** — 40px circle `bg-[linear-gradient(135deg,#F9C6D8,#CFC6F6)] text-ink font-bold` with initial (or photo).

**List row** — h-12, `border-t border-line`, label 14px/600 left, icon right (Add subtask → Plus, More info → ChevronRight).

---

## 6. Screens (mobile, 390×844 reference)

### 01 Onboarding
- Background: onboarding radial gradient. Content anchored to bottom, padding `0 24px 40px`, gap 28.
- Decorative 5 diagonal rounded strokes (`/////`), stroke-width 6, stroked with the Button gradient, ~150×88px.
- Headline: "Keep track of" (600) / "your tasks" (700, `.text-g-button`), 44px.
- Sub copy 15px `text-[#A6A6AE]`: "A reliable place to store your tasks and plan your day."
- Primary button "Start" → navigates to Today.

### 02 Today (home)
- `bg-bg`, top padding ~56px, side gutter 20.
- Header row: menu icon (left); name + role (right-aligned, 14/600 + 12 muted) + avatar.
- H1 "Your tasks for today" 28px.
- Date strip (6 date pills, one selected).
- Scrollable list of task cards, gap 12, bottom padding 120 so the floating nav doesn't cover the last card.
- Floating bottom nav.

### 03 Task detail
- Full background: Glow gradient. Header area padding `56px 20px 24px`, gap 18, text ink.
  - Top bar: back icon button (white/55) · "Task" 16/600 centred · bookmark icon button.
  - Project 13px `#4A3F4E` + title 28px/600.
  - 3-col meta grid: Status / Priority / Due to.
  - Row: avatar (ink circle, blush initial) + "Assigned to" / name, and dark "Start" button on the right.
- Bottom sheet: `flex-1 bg-bg text-white rounded-t-sheet p-5 gap-[18px]`, scrolls.
  - Segmented tabs: Description | Activity.
  - Description tab: "Description" 16/600 + body 14px `#C8C8CE` with "Read more" link (`#C9B8FF`, 600); "Attachments" header + "4 files" muted; 4-column grid of square thumbnails, `rounded-[14px]`; list rows "Add subtask", "More info".
  - Activity tab: timeline — 10px gradient dot (Button gradient) + event 14/600 + time 12 muted.

---

## 7. Motion (Framer Motion, optional)
- Cards: stagger in `y: 12 → 0, opacity 0 → 1`, 0.25s, stagger 0.05.
- Buttons: `whileTap={{ scale: 0.97 }}`.
- Tabs: shared-layout `layoutId="tab-pill"` for the active background.
- Detail sheet: slide up `y: 40 → 0` on mount.

## 8. Accessibility rules
- Real `<button>` / `<Link>` elements; `aria-label` on icon-only buttons; date pills use `aria-pressed`; tabs use `role="tab"` + `aria-selected`.
- Keep the darker violet (#7C55EE→#5636D3) so white text passes 4.5:1 contrast.
- Touch targets ≥ 44px.
