# LA Construction website and dashboard

This branch converts only the landing website. The mobile application is outside this repository and was not changed.

## Deployment order

1. Deploy the paired `AIM-landing-page` branch and apply `20261025190000_AddConstructionPortfolio` to the dedicated landing database. Back up the database first: the migration changes site branding and deactivates previous landing content, without deleting it.
2. Deploy this branch with Next.js server support. Preserve the existing server-only `AIM_API_BASE_URL`; it remains the compatible name of the API origin. `public/config.json` is the fallback. No secrets belong in public config.
3. Open `/admin` with an existing admin account. The API's existing CONTENT_VIEW / CONTENT_MANAGE and MEDIA_MANAGE permissions remain authoritative.

## Content

- **واجهة البداية:** desktop/mobile image, bilingual headline, description and CTA. With no active slider, a locally bundled architectural illustration and authored brand introduction appear; the illustration is not represented as an actual completed project.
- **أقسام الموقع:** `la-about`, `la-services`, `la-projects` (project-section title), `la-contact`. Service cards are the nested items of `la-services`. Other keys beginning `la-` render as additional sections; legacy All in Map sections do not render. Hidden About/Services/Contact sections stay hidden; the projects catalogue remains available independently.
- **المشاريع:** title, URL slug, summary, full description, location, category, year, cover, order and publication state. The English fields fall back to Arabic when omitted. Plain-text paragraphs preserve line breaks and are escaped, never injected as HTML.
- Gallery entries support uploaded photos, uploaded MP4/WebM, or HTTPS MP4/WebM / YouTube / Vimeo links; optional captions and video poster images; explicit reorder and remove actions. Saves replace the ordered gallery atomically.
- Uploads are limited to **3 MiB** to fit the existing Next/Vercel proxy. For larger videos upload to a video host and paste the URL. Use web-optimized images. Videos do not autoplay or load their player until selected; native video uses metadata preload and inline playback. Caption fields are image descriptions, not a substitute for accessible video subtitles; add subtitles through the selected video host when required.
- Projects list and detail pages render on the server on each request, including metadata; publication changes appear on a new request. Public lists are paginated. No fake project examples or company statistics are published. Until the API supplies la-prefixed construction sections, legacy content is ignored and the public contact form is disabled in preview.
- **إعدادات الموقع:** company email, phone, address, WhatsApp, Instagram, LinkedIn, logo and favicon. Store badges and app acquisition flows have been removed.
- **طلبات التواصل:** inquiries use the existing GeneralInquiry enum value 2 and appear in the existing leads workflow. The public form uses a same-origin proxy; the backend remains the rate limit authority. With the existing 10/minute per-IP policy, server-proxied contact inquiries share the frontend server IP quota; adjust this policy for the expected deployment traffic before a high-volume launch.

## Validation

```
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm exec next build --webpack
node tests/admin-integration.mjs
node tests/construction-integration.mjs
```

The fixture tests never contact production or create real inquiries. They verify SSR content and project rendering, inactive section behavior, XSS escaping, project metadata, image lazy loading, click-to-play media, 404, contact proxy protection, admin session privacy, permissions propagation and uploads. Mobile CSS covers 320px through desktop layouts, stacked galleries and forms, RTL/LTR, reduced motion and touch-sized controls. A live device/browser visual check remains required: the provided cloud browser cannot connect to this executor's localhost, and the successful Vercel preview deployment requires Vercel sign-in.

## Assets

`la-mark.svg` and favicon are editable vector recreations of the selected LA monogram direction. `architecture.svg` packages a compressed generated WebP hero in a text SVG container. It is a brand illustration, replaceable through the slider editor. The generated source image is not used as a claimed company project.


## Corporate pages update

The main navigation now opens separate `/about`, `/services`, `/services/{itemId}`, `/projects`, `/projects/{slug}` and `/contact` pages, with Arabic/English content and active navigation. The homepage is a concise overview. Existing CMS data is reused, with no new API schema or database migration.

- `la-about`: company title, introduction and photo on `/about`.
- `la-services`: service overview and nested service records; every active item receives a detail page. Inactive/removed items return 404.
- `la-values`: optional company principles section and cards on `/about`.
- `la-process`: optional steps/cards on service details.
- `la-contact`: contact page title and introduction; company contact settings remain in the existing settings screen.
- The `/contact` inquiry form adds service and location to the existing GeneralInquiry message. No outgoing email integration is implied; submissions remain visible in dashboard leads.
- Tajawal 400/500/700 is bundled as embedded WOFF in `app/tajawal.css`, with its SIL Open Font License at `public/assets/Tajawal-OFL.txt`. It is served from this application, without runtime Google Fonts requests. It applies to public content and dashboard, preserving the logo artwork.

TypeScript, production build, existing admin integration and expanded corporate integration tests cover the new routes and form contract. Browser visual/device QA remains limited by the preview environment described above.
