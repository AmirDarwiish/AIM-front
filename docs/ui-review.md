# Live UI review — LA Construction

Reviewed the public production website at https://aim-front-jade.vercel.app/?lang=ar in the cloud Chrome browser. Observed viewport: 1363 × 936 CSS pixels. Visited Home, Projects, one project detail, photo lightbox and Contact. The public homepage/portfolio and service imagery rendered from the API; no production form was submitted.

## Findings and changes

- Excessive section spacing and oversized headings made the page much longer than its content required. Reduce desktop section rhythm to 56–96 px, inner-page headings to a maximum of 68 px, and use a consistent mobile scale.
- Contact displayed a heading over an empty column when contact details were absent. Show the editable CMS process instead, or center the form if neither is available.
- Single-image lightboxes exposed pointless previous/next controls. Hide them for one image and lock background scrolling while the dialog is open.
- Relative CMS CTA links dropped the selected language. Preserve lang and existing URL parameters for local page links.
- Main navigation remained expanded until 760 px, creating a cramped intermediate range. Use the collapsible menu at 980 px, limit its height, support Escape/focus restoration, close on desktop resize and add an outside-click scrim.
- Full-length service descriptions overwhelmed homepage cards. Clamp summaries to three lines; full content remains available on the service page.
- Portfolio image ratios and inner-page introductions were inconsistent in size. Standardize index card ratios, reduce headline/intro spacing and retain the featured editorial layout.
- Add a charcoal footer with readable ivory text and bronze section labels, retaining the existing brand palette and Tajawal.

## Verification and limits

TypeScript, production webpack build and corporate/admin integration suites are required for this change. Desktop visual checks use the actual live browser. Responsive CSS was reviewed for 320, 360, 390, 760, 980 and desktop widths, but these are source-level checks: the cloud browser has no supported viewport/device emulation API. An attempted data-URL viewport harness was rejected by browser policy and was not retried through a workaround. No real phone/touch-device test is claimed. Live browser rendering and complete mobile verification should remain distinct in release notes.
