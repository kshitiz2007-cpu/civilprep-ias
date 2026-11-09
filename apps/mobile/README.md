# CivilPrep IAS — Android App

Native Android app built with Expo + React Native + TypeScript.

## Bootstrap

Run from the repository root after pnpm is installed:

```bash
pnpm create expo-app apps/mobile --template default@sdk-58
```

Keep the generated Expo app inside this workspace. Then add the shared token package where a React Native-compatible token adapter is needed. Do not import web-only CSS into native screens; consume the typed values from `@civilprep/design-tokens`.

## Shared experience

- Same cream, terracotta, sage and forest-green identity.
- Native-feeling navigation and touch targets.
- Offline-aware reading, revision and downloads.
- Shared domain contracts; platform-specific UI components.
