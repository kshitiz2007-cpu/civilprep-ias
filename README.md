# CivilPrep IAS

**UPSC • PCS • Beyond**

A bilingual (Hindi + English) learning platform for UPSC CSE and State PCS preparation.

## Product environments

- Public website
- Student learning application
- Faculty workspace
- Admin Studio / CMS

## Monorepo

- \`apps/web\` — Next.js web application
- \`apps/mobile\` — Expo / React Native Android application
- \`packages/design-tokens\` — shared CivilPrep visual tokens
- \`packages/domain\` — shared domain types and utilities
- \`docs\` — product and engineering decisions

## Design constitution

The web application now uses the approved **Rose Atelier** visual identity:

- Porcelain and soft rose surfaces
- Rose-magenta primary actions with champagne-gold accents
- Deep plum typography and Instrument Serif editorial headings
- DM Sans / Manrope product UI and Noto Sans Devanagari for Hindi
- Refined glass surfaces, soft borders and layered shadows
- Purposeful motion through Magic Bento, Gradient Text, Circular Carousel, Scroll Stack and Slide Commit
- Mobile-first layouts, reduced-motion support and accessible interaction

See [Design System](docs/design-system.md) and [Architecture](docs/architecture.md).

## Getting started

Requirements: Node.js 20.9+ and pnpm.

\`\`\`bash
pnpm install
pnpm dev:web
\`\`\`

## Status

Phase 1 — web visual-system foundation and shared platform structure.
