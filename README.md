# K9 Studio

**We Build Your Digital World.**

K9 Studio is a real digital business platform: a catalog-driven storefront for
services (websites, bots, AI bots, custom projects) and digital products
(prompts, AI role systems, code), powered by **K9 Credit** — a USD-pegged
universal purchasing layer with a fully auditable ledger, instant checkout, an
admin control panel, and Telegram notifications for every business event.

## Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19 · Vite · TypeScript · Tailwind CSS v4 · Motion (framer-motion) |
| Backend    | Convex (database, queries/mutations/actions, scheduled jobs) |
| Auth       | Convex Auth — Google OAuth + Email/Password |
| Typography | Space Grotesk Variable · Inter Variable |
| Icons      | lucide-react |
| Toasts     | sonner |

## Core flows

- **Discover → Configure → Purchase → Track** — services first, products second.
- **Basic / Standard / Premium** package tiers are interactive data on every
  tiered service: price, features, description and delivery time update live.
- **K9 Credit** — every balance change writes a `creditTransactions` row
  (top-up, purchase, refund, admin grant/deduct) with `balanceAfter`, so the
  ledger is auditable end to end. Purchases debit atomically; insufficient
  balance falls back to two paths: *Buy K9 Credit* or *Request Order*.
- **Dual currency** — prices are stored in both MMK and USDT. Locale decides
  which is primary (MMK first for Myanmar visitors); the conversion rate is a
  setting, not a constant.
- **Order system** — persistent orders with number (`K9-XXXXXX`), snapshot
  pricing, status timeline (`orderEvents`), customer cancellation with refund,
  and the full admin workflow.
- **Telegram notifications** — new orders, custom project requests and support
  messages ping the studio bot server-side. Tokens never touch the client.
- **Admin panel** (`/admin`) — orders, requests, support, catalog editor
  (names/prices/availability), customer credit adjustments, currency rate,
  support link. Gated by the `K9_ADMIN_EMAILS` allowlist, checked server-side.
- **Intro experience** — a "digital universe forming" opening (canvas particle
  field, mark formation, tagline) that respects `prefers-reduced-motion`,
  pauses when the tab is hidden, and is skipped entirely for returning
  visitors in the same session.

## Getting started

```bash
bun install
bunx convex dev --once   # generate types & push functions (or `bun convex dev` while developing)
bun run dev              # start Vite
```

Seed data (services, products, settings) is inserted automatically the first
time the catalog is queried — no manual step needed. To re-run manually:

```bash
bunx convex run seed:seedOnce
```

## Environment variables

Sandbox values live in `.env.local` (created by `convex dev`):

| Key | Where | Purpose |
|-----|-------|---------|
| `VITE_CONVEX_URL` | client | Convex deployment URL (auto-generated) |
| `VITE_CONVEX_SITE_URL` | client | Convex HTTP actions URL (auto-generated) |
| `K9_ADMIN_EMAILS` | Convex env | Comma-separated admin emails (default `admin@k9studio.app`) |
| `K9_TELEGRAM_BOT_TOKEN` | Convex env | Bot token for admin notifications |
| `K9_TELEGRAM_ADMIN_CHAT_ID` | Convex env | Admin chat for notifications |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Convex env | Enables the Google sign-in button |
| `CONVEX_SITE_URL` | Convex env | OAuth callback base (set by Convex) |

Set Convex-side secrets with `bunx convex env set K9_TELEGRAM_BOT_TOKEN <value>`.

## Scripts

```bash
bun run dev         # Vite dev server
bun run build       # typecheck + production build (dist/)
bun run typecheck   # tsc --noEmit
bun run convex:push # push Convex functions once
```

## Deployment notes

- The production build is static (`vite build` → `dist/`).
- Convex functions must be deployed (`bunx convex deploy`) and production env
  vars set on the Convex deployment for auth/Telegram/admin to work.
- Update the canonical domain in `index.html` and `public/sitemap.xml` before
  going live.

## Architecture map

```
convex/
  schema.ts        data model (catalog, creditTransactions, orders, …)
  auth.ts          Convex Auth (Google + Password)
  catalogReads.ts  public catalog/settings readers (+ auto-seed)
  credit.ts        K9 Credit ledger (applyLedger is the single writer)
  orders.ts        order creation, instant purchase, cancellation
  public.ts        project requests, support messages, profile
  admin.ts         admin queries/mutations (allowlist-gated)
  telegram.ts      notification actions (server-side only)
  seed.ts/data     idempotent seed data
src/
  intro/           opening experience
  brand/           K9 mark & wordmark
  components/      design-system components (PriceTag, TierSwitcher, …)
  layout/          nav, mobile menu, footer
  pages/           Home, Services, Products, Projects, Pricing, About,
                   Support, Custom, Auth, Account, Admin, 404
```
