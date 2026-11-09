# CivilPrep IAS — Architecture

## Initial technical direction

- Web: Next.js App Router, React and TypeScript.
- Android: Expo + React Native + TypeScript.
- Monorepo: pnpm workspaces.
- Backend: Supabase (PostgreSQL, Auth, Storage, Row Level Security and Edge Functions where appropriate).
- Hosting: web deployment on Vercel; Android builds through EAS.
- Shared packages: design tokens, domain contracts and validation utilities.

## Application boundaries

1. Public website
2. Student application
3. Faculty workspace
4. Admin Studio / CMS

## Domain boundaries

- Identity and access
- Exams and syllabus taxonomy
- Knowledge library and content
- Current affairs
- Practice and question bank
- Tests and attempts
- Mains writing and evaluation
- Revision and retention
- Classroom and courses
- Resources and downloads
- Community and moderation
- Entitlements and subscriptions
- Analytics and notifications

## Data principles

- Stable canonical IDs for topics and content.
- Exam-specific syllabus mappings reference shared canonical knowledge entities.
- Relationships use IDs, not URL strings.
- Backend entitlements and database RLS are authoritative.
- Student progress survives subscription expiry.
- All assessment attempts and revision events are auditable.
- Never seed production analytics with fabricated student performance.

## Security principles

- Keep service-role credentials server-side only.
- Use least-privilege Supabase RLS policies.
- Validate inputs at API boundaries.
- Record privileged admin actions in audit logs.
- Use signed URLs or controlled access for protected resources.
