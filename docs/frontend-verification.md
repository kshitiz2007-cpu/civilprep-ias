# Frontend implementation and verification plan

## Implemented preview environments

- Public landing page and visitor routes
- Student learning home and module navigation
- Faculty workspace shell, overview and management views
- Admin Studio shell, overview and content operations views
- Local preview authoring for content, current affairs and quiz configuration
- Local Mains answer editor with word count
- Expo React Native Android student home and tab navigation

## Preview-only boundaries

The current sample data is illustrative and must not be interpreted as real learner, course, payment, assessment or platform analytics. Preview interactions use local component state. No user credentials are transmitted or persisted. File selection is metadata-only until a secure storage backend exists.

## Frontend verification checklist

- [x] Web TypeScript typecheck
- [x] Android TypeScript typecheck
- [x] Next.js production build
- [ ] Browser smoke tests for every route
- [ ] Mobile device and emulator layout checks
- [ ] Keyboard and screen-reader accessibility checks
- [ ] Cross-browser checks
- [ ] Real timed test attempt and recovery tests
- [ ] Offline download and sync tests

## Route map

### Public
/, /about, /our-approach, /programs, /faculty, /resources, /current-affairs, /editorials, /pricing, /contact, /help, /login, /register

### Student
/app, /app/plan, /app/discover, /app/library, /app/current-affairs, /app/practice/daily-drill, /app/tests, /app/mains, /app/revision, /app/performance, /app/classroom, /app/resources, /app/community

### Faculty
/faculty, /faculty/courses, /faculty/classes, /faculty/content, /faculty/questions, /faculty/evaluation, /faculty/students, /faculty/doubts, /faculty/communication

### Admin
/admin, /admin/content, /admin/current-affairs, /admin/taxonomy, /admin/questions, /admin/quiz-builder, /admin/tests, /admin/resources, /admin/courses, /admin/students, /admin/faculty, /admin/subscriptions, /admin/analytics, /admin/settings

## Backend intentionally deferred

Do not add Supabase credentials or database dependencies until the frontend route and interaction testing milestone is complete. Then design the schema, RLS policies, role model, entitlements, storage and audit events before enabling production data.
