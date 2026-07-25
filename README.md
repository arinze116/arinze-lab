# Arinze Lab

Personal portfolio and brand site for Arinze — built with Next.js 15 (App Router), TypeScript, and Tailwind CSS, following the Arinze Lab PRD v1.0.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Content

No CMS — everything lives in the repo as MDX:

- `content/projects/*.mdx` — project case studies (frontmatter: title, summary, cover, stack, status, year, categories, github, demo, featured)
- `content/writing/*.mdx` — articles (frontmatter: title, description, date, category, tags)
- `content/research/*.mdx` — research papers (frontmatter: title, summary, topic, date)

To add new content, drop a new `.mdx` file with the right frontmatter into the matching folder — pages and the sitemap pick it up automatically at build time.

Cover/project images live in `public/images/`. The ones shipped here are placeholder SVGs — swap them for real screenshots and photos before launch.

## Contact form

`app/api/contact/route.ts` validates and (once wired up) sends submissions. It currently logs to the console. To actually deliver email:

1. `npm install resend`
2. Set `RESEND_API_KEY` in `.env.local` (see `.env.example`)
3. Uncomment the Resend block in `app/api/contact/route.ts`

## Design system

All design tokens (colors, spacing, radii, type scale) live in `app/globals.css` as CSS variables, matching PRD section 35–40. Update them there to restyle the whole site consistently.

## Deployment

Push to GitHub and import the repo on Vercel — no extra config needed. Add environment variables from `.env.example` in the Vercel project settings.

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

## Still to do before launch

- Swap placeholder SVGs for real photos/screenshots
- Wire up Resend (or another provider) for the contact form
- Add real social links and GitHub URLs in `lib/site.ts`
- Add analytics
- Replace `https://arinzelab.dev` in `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts` with the real domain
