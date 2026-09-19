# ArinzeLab Telegram CMS Implementation Plan

## 1. Current Architecture

ArinzeLab is a Next.js 15 App Router site using React 19, TypeScript, Tailwind CSS v4, and synchronous filesystem reads from `content/**/*.mdx`.

- Public routes are implemented directly under `app/`.
- Projects, writing, and research are stored as repository-local MDX.
- `lib/content.ts` parses frontmatter with `gray-matter` and derives reading time.
- Global identity and navigation currently live in `lib/site.ts`.
- Homepage, About, Now, Resume, Contact, legal copy, and shared layout copy are partly hardcoded in page/components.
- Public media is stored under `public/images/`.
- Metadata, sitemap, robots, JSON-LD, and generated social images are already present.
- There is no CMS, database, Telegram route, authentication layer, GitHub client, test suite, or tracked Vercel configuration.

The application is intentionally monochrome and editorial. Existing components and styles will remain the visual foundation.

## 2. Content Inventory

### MDX

- Projects: `contrax`, `dupload`, `vovorabot`.
- Writing: five articles, each using title, description, date, category, and tags frontmatter.
- Research: one entry using description/category fields that need normalization to the declared research model.

### Global/page content

The following currently contains visitor-visible hardcoded values and will be moved behind a validated structured configuration boundary:

- Site identity, description, contact details, social links, and navigation.
- Homepage hero, focus areas, section headings, selected content, working-now copy, and CTA.
- About intro, biography, capabilities, principles, current direction, portrait, and CTA.
- Now sections, items, and last-updated text.
- Shared navigation/footer links and availability copy.
- Global and page-level SEO defaults.

Legal, form validation, 404, search controls, and detail-page chrome remain code-owned system copy unless they become a concrete future CMS requirement.

### Media

- Portraits: `public/images/portrait.svg`, `portrait-square.svg`.
- Project covers: `public/images/projects/contrax.jpg`, `dupload.jpg`, `vovora.jpg`.
- Other default Next/Vercel assets remain unrelated to CMS content.

## 3. Proposed CMS Architecture

The first implementation uses GitHub as the durable source of truth and Vercel as the deployment layer:

```text
Telegram webhook
  -> webhook secret and admin allowlist
  -> command/session router
  -> runtime validation
  -> draft and preview
  -> explicit confirmation
  -> GitHub Contents API commit
  -> Vercel Git deployment
  -> existing Next.js filesystem content/config
```

New server-only areas:

- `lib/cms/schema.ts`: normalized schemas and content types.
- `lib/cms/validation.ts`: strict validation for slugs, URLs, content, media, and config.
- `lib/cms/parser.ts`: safe MDX/config serialization and repository inventory helpers.
- `lib/cms/publisher.ts`: validation, GitHub writes, descriptive commits, and deployment feedback.
- `lib/cms/history.ts`: GitHub commit history, inverse/revert commits, and backup snapshots.
- `lib/cms/media.ts`: safe media names, MIME/signature checks, SVG rejection/sanitization policy, and references.
- `lib/github/client.ts`: fixed-repository GitHub API client with no user-controlled paths.
- `lib/telegram/*`: Bot API client, authorization, command routing, sessions, keyboards, and messages.
- `app/api/telegram/webhook/route.ts`: Node.js webhook endpoint with secret-header verification.

Structured global content will live in `content/site.json`. Long-form content remains MDX. Existing page APIs will continue to consume the existing metadata shapes wherever possible.

## 4. Migration Strategy

1. Add `content/site.json` populated from the current visible site values.
2. Add a server-only site-config loader with fallback-safe parsing.
3. Update global layout, navigation, footer, homepage, About, and Now to consume structured config without changing the current visual language.
4. Normalize current MDX frontmatter at the loader boundary and validate slugs before filesystem access.
5. Add GitHub-backed publisher support for MDX and `content/site.json`.
6. Add Telegram workflows incrementally, starting with dashboard, homepage/about/now edits, content listing, project CRUD, and publish confirmation.
7. Add media upload/reference/delete safeguards and history/backup commands.
8. Add tests for authorization, validation, serialization, publishing, and media security.

The GitHub publisher will never write arbitrary filesystem paths. It will only write approved content paths and approved media paths. Direct production branch commits are supported by configuration, while a branch/PR workflow can be added later without changing validation or draft handling.

## 5. Security Considerations

- Verify `X-Telegram-Bot-Api-Secret-Token` before parsing or processing updates.
- Authorize numeric Telegram user IDs and, optionally, chat IDs. Display names and usernames are not authorization credentials.
- Keep Telegram, GitHub, and Vercel credentials server-only.
- Use fixed GitHub owner/repository/branch configuration.
- Accept only lowercase hyphenated slugs and approved content/media paths.
- Validate URL schemes; reject `javascript:`, `data:`, `file:`, protocol-relative, and malformed URLs.
- Keep Telegram-authored content in the existing escaped restricted renderer; do not compile untrusted MDX as executable JSX.
- Escape CMS values before JSON-LD script serialization.
- Validate image bytes, type, size, dimensions where available, and SVG content before committing.
- Require explicit confirmation for destructive actions and referenced-image deletion.
- Return generic Telegram errors with an operation ID; keep detailed failures in server logs without secrets.
- Add body limits, operation limits, and a small webhook rate limiter.
- Process-wide session/idempotency storage is only a local-development fallback. Production deployment must provide a durable session/idempotency adapter or an external store before relying on multi-step workflows at scale.

## 6. Files To Modify

- `lib/content.ts` and `types/content.ts`: validated normalized content boundary.
- `lib/site.ts`: config-backed site identity/navigation compatibility exports.
- `app/layout.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/now/page.tsx`: structured visitor-visible content.
- `components/layout/navbar.tsx`, `components/layout/footer.tsx`: config-backed navigation/social/contact values.
- `app/sitemap.ts`, route metadata where appropriate: preserve SEO while consuming validated values.
- `package.json`: CMS/test scripts and only necessary dependencies.
- `README.md`, `.env.example`: operation and deployment documentation.

## 7. New Files

- `content/site.json`
- `lib/site-content.ts`
- `lib/cms/*`
- `lib/github/*`
- `lib/telegram/*`
- `app/api/telegram/webhook/route.ts`
- `tests/*` or colocated unit tests, depending on the chosen test runner.

## 8. Testing Strategy

- Pure unit tests for slug, URL, frontmatter, structured config, SVG, and Telegram authorization validation.
- Webhook tests for invalid secret, unauthorized user, malformed update, cancellation, and duplicate update handling.
- Publisher tests using an injected/fake GitHub transport for create/update/delete and failure responses.
- Media tests for supported images, size limits, malformed signatures, path traversal, and dangerous SVG.
- Build verification with `npm run lint`, `npm run typecheck`, and `npm run build`.
- Production setup verification must include the real GitHub repository, branch, Vercel project, Node 20+ runtime, webhook secret, and deployment trigger.

## 9. Known Operational Constraint

The supplied workspace is not a Git checkout, so branch creation, commit inspection, and push are unavailable here. The implementation can add and validate the GitHub API integration, but repository/Vercel linkage and production webhook registration must be completed in the actual GitHub/Vercel project.
