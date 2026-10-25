# LA Construction — Architectural Editorial Design Pass

## Purpose
Move the corporate website away from a generic brochure layout toward an architectural portfolio that leads with built work, imagery and craft. This work is isolated on `design/la-construction-editorial` until validation and review.

## Visual research
- [Snøhetta — Projects](https://www.snohetta.com/projects): project-first navigation, visual hierarchy, imagery with structured metadata. We adapt the **project storytelling**, not any artwork or layout wholesale.
- [Foster + Partners](https://www.fosterandpartners.com/): architecture as the primary visual subject; restrained corporate presentation.
- Architectural editorial direction: bold photographic hero, asymmetric portfolio rhythm, numbered portfolio labels, quiet typography and stone/charcoal/bronze palette.

## Design tokens
| Token | Value | Role |
|---|---|---|
| Ink | `#1B1D1A` | Headlines, primary buttons and dark CTA |
| Paper | `#F4F1E9` | Main canvas |
| Bronze | `#AA8B62` | Wayfinding, highlights and detail |
| Muted | `#666A62` | Body text |
| Gutter | `clamp(22px,5.3vw,96px)` | Editorial page margins |
| Section spacing | `clamp(76px,10vw,152px)` | Consistent sectional rhythm |

Typography stays on the repository's existing Tajawal font for Arabic compatibility. No unlicensed photography or generic claims, numbers, testimonials or project records have been added.

## Changed experience
| Area | Before | Design pass |
|---|---|---|
| Homepage hero | Standard heading over image | Large editorial type, stronger graded image, project-first CTA, visible scroll cue |
| Header | Static corporate header | Sticky, responsive header with scroll treatment and numbered mobile navigation |
| Portfolio | Repeating thumbnail cards | Asymmetric crops, visual indexing, full-width imagery where layouts permit, richer hover treatment |
| Homepage services | Text-only items | Optional photography from the *existing* CMS data; text-only fallback remains |
| Inner page intros | Compact headers | Expanded editorial titles, architectural watermark and clearer page hierarchy |
| Contact + CTA | Standard panels | Refined spacing and typographic hierarchy without changing submission logic |
| Accessibility | Existing semantic links / reduced motion | Retains existing semantics, adds keyboard-dismissable menu, descriptive scroll cue, reduced-motion animation fallback |

## Integrity and integration
- Keep `lib/construction-server.ts`, API contracts, forms and authorization untouched.
- All content is still read from the existing backend; images render only when a CMS record contains a sanitized URL.
- AR/EN and page routes are unchanged.
- CSS is scoped with `.la-site` to avoid the admin dashboard.
- `main` is unchanged until review.
- Homepage sections are still controlled by backend `la-*` section keys and their `showOnHome` flags.

## Validation status
- [x] Confirmed changed source files exist on the feature branch.
- [x] Verified imports, href targets and dynamic content bindings by source inspection.
- [ ] CI TypeScript check on the branch.
- [ ] CI production build.
- [ ] Desktop visual QA at 1440 and 1280 px.
- [ ] Tablet visual QA at 768 and 1024 px.
- [ ] Mobile visual QA at 360, 390 and 430 px in both languages.
- [ ] Verify live CMS image crops, availability and fallback states.
- [ ] Submit a real lead on an approved test backend only.
- [ ] Review Lighthouse performance and contrast before merge.

## Deployment caveat
The current public config still names `https://aim.runasp.net`. Confirm it is the intended LA Construction production API and serves `la-*` sections before approving a deployment. The design changes **do not** change this endpoint.

## Asset direction
Prefer photographs of actual company projects from the CMS. Each project's image should be a real, rights-cleared image, with a separate mobile crop for the homepage hero where available. Don't use stock material presented as completed client work.
