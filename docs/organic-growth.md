# LA Construction — organic acquisition

## Implemented

- Canonical production origin: `https://la-construction.online`.
- Arabic canonicals use clean URLs; English uses `?lang=en`. Each public page declares both language alternatives and its own canonical, including project pagination. Contact tracking/service parameters do not create extra indexed pages.
- Public robots rules, sitemap with both languages, CMS services and published project URLs. Admin pages carry `noindex, nofollow`.
- Organization, website and service JSON-LD uses published CMS data. No fabricated location, ratings, reviews or business statistics are added to structured data.
- Three bilingual project guides cover quotation comparison, renovation preparation and turnkey scope. Each includes a practical checklist, article/breadcrumb markup and a project inquiry link.
- Homepage and footer link to the guides. The hero includes a quotation link when its existing action goes elsewhere. Service detail pages always offer a quotation path, including when a CMS CTA has not been configured.
- Inquiry source captures the first campaign labels and external referring hostname for the browser session, plus the current guide. Source is appended to the existing lead message, preserving the API contract. No full referring URL, arbitrary query parameters or form data is stored in browser attribution.
- Successful submissions emit `la:inquiry-success` with service ID and language, without contact information. This is an integration hook, not a configured analytics service.

## Verified

`node node_modules/typescript/bin/tsc --noEmit`

`node node_modules/next/dist/bin/next build`

`node tests/construction-integration.mjs`

`node tests/admin-integration.mjs`

`node tests/lead-attribution.test.mjs`

Integration tests use an isolated fixture API: they do not create real sales inquiries. New coverage checks rendered canonicals, language alternatives, sitemap discovery, structured services, bilingual guides, missing guide 404 and admin noindex. Guide index and article layout were inspected in the browser at desktop width. Mobile CSS is present; an emulated mobile viewport was not available in the browser API.

## Business inputs and account work remaining

The live public home API returned null for phone, email, WhatsApp, address and social links during this review. Enter genuine company details through the existing dashboard. Confirm the actual service cities before creating location pages or adding local-business geographic data.

In the company's Google Search Console account, verify the production domain, submit `/sitemap.xml`, inspect representative Arabic/English service and guide URLs, and monitor indexing and search queries. No Search Console account was accessed or configured in this change.

If eligible, complete the company's Google Business Profile using its real operating location or service area, consistent contact details and original project photographs. Ask actual customers for honest reviews. Replace illustrative review previews with authorized customer evidence before promoting that section as social proof.

Select an analytics service and configure it to consume the successful-inquiry hook. Measure qualified inquiries and lead quality alongside organic visits; the event hook alone does not create a reporting dashboard.

Publish original project case studies through the existing CMS: scope, location if approved for publication, challenges, materials and photographs with permission. Link them to the corresponding services. Refresh guides based on real customer questions and Search Console queries, without invented costs or service locations.

## First measurement cycle

- Baseline: indexed pages, organic queries, organic visits if analytics is configured, inquiries and qualified inquiries.
- Weekly: inspect crawl/indexing problems and check which services/guides generate inquiries.
- Monthly: improve pages using actual search queries and sales feedback; publish useful original case studies.

This change creates discoverability and conversion foundations. Search rankings, inquiry volume and timing remain unmeasured until the account work and reporting are completed.

Deployment is delegated to the existing main-branch integration. No manual Vercel deployment is part of this change.
