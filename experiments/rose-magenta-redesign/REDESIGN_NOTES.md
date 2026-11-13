# Gyankunj IAS — Rose Atelier redesign

This source package is the first implementation pass of the Rose Atelier visual system.

## Visual system
- Light rose / blush / warm ivory foundation with champagne-gold and magenta accents.
- Shared CSS tokens are applied at the root so existing student, quiz, resource, history, leaderboard and admin routes inherit the new theme.
- Glass surfaces use softer borders, warm shadows and lower-contrast backgrounds for long study sessions.
- Kinetic display typography is provided through `.kinetic-title`, `.kinetic-gradient` and `.kinetic-eyebrow`.
- Motion is restrained and automatically disabled for users who request reduced motion.
- Reading scale controls remain available in the ambience selector.

## Icon system
- Added the official Hugeicons React renderer and free icon package.
- `components/BrandMark.tsx` demonstrates the shared Hugeicons brand mark. Existing Lucide icons are retained temporarily in legacy screens to avoid breaking their current icon references; migrate route-by-route to Hugeicons as the next pass.

## Install and run
```bash
npm install
npm run build
npm run start
```

## Deployment root
When this folder is committed directly under `experiments/rose-magenta-redesign`, set the Render Root Directory to:

```text
experiments/rose-magenta-redesign
```

Do not add an extra hash-named parent directory around the project files.
