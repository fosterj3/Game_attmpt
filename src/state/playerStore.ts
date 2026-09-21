import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { LEVELS } from '../data/levels';

const STORAGE_KEY = 'match3.player.v1';

export const MAX_LIVES = 5;
export const LIFE_REGEN_MINUTES = 20;
export const WAGER_HEARTS = 2;
export const WAGER_OVERFLOW_COIN_RATE = 15;

export type GameMode = 'arcade' | 'story';

type LevelProgress = {
  bestStars: 0 | 1 | 2 | 3;
  bestScore: number;
};

type PlayerState = {
  hydrated: boolean;
  coins: number;
  lives: number;
  lastLifeLostAt: number | null;
  currentStreak: number;
  lastPlayedDate: string | null;
  levelProgress: Record<number, LevelProgress>;
  unlockedLevelId: number;
  hasSeenHowToPlay: boolean;
  soundEnabled: boolean;
  activeMode: GameMode | null;
  blitzBestScore: number;

  hydrate: () => Promise<void>;
  recordDailyPlay: () => void;
  spendLife: () => boolean;
  regenLivesIfDue: () => void;
  completeLevel: (levelId: number, score: number, stars: 0 | 1 | 2 | 3) => number;
  totalStars: () => number;
  markHowToPlaySeen: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMode: (mode: GameMode | null) => void;
  submitBlitzScore: (score: number) => boolean;
  resolveWager: (won: boolean) => { heartsDelta: number; coinsBonus: number };
};

async function persist(state: Partial<PlayerState>) {
  const {
    hydrated,
    hydrate,
    recordDailyPlay,
    spendLife,
    regenLivesIfDue,
    completeLevel,
    totalStars,
    markHowToPlaySeen,
    setSoundEnabled,
    setMode,
    submitBlitzScore,
    resolveWager,
    ...rest
  } = state as PlayerState;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const dateA = new Date(a + 'T00:00:00Z').getTime();
  const dateB = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((dateB - dateA) / (1000 * 60 * 60 * 24));
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  hydrated: false,
  coins: 100,
  lives: MAX_LIVES,
  lastLifeLostAt: null,
  currentStreak: 0,
  lastPlayedDate: null,
  levelProgress: {},
  unlockedLevelId: 1,
  hasSeenHowToPlay: false,
  soundEnabled: true,
  activeMode: null,
  blitzBestScore: 0,

  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      set({ ...parsed, hydrated: true });
    } else {
      set({ hydrated: true });
    }
    get().regenLivesIfDue();
    get().recordDailyPlay();
  },

  recordDailyPlay: () => {
    const today = todayString();
    const { lastPlayedDate, currentStreak } = get();
    if (lastPlayedDate === today) return;

    let nextStreak = 1;
    if (lastPlayedDate) {
      const gap = daysBetween(lastPlayedDate, today);
      nextStreak = gap === 1 ? currentStreak + 1 : 1;
    }
    const next = { currentStreak: nextStreak, lastPlayedDate: today };
    set(next);
    persist({ ...get(), ...next });
  },

  regenLivesIfDue: () => {
    const { lives, lastLifeLostAt } = get();
    if (lives >= MAX_LIVES || lastLifeLostAt === null) return;
    const minutesElapsed = (Date.now() - lastLifeLostAt) / (1000 * 60);
    const livesToRegen = Math.floor(minutesElapsed / LIFE_REGEN_MINUTES);
    if (livesToRegen <= 0) return;
    const newLives = Math.min(MAX_LIVES, lives + livesToRegen);
    const stillLosing = newLives < MAX_LIVES;
    const next = {
      lives: newLives,
      lastLifeLostAt: stillLosing ? Date.now() - (minutesElapsed % LIFE_REGEN_MINUTES) * 60 * 1000 : null,
    };
    set(next);
    persist({ ...get(), ...next });
  },

  spendLife: () => {
    const { lives } = get();
    if (lives <= 0) return false;
    const newLives = lives - 1;
    const next = {
      lives: newLives,
      lastLifeLostAt: newLives < MAX_LIVES ? Date.now() : get().lastLifeLostAt,
    };
    set(next);
    persist({ ...get(), ...next });
    return true;
  },

  completeLevel: (levelId, score, stars) => {
    const { levelProgress, unlockedLevelId, coins } = get();
    const existing = levelProgress[levelId];
    const improved = !existing || stars > existing.bestStars || score > existing.bestScore;
    const newProgress = improved
      ? {
          ...levelProgress,
          [levelId]: {
            bestStars: Math.max(stars, existing?.bestStars ?? 0) as 0 | 1 | 2 | 3,
            bestScore: Math.max(score, existing?.bestScore ?? 0),
          },
        }
      : levelProgress;

    const nextUnlocked =
      stars > 0 && levelId === unlockedLevelId && levelId < LEVELS.length
        ? unlockedLevelId + 1
        : unlockedLevelId;

    const coinsEarned = stars * 25;
    const next = {
      levelProgress: newProgress,
      unlockedLevelId: nextUnlocked,
      coins: coins + coinsEarned,
    };
    set(next);
    persist({ ...get(), ...next });
    return coinsEarned;
  },

  totalStars: () => {
    return Object.values(get().levelProgress).reduce((sum, p) => sum + p.bestStars, 0);
  },

  markHowToPlaySeen: () => {
    set({ hasSeenHowToPlay: true });
    persist({ ...get(), hasSeenHowToPlay: true });
  },

  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    persist({ ...get(), soundEnabled: enabled });
  },

  setMode: (mode) => {
    set({ activeMode: mode });
    persist({ ...get(), activeMode: mode });
  },

  submitBlitzScore: (score) => {
    const { blitzBestScore } = get();
    const isNewBest = score > blitzBestScore;
    if (isNewBest) {
      set({ blitzBestScore: score });
      persist({ ...get(), blitzBestScore: score });
    }
    return isNewBest;
  },

  resolveWager: (won) => {
    const { lives, coins } = get();
    if (won) {
      const raw = lives + WAGER_HEARTS;
      const newLives = Math.min(MAX_LIVES, raw);
      const overflow = raw - newLives;
      const coinsBonus = overflow * WAGER_OVERFLOW_COIN_RATE;
      const next = {
        lives: newLives,
        coins: coins + coinsBonus,
        lastLifeLostAt: newLives >= MAX_LIVES ? null : get().lastLifeLostAt,
      };
      set(next);
      persist({ ...get(), ...next });
      return { heartsDelta: newLives - lives, coinsBonus };
    }

    const newLives = Math.max(0, lives - WAGER_HEARTS);
    const stillLosing = newLives < MAX_LIVES;
    const next = {
      lives: newLives,
      lastLifeLostAt: stillLosing ? get().lastLifeLostAt ?? Date.now() : null,
    };
    set(next);
    persist({ ...get(), ...next });
    return { heartsDelta: newLives - lives, coinsBonus: 0 };
  },
}));
