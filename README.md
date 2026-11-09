# CivilPrep IAS

**UPSC • PCS • Beyond**

A bilingual (Hindi + English) learning platform for UPSC CSE and State PCS preparation.

## Product environments

- Public website
- Student learning application
- Faculty workspace
- Admin Studio / CMS

## Monorepo

- `apps/web` — Next.js web application
- `apps/mobile` — Expo / React Native Android application
- `packages/design-tokens` — shared CivilPrep visual tokens
- `packages/domain` — shared domain types and utilities
- `docs` — product and engineering decisions

## Design constitution

The approved CivilPrep visual identity is consistent across web and Android:

- Warm cream / off-white surfaces
- Terracotta and burnt-orange primary actions
- Sage and forest-green progress/status accents
- Muted indigo used sparingly
- Dark charcoal typography
- Editorial serif headings paired with clean sans-serif UI
- Rounded surfaces, subtle borders and soft shadows
- 2D Indian architectural, heritage and landscape illustrations
- No 3D, clay, WebGL or unrelated neon/dark-purple themes

See [Design System](docs/design-system.md) and [Architecture](docs/architecture.md).

## Getting started

Requirements: Node.js 20.9+ and pnpm.

```bash
pnpm install
pnpm dev:web
```

The mobile application scaffold will be added under `apps/mobile` with Expo's supported workspace setup.

## Status

Phase 1 — repository foundation and design-system implementation.
