# Gyankunj IAS — Rose Atelier

Rose Atelier is a visual redesign of the Gyankunj IAS Civil Services learning and evaluation application.

## Design direction
- Warm ivory and porcelain canvas with rose-pink, magenta and champagne-gold accents.
- Shared glass surfaces, soft borders, warm shadows and improved contrast for long study sessions.
- Kinetic display typography and restrained gradient motion.
- Responsive layouts and reduced-motion support.
- Ambience choices: Rose Atelier, Champagne Glow and Magenta Bloom; adjustable reading scale.
- Official Hugeicons React renderer and free icon pack added, with a reusable Hugeicons brand mark.

## Existing application capabilities
The existing route structure, Supabase client, student/admin areas, quiz engine, resource pages, history, leaderboard, content carousel, chat widget, PDF exporter and database setup files are retained as the functional foundation.

## Local setup
```bash
npm install
npm run dev
```

Production build:
```bash
npm run build
npm run start
```

## Render configuration
If this project is committed directly at `experiments/rose-magenta-redesign` in the repository:

- Runtime: Node
- Root Directory: `experiments/rose-magenta-redesign`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`

The source ZIP is structured with `package.json` at its root. Extract its contents directly into the project directory; do not wrap them in another hash-named folder.

## Notes
This is the first visual-system implementation pass. Existing Lucide icon references remain in legacy route components for compatibility while the Hugeicons foundation is introduced; those route icons can be migrated incrementally without changing page behavior.
