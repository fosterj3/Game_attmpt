# Cascade Quest

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
