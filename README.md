# All in Map — React landing website

React 19 + TypeScript, with the Vinext/Next-compatible starter. Responsive Arabic RTL and English LTR. The supplied six-service pin brand is included, along with local Arabic fonts.

## Backend connection
Set `apiBaseUrl` in `public/config.json` to the real HTTPS API origin. No JWT is required by the supplied public API contract. Do not put secrets in this public file. Backend must allow this website origin via CORS, including POST and Content-Type preflight.

When unset, the site is an explicitly non-submitting design preview. No sample leads are sent or fake success responses displayed. Store badges are hidden until the backend supplies valid URLs.

Endpoints:
- GET /api/public/website/home?lang=ar|en
- GET /api/public/lookups/business-categories?lang=ar|en
- GET /api/public/lookups/cities?lang=ar|en
- POST /api/public/leads with numeric requestType 1/2

`lib/public-api.ts` owns typed API contracts, request timeouts, URL sanitization, and error normalization. `app/page.tsx` contains presentation components and form state. All server content is rendered as text, without HTML injection. Server order and returned localized text are preserved. The site fetches fresh content on page load/language changes; no content is persisted client-side. Lead fields never enter localStorage.

Only backend response success confirms submission. 400 error/messages and field errors, 429 cooldown, 5xx and offline errors are handled. Lookups are required for business submissions; no invented IDs. Repeated clicks are blocked while submitting and after success. Form is retained on errors. Select the other request type to start a new request.

Brand sections in preview are authored marketing copy. Once home content loads, backend sections replace preview sections, even when empty. The illustrative map is not live geolocation and does not imply active merchant listings. Store URLs, coverage, statistics, ratings, customer quotes and live availability are not invented.

## Run
Use the package manager/lockfile supplied with this project. `pnpm dev`, `pnpm build`.

## Remaining live checks
The provided guide uses api.example.com as a placeholder. The actual API URL, CORS and runtime Swagger contract must be tested when available. No live lead submission has been made during authoring.
