# Cascade Quest

## 🎮 Play it now

1. Install the free **Expo Go** app ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Open this link on your phone (or scan the QR code there) to launch the game:

**https://expo.dev/preview/update?message=Initial%20release&updateRuntimeVersion=1.0.0&createdAt=2026-09-21T01%3A52%3A46.054Z&slug=cascade-quest&projectId=60e0ceb5-eb77-43ea-b46c-06cb85d89d73&group=5efdb5e5-a120-465e-aa6f-bb55e3f679f9**

Share that same link with anyone else who has Expo Go installed. Re-publish an update any time with `npx eas update --branch preview --environment preview` and share the new link it prints.

A mobile match-3 puzzle game built with Expo (React Native + TypeScript), designed around the engagement mechanics that drive retention in games like Candy Crush and Royal Match:

- **Core loop** — swap tiles, trigger matches and cascades, hit a score target within a move limit. Fast, frequent wins.
- **Progression & mastery** — a level map that unlocks sequentially, with 1-3 star ratings per level.
- **Loss aversion / return mechanic** — a 5-life energy system that regenerates over time, encouraging players to come back.
- **Streaks** — a daily play streak with milestone bonuses for returning consistently.
- **Social status** — a friends leaderboard (currently mock data) and unlockable player titles based on total stars earned.

## Tech stack

- Expo SDK 57 / React Native 0.86 / TypeScript
- `zustand` for state, persisted to `@react-native-async-storage/async-storage`
- `@react-navigation/native` (native-stack) for screens
- `react-native-reanimated` / `react-native-gesture-handler` (installed, available for richer animations)
- `expo-haptics` for tactile feedback

## Project structure

```
src/
  game/         match-3 engine (board generation, matching, cascades), theme
  data/         level definitions, leaderboard mock data, player titles
  state/        zustand player store (lives, streak, coins, progress)
  components/   TileView, BoardView, LivesBadge, StreakBanner
  screens/      Home (level map), Game (match-3 play), Leaderboard, Profile
  navigation/   React Navigation stack setup
```

## Running it

```bash
npm install
npm run start   # or: npm run web / npm run android / npm run ios
```

Scan the QR code with Expo Go on your phone, or press `w` to open in a browser.

## Notes

- The leaderboard is currently mock/local data — swap in a real backend (e.g. Firebase, Supabase) for real multiplayer leaderboards.
- No real-money monetization is implemented. The coin currency is a soft/progression currency only.
