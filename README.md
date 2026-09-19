# Arinze Lab

Personal technical publication and lab for Arinze, built with Next.js 15 (App Router), TypeScript, and Tailwind CSS. The public site remains repository-backed MDX; the Telegram CMS publishes validated changes through the GitHub Contents API, after which Vercel deploys the commit.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Content and CMS

Global visitor-visible content lives in `content/site.json` and is edited through the Telegram CMS. Long-form content remains human-readable MDX:

- `content/projects/*.mdx` — project case studies (frontmatter: title, summary, cover, stack, status, year, categories, github, demo, featured)
- `content/writing/*.mdx` — articles (frontmatter: title, description, date, category, tags)
- `content/research/*.mdx` — research papers (frontmatter: title, summary/topic, date, tags)

Routine changes should be made through Telegram. The bot validates fields, shows a preview, requires explicit confirmation, and creates a descriptive `cms:` GitHub commit. Direct MDX edits remain supported for development and migration.

Cover/project images live in `public/images/`. The ones shipped here are placeholder SVGs — swap them for real screenshots and photos before launch.

## Contact form

`app/api/contact/route.ts` validates and sends submissions through Resend:

1. Set `RESEND_API_KEY` in `.env.local` (see `.env.example`)

## Design system

All design tokens (colors, spacing, radii, type scale) live in `app/globals.css` as CSS variables, matching PRD section 35–40. Update them there to restyle the whole site consistently.

## Telegram CMS deployment

Use Node.js 20 or newer. Configure the variables in `.env.example` in Vercel, including a least-privilege GitHub token, a long webhook secret, and the numeric Telegram administrator ID. For multi-step workflows on Vercel, configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; process memory is only a local-development fallback.

Register the production webhook against the stable Vercel URL with Telegram's secret token header. The route is `POST /api/telegram/webhook`. GitHub commits trigger Vercel through the repository integration. A successful bot response means the GitHub commit was created; it does not claim that the Vercel deployment is already ready.

## Commands

The bot supports `/start`, `/admin`, `/home`, `/about`, `/now`, `/navigation`, `/projects`, `/writing`, `/research`, `/addproject`, `/editproject`, `/deleteproject`, `/publishproject`, `/unpublishproject`, `/featureproject`, `/unfeatureproject`, `/addarticle`, `/editarticle`, `/deletearticle`, `/publisharticle`, `/unpublisharticle`, `/addresearch`, `/editresearch`, `/deleteresearch`, `/publishresearch`, `/unpublishresearch`, `/media`, `/settings`, `/seo`, `/history`, `/backup`, `/undo`, and `/cancel`.

## Structure

```
app/            routes (Home, About, Projects, Writing, Research, Now, Contact, Search, 404)
components/
  layout/       Navbar, Footer
  sections/     page-specific client components (filters, forms)
  ui/           Button, Badge, Card, ProjectCard, WritingCard, ResearchCard
content/        MDX content (projects, writing, research)
lib/            content loader, site config
types/          shared TypeScript types
public/images/  images and placeholder covers
```

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The workspace snapshot does not contain `.git`, so branch creation, commit inspection, and production GitHub/Vercel linkage must be completed in the actual repository checkout.
