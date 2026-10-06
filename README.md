# Summer Pandey: Portfolio

My personal portfolio site, built with Next.js and TypeScript, featuring an interactive pixel-art duck you can steer around the page and chat with.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)

Live site: [summerpandey.com](https://summerpandey.com)

## Overview

The site is a single page split into three side-by-side panels: **About**, **Welcome**, and **Works**. The Welcome panel is the starting point. A pixel-art duck floats on the water there and acts as both navigation and a chat companion. Project data and page content live in the React components, so the site runs without a database.

The repo also includes Auth.js (GitHub sign-in) and a Drizzle/Postgres schema. That backend is wired up but not yet used by any page.

## Features

- **Panel navigation**: horizontal scroll between About, Welcome, and Works, with keyboard shortcuts (`A`, `H`, `W`).
- **Interactive duck**: push the duck across the water by dragging, scrolling, swiping, or using the arrow keys. Holding it against the left or right edge navigates to About or Works. It turns to watch the cursor and faces the direction it's moving.
- **Duck chat**: click the duck to ask questions about my background. Replies come from a Groq-hosted model through `/api/duck-chat`, which validates input (500-character limit), sends the last 8 messages as context, and rate-limits each IP to 20 requests per 10 minutes. Without `GROQ_API_KEY`, the duck responds with a placeholder message.
- **Works page**: flippable project cards (summary on the front, details on the back) with category filters and hand-drawn line art for projects without a photo, plus a résumé strip and a downloadable résumé PDF.
- **About page**: bento-style grid with roles, project highlights, achievements, skills, and contact links.
- **Extras**: boot screen, cursor glow, and a Konami code easter egg that triggers confetti and an achievement toast. Animations respect `prefers-reduced-motion`.

## Tech Stack

| Layer     | Choice                                   |
| --------- | ---------------------------------------- |
| Framework | Next.js 15 (App Router), React 19        |
| Language  | TypeScript                               |
| Styling   | Tailwind CSS v4, inline styles           |
| Icons     | lucide-react                             |
| Chat API  | Groq (OpenAI-compatible chat endpoint)   |
| Auth      | Auth.js / NextAuth v5 (GitHub provider)  |
| Database  | Postgres (Supabase) with Drizzle ORM     |
| Hosting   | Vercel                                   |

## Getting Started

### Prerequisites

- Node.js 18.18 or newer
- npm

### Install and run

```bash
npm install
cp .env.example .env.local   # then fill in the values you need
npm run dev                  # http://localhost:3000
```

The site itself runs without any environment variables. The duck chat needs `GROQ_API_KEY`, and the auth/database features need the rest.

### Environment variables

All are listed in [`.env.example`](./.env.example).

| Variable             | Used by                                                     |
| -------------------- | ----------------------------------------------------------- |
| `GROQ_API_KEY`       | Duck chat (`/api/duck-chat`)                                |
| `DATABASE_URL`       | App database connection (Supabase transaction pooler)       |
| `DIRECT_URL`         | `drizzle-kit` migrations (direct connection)                |
| `AUTH_SECRET`        | Auth.js session signing (generate with `npx auth secret`)   |
| `AUTH_GITHUB_ID`     | GitHub OAuth app client ID                                  |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret                              |
| `NEXTAUTH_URL`       | Base URL for local auth (optional; Vercel sets it)          |

For local GitHub OAuth, set the callback URL to `http://localhost:3000/api/auth/callback/github`.

### Scripts

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Start the dev server                     |
| `npm run build`       | Create a production build                |
| `npm run start`       | Serve the production build               |
| `npm run lint`        | Run ESLint                               |
| `npm run db:generate` | Generate SQL migrations from the schema  |
| `npm run db:migrate`  | Apply migrations                         |
| `npm run db:push`     | Push the schema directly (handy for dev) |
| `npm run db:studio`   | Open Drizzle Studio                      |

## Project Structure

```
public/                      Résumé PDF and images
src/
  app/
    api/
      auth/[...nextauth]/    Auth.js route handlers
      duck-chat/             Groq-backed duck chat endpoint
    components/
      Portfolio.tsx          Panel layout, navigation, welcome page, duck
      AboutPage.tsx          About panel
      WorkPage.tsx           Works panel and project data
      DuckChat.tsx           Chat window
      ProjectArt.tsx         Project card illustrations
      fx.tsx                 Boot screen, confetti, toast, Konami hook
      theme.ts               Colors and fonts
    layout.tsx, page.tsx, globals.css
  auth.ts                    Auth.js config
  db/                        Drizzle client and schema
drizzle.config.ts
```

## Deployment

The site is deployed on Vercel. To deploy your own copy, import the repo in Vercel and add the environment variables above in the project settings. If you use GitHub sign-in, update the OAuth app's callback URL to your Vercel domain.
