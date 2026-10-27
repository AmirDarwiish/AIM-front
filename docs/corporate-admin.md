# LA Construction corporate administration

The administration workspace now follows the construction company identity and workflows. No manual Vercel deployment is used; publication follows the existing main-branch integration.

## Resulting workflows

- Dedicated navigation for projects, company services, project inquiries, the main slider, website pages, reusable media and company settings.
- Overview with project-inquiry counters, original company content checks, missing-information action and direct access to common tasks. Checks reflect available content; they are not traffic or revenue analytics.
- Construction inquiries use `requestType=2` for lists and counters. Business-join filters, business-category/city lookups and map-related copy are removed from this interface. Historical records and backend storage are not deleted.
- Content editing separates copy/language, media/links and visibility review. Arabic and English share one form state. New content starts hidden; saving a draft uses the existing `isActive` field.
- FAQ, statistics, values and process items present fields appropriate to their content. Before/after comparisons require both images; execution films require a video. Existing section keys are disabled when adding sections to prevent duplication.
- Project editor separates project details, cover/gallery and publication. It includes a readiness checklist, draft/published/featured filters and search. Publication requires an Arabic description and cover, as before. Drafts can be saved without those publication-only details.
- Editors prompt before discarding unsaved changes; company settings warn on navigation or page exit. Save actions remain available in the editor footer. Uploads block saves while they are in progress.
- Media selection supports library search, upload and drag/drop. Preview metadata survives changing editor steps. Existing upload limits and external video support are preserved.
- Settings group company identity, communication/address and official social links, with completeness indicators and accurate email/phone input types.

## Validation

- TypeScript and production build passed.
- Existing isolated dashboard integration: session privacy, CSRF, authenticated proxy, route restrictions, status changes, uploads, permission errors and logout.
- Existing public website and lead-flow regression passed.
- Desktop browser review of the dashboard, services editor, project editor and settings using temporary isolated fixture data. Exercised bilingual text retention, unsaved-close warning, saving a service draft, project search/empty results, blocking incomplete project publication, media selection with preview retention, saving a project draft and saving settings.
- Temporary preview fixtures, mock authentication and preview scripts were removed before the final production build. No fixture content was written to the production API.
- Responsive styles are included; a mobile viewport was not available in the current browser interface, so mobile visual QA remains unverified.

No API contract or database migration is required. Authentication identifiers and existing login credentials remain compatible with the backend. Company contact details still need genuine business values; the interface makes those gaps visible rather than inventing them.
