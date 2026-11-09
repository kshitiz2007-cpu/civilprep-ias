# Zenith Atelier — Phase 1 Foundation

## Purpose
Implement the foundation described in the CivilPrep IAS Zenith Atelier blueprint without replacing the existing monorepo or disturbing unrelated application surfaces.

## Phase 1 scope (Weeks 1–4)
1. Semantic design tokens for Dawn Sanctuary and Midnight Study.
2. Circadian theme selection contract (manual Dawn, manual Midnight, and Auto).
3. Canonical slug grammar and registry contract.
4. Public landing experience: 3-Depth Editorial Lens and Syllabus Constellation preview.
5. Three-step onboarding route contract.
6. Universal slug command palette contract (Cmd/Ctrl + K).

## Design tokens
| Semantic token | Dawn Sanctuary | Midnight Study |
|---|---|---|
| Canvas | #FAF7F2 | #11181C |
| Elevated surface | #F2ECE1 | #182228 |
| Primary ink | #1C242B | #E6E1D6 |
| Brand calm | #1F4E43 | #52B788 |
| Brand spark | #C85A32 | #F4A261 |
| Brand depth | #2B4C7E | #7494EA |

Typography: Instrument Serif / Noto Serif for editorial display, Plus Jakarta Sans / Inter with Noto Sans Devanagari for interface and bilingual reading, and JetBrains Mono for slugs and structured references.

## Canonical slug grammar
- Store a stable UUID as the canonical entity identity; a slug is its public, human-readable address.
- Canonical paths are lowercase ASCII, hyphen-delimited, namespace-qualified, and at most 64 characters per slug segment.
- Topic sub-sections use deterministic fragment anchors.
- Slug changes create aliases; old canonical paths permanently redirect (HTTP 308) to the current path.
- Relationships between knowledge entities use stable IDs, not URL strings.
- A single registry resolves paths to entity type, canonical UUID, parent path, and optional syllabus metadata.

## Initial route contracts
- / — public Sanctuary landing
- /onboarding/[step] — three-step calibration
- /desk — daily command desk (later phase)
- /syllabus/[stage]/[paper]/[unit]/[topic]
- /pulse/[date]/[editorial]
- /lexicon/[source]/[provision]
- /pyq/[stage]/[year]/[paper]/[question]
- /studio/mains/[paper]/[prompt]
- /arena/[stage]/[series]/[test]
- /vault/[handle]/[deck]/[note]

Route contracts are targets; do not expose incomplete routes as production-ready pages.

## Slug registry data contract
Initial logical fields:
- slug_path — unique canonical path / primary lookup key
- entity_type — constrained entity discriminator
- canonical_uuid — stable entity identifier
- parent_slug — optional hierarchy pointer
- gs_paper_code — optional syllabus mapping
- syllabus_weight — optional prioritization metadata
- updated_at — last registry update timestamp

A separate alias table should retain prior paths and point to canonical UUIDs. Enforce uniqueness and transactional updates in the eventual database migration.

## Engineering guardrails
- Keep the existing pnpm monorepo and app boundaries.
- Do not add production credentials or create a database project as part of this token-only foundation change.
- Do not invent real student analytics or seed fake learner performance.
- Keep server-only secrets out of client bundles.
- Respect reduced-motion preferences and keyboard accessibility.
- Treat Lighthouse and WCAG targets as verification gates, not assumed outcomes.

## Phase 1 acceptance gates
- Both themes render from semantic tokens without duplicated component styles.
- Auto theme can be overridden manually and respects local time only when the user selects Auto.
- Slug normalization and alias resolution have unit tests before database integration.
- Landing widgets are explorable without login.
- Onboarding can be completed with keyboard and touch.
- Command palette supports keyboard navigation and canonical slug lookup.
