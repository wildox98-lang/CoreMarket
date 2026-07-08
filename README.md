# Core Market

Premium e-commerce site for Core Market, a sports-supplement and natural-food
store in Belgrano, Buenos Aires. Next.js 16 (App Router), Tailwind CSS v4,
Prisma + PostgreSQL, Zustand, and Mercado Pago Checkout Pro.

## Getting started

Requires a Postgres database (local, Docker, or a free hosted one like Neon /
Vercel Postgres / Supabase).

```bash
npm install
cp .env.example .env   # then set DATABASE_URL to your Postgres connection string
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying (Vercel)

1. Import the repo in Vercel.
2. Add a Postgres storage under the project's **Storage** tab (Vercel
   Postgres/Neon, or connect your own) — this sets `DATABASE_URL` for you.
3. Set `NEXT_PUBLIC_SITE_URL` to your deployment URL (used for Mercado Pago
   back/notification URLs).
4. Deploy. `npm run build` runs `prisma migrate deploy && prisma db seed`
   before `next build`, so the schema and catalog are always in sync with the
   repo on every deploy — no manual migration step needed.

## Stack notes

- **Data**: Prisma 7 with the `@prisma/adapter-pg` driver adapter (Prisma 7
  requires a driver adapter — see `src/lib/db.ts` and `prisma/seed.ts`).
  Connection config lives in `prisma.config.ts`, not in `schema.prisma`.
- **Payments**: `src/app/api/checkout/route.ts` creates the order and, if
  `MP_ACCESS_TOKEN` is set, a Mercado Pago Checkout Pro preference. Without a
  token it falls back to a "we'll confirm by WhatsApp" flow so checkout is
  always usable end to end — see `.env.example` for what's required to go
  live with real payments.
- **Images**: seeded content uses `picsum.photos` (real stock photography,
  curated by hand for a consistent editorial mood) as a placeholder — swap
  for real product photography before launch.
- **Content**: store address, WhatsApp number, and Instagram handle in
  `src/lib/constants.ts` are placeholders and should be replaced with the
  real values.

## Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — applies pending migrations, reseeds, then builds
- `npx prisma db seed` — reseed the catalog by hand (safe to re-run; upserts)
- `npx prisma studio` — browse the database
