# LA Construction — managed corporate website

Only the dedicated landing website and its dashboard are changed. No mobile application code or APIs are involved.

## Coordinated deployment

Deploy the paired AIM-landing-page API and apply its EF migrations through `20261025203000_ManagedHomepageContent` **before deploying this frontend**. Preserve existing production connection/JWT settings. This frontend deliberately does not publish placeholder company copy, fake services, testimonials, photos or statistics when the backend is unavailable.

The server-only `AIM_API_BASE_URL` remains the compatible origin setting; `public/config.json` is the fallback. Deploy as a Next.js application with server support. Public content is rendered on the server with no persistent content cache. New requests reflect publication and ordering changes.

## Dashboard

Use existing `/admin` accounts and CONTENT_VIEW / CONTENT_MANAGE / MEDIA_MANAGE permissions. The **الصفحات وأقسام الرئيسية** screen provides human-readable section types. Edit Arabic/English title, subtitle, description, image, CTA, display order, active status and homepage visibility. Use **العناصر** to edit a section's individual entries. Homepage visibility can hide an About or Services preview while retaining its independent page; active status hides the section everywhere. Page-only sections are controlled through active status.

| Section | Display and editing |
| --- | --- |
| `la-hero` | Homepage introduction. Own title/body/CTA and optional image. Active slider content can supply its image/title. No stock illustration is substituted automatically. |
| `la-about` | Company-page heading/intro plus optional homepage summary. |
| `la-about-story` | Company story heading/body/photo; if body is omitted the stored la-about body is used. |
| `la-values` | Company-page principles, authored as nested items. |
| `la-services` | Services overview and nested services with title, subtitle, full body and image. Active items have `/services/{id}` detail pages. |
| `la-process` | Service workflow heading and step cards. |
| `la-service-cta` | Editable service-detail inquiry panel. |
| `la-projects` | Homepage featured-project section. Select **مشروع مميز في الرئيسية** in each project's editor; only published featured projects appear. |
| `la-before-after` | Each entry needs a before image and after image, optional description and related project. |
| `la-testimonials` | Name/title, subtitle, written review, screenshot or video, optional video poster and related project. Text-only reviews are supported. |
| `la-films` | Site film entries with video URL/upload, cover, title, description and optional related project. |
| `la-stats` | Actual values in item titles and labels in descriptions. No computed or invented marketing totals. |
| `la-partners` | Genuine supplied customer/partner logo images. |
| `la-faq` | Questions in item titles and answers in descriptions. |
| `la-cta` | Shared final call to action, also positioned by homepage section order. |
| `la-contact` | Contact-page heading and introduction. |
| `la-footer` | Footer tagline, secondary heading/description and contact link. |

Other `la-` sections can render as generic homepage content. Empty testimonials, films, comparisons, statistics, FAQ and partners sections are omitted. A missing/hidden service returns 404. A failed content request displays a retry state rather than a fictitious service or company introduction.

## Media and mobile behavior

Client stories and site films use native horizontal scroll snapping, swipe, keyboard support, labelled previous/next controls and native modal dialogs. Screenshots expand at their natural aspect ratio. Videos are mounted only after a user opens the relevant story; closing the dialog unmounts the player. There is no autoplay or automatic carousel rotation.

Before/after comparisons use a native keyboard-accessible range input, with resettable selection for multiple projects. Homepage featured work uses a large leading project with two supporting projects on desktop and a single column on mobile. Proof sections preserve their content ratios and hide when their required media is missing.

Uploads remain limited to **3 MiB** for the existing Vercel/Next proxy. Use external HTTPS MP4/WebM or YouTube/Vimeo links for larger videos. Captions describe media; video subtitles are supplied through the chosen video host when needed. Only published related projects receive public links. Referenced comparison and video files cannot be deleted while still in use.

Tajawal 400/500/700 is bundled in `app/tajawal.css` with the SIL OFL at `public/assets/Tajawal-OFL.txt`. Icons are monochrome SVG. The existing architectural illustration remains a repository asset but is no longer used as an automatic substitute for company work.

## Contact

The `/contact` form records name, phone, optional email, service, location and message through GeneralInquiry type 2. Submissions appear in dashboard leads; no outgoing-email integration is implied. Existing JWT HttpOnly cookies, CSRF protection and admin proxy restrictions remain unchanged. The current backend per-IP inquiry limiter applies to the frontend server IP for server-proxied requests; account for expected traffic in hosting configuration.

## Validation

```
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm exec next build --webpack
node tests/admin-integration.mjs
node tests/construction-integration.mjs
```

The fixtures never contact production or create real leads. They cover CMS-only pages, hidden/empty/error states, section ordering, featured-project requests, comparison range rendering, review/film SSR and lazy players, FAQ, service details/404, inquiry protections, metadata, escaped content, admin sessions and content payload forwarding. Live browser/device interaction and visual QA remain unverified: the supplied cloud browser cannot reach executor localhost and Vercel previews require sign-in. Perform a real device pass after coordinated deployment.

## Content management review and media library

The existing editorial design on main is retained. This update adds CMS imagery to the company introduction and project summaries to portfolio cards.

The dashboard now groups sections by Home, About, Services, Contact and shared footer/CTA, with search and direct activation/homepage visibility controls. Text, bilingual subtitles/descriptions, buttons, image fields and numeric ordering remain editable in each section. Services, FAQ, values and process steps are edited through the section's Items button. Project descriptions, covers, gallery images/videos, featured/publication state and ordering remain in Projects. Logo and contact/social details remain in Settings.

The persistent media library replaces the session-only upload list. It supports image/video filters, name search and pagination, uploads and optional external HTTPS image links. Every media picker can browse existing files visually rather than requiring an ID. Deletion remains protected when a file is referenced.

Backend requirements: GET /api/admin/media with page/pageSize/type/search; POST /api/admin/media/external; Media.ExternalUrl and the showcase seed migration. Publish the backend before deploying this frontend so the new media operations are available. Seeded projects are clearly labelled design studies with reference imagery, not completed company commissions. No live administrator login was used.

Checks: TypeScript, production Next webpack build, dashboard proxy/authorization integration and public CMS/contact/project integration suites. Browser/device visual QA remains to be completed against the deployed version.
