# All in Map — React landing website

React 19 + TypeScript, with the Vinext/Next-compatible starter. Responsive Arabic RTL and English LTR. The supplied six-service pin brand is included, along with local Arabic fonts.

## Backend connection
Set `apiBaseUrl` in `public/config.json` to the real HTTPS API origin. No JWT is required by the supplied public API contract. Do not put secrets in this public file. Backend must allow this website origin via CORS, including POST and Content-Type preflight.

When unset, the site is an explicitly non-submitting design preview. No sample leads are sent or fake success responses displayed. Store badges are hidden until the backend supplies valid URLs.

Endpoints:
- GET /api/public/website/home?lang=ar|en
- GET /api/public/lookups/business-categories?lang=ar|en
- GET /api/public/lookups/countries?lang=ar|en
- GET /api/public/lookups/cities?lang=ar|en&countryId={id}
- POST /api/public/leads with numeric requestType 1/2

`lib/public-api.ts` owns typed API contracts, request timeouts, URL sanitization, and error normalization. `app/page.tsx` contains presentation components and form state. All server content is rendered as text, without HTML injection. Server order and returned localized text are preserved. The site fetches fresh content on page load/language changes; no content is persisted client-side. Lead fields never enter localStorage.

Only backend response success confirms submission. 400 error/messages and field errors, 429 cooldown, 5xx and offline errors are handled. Lookups are required for business submissions; no invented IDs. Repeated clicks are blocked while submitting and after success. Form is retained on errors. Select the other request type to start a new request.

Brand sections in preview are authored marketing copy. Once home content loads, backend sections replace preview sections, even when empty. The illustrative map is not live geolocation and does not imply active merchant listings. Store URLs, coverage, statistics, ratings, customer quotes and live availability are not invented.

## Run
Use the package manager/lockfile supplied with this project. `pnpm dev`, `pnpm build`.

## Remaining live checks
The provided guide uses api.example.com as a placeholder. The actual API URL, CORS and runtime Swagger contract must be tested when available. No live lead submission has been made during authoring.

## Country and phone contract (frontend prepared ahead of backend)

- Countries return localized `[{ "id": 1, "name": "..." }]` with actual backend IDs.
- Cities accept required `countryId` and return only that country's cities as `[{ "id": 10, "name": "...", "countryId": 1 }]`. The frontend also checks each city's countryId before displaying it.
- A business lead (`requestType: 1`) includes required numeric `countryId` and `cityId`; the server must validate that the city belongs to the country. General inquiries do not require a business location.
- Both forms require a separate calling-code input and a national-number input. The API still receives a single `phone` string with a leading plus and country calling code, e.g. `+201012345678`. The user's phone country can differ from the business location.
- Arabic/Persian digits and number separators are normalized. National trunk zero is removed for the explicitly listed numbering plans in `lib/phone.ts`; other plans preserve it. Validation checks format and length, not number ownership or every national numbering plan.
- Until the countries endpoint and filtered cities contract are available, business submissions stay unavailable with a retry message. No country IDs or city assignments are invented; the contact form remains independently available.

## Public platform statistics

The home endpoint may include `statistics` with non-negative integer totals:
`{ "availableCountries": 0, "registeredBusinesses": 0, "users": 0, "requests": 0 }`.
The example documents field names only; provide actual database totals in production.
Count available application countries, registered business entities, users and requests respectively. Do not substitute marketing leads for service requests.
When all four valid totals are supplied, the site displays backend figures (including true zero values). Until then it shows an explicitly labeled illustrative set: 3 countries, 1,200 businesses, 8,500 users and 16,000 requests. These are design-preview figures, not verified platform metrics, and are editable in PlatformStats. The label disappears only when all four actual totals arrive. Values use Latin digits and count up on entering view, with reduced-motion support. Statistics use an imported CSS Module so their styles are bundled with the component.


## Admin dashboard

Open `/admin` on the same website. Arabic RTL dashboard with responsive navigation and the petrol/lime brand identity.

Included screens:
- Login/logout and a two-hour session. Uses existing backend admin accounts; no sample account is created.
- Overview with **actual landing lead counts**, new/in-progress/closed totals, and latest incoming leads. These are separate from the public app statistics.
- Leads: paginated search, request type/status/date filters, full details, status changes, internal notes and history. Status writes use numeric enum values (1–4), matching the current .NET JSON configuration. Reads support numeric and string values.
- Sliders: Arabic/English content, desktop/mobile images, alt text, button labels/link, order, activation, edit and deletion.
- Sections and nested items: Arabic/English content, images, order, visibility and deletion. `services` and `how` are reserved by the existing public page; other section keys render as CMS sections.
- Business categories and cities CRUD, including deactivation when records are referenced.
- Site names, logo, favicon and store links.
- Media uploads within content editors and a separate upload screen. The backend has no media-list endpoint, so that screen accurately lists only uploads made there in the current session. Existing media IDs can also be reused.

### Connection and session

The dashboard calls same-origin Next.js route handlers; these forward only explicitly allowed backend admin routes. JWT stays in a Secure (production), HttpOnly, SameSite=Strict cookie and is never returned to the browser or stored in localStorage. Mutations require an Origin matching the request Host and reject cross-site Fetch Metadata. Backend JWT validation and permission policies remain authoritative. 401 clears the session; 403 shows a permission message and retains the session. No role-to-permission mapping is invented because login does not expose permissions.

Set optional **server-only** `AIM_API_BASE_URL` to override the API origin; otherwise the dashboard uses `public/config.json` (currently `https://aim.runasp.net`). No extra browser CORS configuration is needed for dashboard requests. Deploy with Next.js server support on Vercel, not static export. API host must be reachable from Vercel, with the new backend version and database migrations deployed.

Image upload limit is 3 MiB, leaving room for multipart headers under [Vercel's 4.5 MB function payload limit](https://vercel.com/docs/functions/limitations#request-body-size). Accepted file extensions match backend: PNG/JPG/JPEG/WEBP/ICO.

### Backend dependencies

- Fix PermissionSeeder to add missing permission codes to existing databases; the current all-or-nothing seed may cause 403 for content, media or lead actions.
- Countries / city-country relationships and public app statistics are not present in this backend version. The dashboard states those dependencies and does not send unsupported settings or fabricate country IDs.
- A media-list endpoint is required for a complete persistent media library. Public home provides previews for active content; inactive images may show their saved ID until replaced.
- Applying frontend code does not deploy .NET changes or run database migrations.

### Validation

Run `npx tsc --noEmit`, `npx next build --webpack`, then `node tests/admin-integration.mjs`.
The integration test starts an isolated fixture API and production Next.js server. It verifies token privacy/cookie flags, login failures, CSRF rejection, authenticated proxying, route/method restrictions, numeric status writes, multipart uploads, 403 propagation, expiration and logout. Optional `ADMIN_TEST_PORT` and `ADMIN_FIXTURE_PORT` select local test ports. It never contacts or mutates the production API. Actual admin-account testing and browser visual verification still require the deployed service.
