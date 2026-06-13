# Portfolio Website

Personal portfolio built with **Next.js (App Router) + TypeScript + Tailwind CSS**, backed by **Supabase Postgres** via **Drizzle ORM**, with auth handled by **Auth.js (NextAuth v5)**. Designed to deploy on **Vercel** (free tier).

## Stack

| Layer      | Choice                          |
| ---------- | ------------------------------- |
| Framework  | Next.js 15 (App Router)         |
| Language   | TypeScript                      |
| Styling    | Tailwind CSS v4                 |
| Database   | Postgres (Supabase)             |
| ORM        | Drizzle                         |
| Auth       | Auth.js / NextAuth v5 (GitHub)  |
| Hosting    | Vercel                          |

## Getting started

> ⚠️ Dependencies are **not installed yet** — the disk was full when this was scaffolded. Free up space, then run `npm install`.

```bash
npm install

# Set up environment variables
cp .env.example .env.local
# then fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET

npx auth secret        # generates AUTH_SECRET into .env.local

npm run db:push        # push the Drizzle schema to Supabase
npm run dev            # http://localhost:3000
```

## Environment variables

See [.env.example](./.env.example). Get the Postgres connection strings from
**Supabase Dashboard → Project Settings → Database → Connection string**:

- `DATABASE_URL` — the **Transaction pooler** (port `6543`) for the app runtime.
- `DIRECT_URL` — the **direct** connection (port `5432`) used by `drizzle-kit`.

Create a GitHub OAuth app for `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`
(callback URL `http://localhost:3000/api/auth/callback/github` for local dev).

## Database commands

```bash
npm run db:generate   # generate SQL migrations from schema.ts
npm run db:migrate    # apply migrations
npm run db:push       # push schema directly (good for dev)
npm run db:studio     # open Drizzle Studio
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add the same env vars from `.env.example` in the Vercel project settings.
4. Update your GitHub OAuth app callback URL to your Vercel domain.

## Project structure

```
src/
  app/
    api/auth/[...nextauth]/route.ts   # Auth.js route handlers
    layout.tsx
    page.tsx                          # portfolio landing page
    globals.css
  db/
    index.ts                          # Drizzle client (Supabase via postgres-js)
    schema.ts                         # Auth.js tables + `project` table
  auth.ts                             # NextAuth config
drizzle.config.ts
```
