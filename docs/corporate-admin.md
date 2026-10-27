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


## Full-page records and table workflows

Administration now uses real App Router paths instead of hash-only state: collection pages, `/new`, `/{id}/edit` and `/{id}`. Section item routes are nested under `/admin/sections/{sectionId}/items`. Legacy navigation hashes redirect into the equivalent collection path. Invalid IDs and unsupported operations return 404.

Projects, sections, content items, sliders and media use data tables. Content/project tables include visibility switches, per-request disabled state, success/error feedback and client pagination. Project visibility updates first read the full record and preserve its gallery. Content visibility updates refresh the record collection before writing to preserve its current fields. Failed writes keep the prior displayed state. Media has no visibility operation in the current backend contract, so no nonfunctional switch is shown for files.

Create/edit/detail screens are full pages with breadcrumbs and a return action. Saving navigates back to the collection using replace navigation so the completed form is not reopened by Back. Media uploads now use a dedicated creation page with explicit save. Only destructive confirmation dialogs remain modal.

Validation added: strict route parsing tests and HTTP checks for direct/deep routes, invalid IDs and inherited admin noindex. Isolated browser QA verified direct edit refresh, edit/save return, bilingual service draft creation, successful project/service visibility changes, failed service visibility keeping its previous state, retained project gallery, project/media/inquiry detail pages and the dedicated media creation page. Production data was not modified by these tests. Responsive styles are present; mobile viewport visual verification remains unavailable in the current browser API.


## Project review and adaptive workspace fix

The project editor now normalizes nullable API strings and gallery captions before validation or review. This prevents optional null text from reaching string methods in the publication step. Required publishing data (Arabic title, valid slug, cover, Arabic description) is distinct from optional translation/location fields.

The final editor step contains the selected cover and current text next to publication/featured switches. Media selection/upload returns resolved metadata to the editor so newly selected covers appear in the preview before saving. Missing requirements link back to the relevant editor step. Draft saving remains available, and step changes scroll the editor into view.

Sidebar rules were consolidated rather than layered over conflicting historical definitions. The workspace owns content scrolling, all normal-height sidebar actions fit, and the sidebar retains wheel/touch/keyboard scrolling on very short screens while hiding its rail. Mobile off-canvas navigation is inert while closed and the background is inert while the menu is open.

Regression coverage: nullable draft normalization, required/optional readiness and correction targets. Isolated browser checks exercised existing nullable drafts, empty English preview, a complete create → cover selection → preview → publish → table flow, and missing-cover correction. Responsive review used 390×844 and 1100×620 iframe viewports; the mobile document width remained 390px and the short desktop sidebar fit within 620px without an overflowing nav. Fixtures were removed before the final build.
