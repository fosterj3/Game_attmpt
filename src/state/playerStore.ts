import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { getBlitzRank } from '../data/leaderboard';
import { LEVELS, getLevel } from '../data/levels';
import { QuestId, getQuestDef, pickDailyQuestIds } from '../data/quests';
import { BoostId, getBoost } from '../data/shop';

const STORAGE_KEY = 'match3.player.v1';

export const MAX_LIVES = 5;
export const LIFE_REGEN_MINUTES = 20;
export const WAGER_HEARTS = 2;
export const WAGER_OVERFLOW_COIN_RATE = 15;
export const COINS_PER_LEFTOVER_MOVE = 10;
export const BLITZ_COMPLETION_COINS = 10;
export const BLITZ_NEW_BEST_COINS = 20;
export const BLITZ_TOP10_COINS = 100;
export const BLITZ_TOP3_COINS = 500;
export const BLITZ_FIRST_PLACE_COINS = 1000;
export const HEART_PRICE_COINS = 10000;

// Hard mode is harder to 3-star (see getEffectiveLevel in data/levels.ts),
// so its star-based coin payout is boosted to compensate; Easy is
// discounted for the same reason in reverse. Career titleStars (and the
// Stars leaderboard, which sums those) are NOT affected by difficulty at
// all - only these in-run coin numbers flex.
export const DIFFICULTY_COIN_MULTIPLIER: Record<Difficulty, number> = {
  easy: 0.8,
  medium: 1,
  hard: 1.3,
};

// Weighted-by-repetition reward table for the daily mystery chest - mostly
// modest payouts with an occasional big jackpot, so opening it stays a
// small surprise rather than a predictable fixed amount.
export const DAILY_CHEST_REWARDS = [20, 20, 30, 30, 40, 50, 50, 75, 100, 250];

export type GameMode = 'arcade' | 'story';
export type ThemeMode = 'dark' | 'light';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestProgress = { progress: number; claimed: boolean };

export type BlitzRunResult = {
  coinsEarned: number;
  isNewBest: boolean;
  rank: number;
  milestones: { top10: boolean; top3: boolean; first: boolean };
};

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
  musicEnabled: boolean;
  themeMode: ThemeMode;
  difficulty: Difficulty;
  activeMode: GameMode | null;
  blitzBestScore: number;
  bestBlitzRankAchieved: number | null;
  lastSeenBlitzRank: number | null;
  inventory: Record<BoostId, number>;
  dailyQuestDate: string | null;
  dailyQuestIds: QuestId[];
  dailyQuests: Partial<Record<QuestId, QuestProgress>>;
  lastChestOpenedDate: string | null;

  hydrate: () => Promise<void>;
  recordDailyPlay: () => void;
  spendLife: () => boolean;
  regenLivesIfDue: () => void;
  completeLevel: (
    levelId: number,
    score: number,
    stars: 0 | 1 | 2 | 3,
    movesRemaining?: number
  ) => { coinsEarned: number; bonusCoins: number };
  totalStars: () => number;
  markHowToPlaySeen: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setMode: (mode: GameMode | null) => void;
  completeBlitzRun: (score: number) => BlitzRunResult;
  resolveWager: (won: boolean) => { heartsDelta: number; coinsBonus: number };
  purchaseBoost: (id: BoostId) => boolean;
  consumeBoost: (id: BoostId) => boolean;
  purchaseHeart: () => boolean;
  ensureDailyQuests: () => void;
  recordQuestProgress: (id: QuestId, amount: number) => void;
  claimQuest: (id: QuestId) => number;
  canOpenDailyChest: () => boolean;
  openDailyChest: () => number;
  recordSeenBlitzRank: (rank: number) => void;
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
    setMusicEnabled,
    setThemeMode,
    setDifficulty,
    setMode,
    completeBlitzRun,
    resolveWager,
    purchaseBoost,
    consumeBoost,
    purchaseHeart,
    ensureDailyQuests,
    recordQuestProgress,
    claimQuest,
    canOpenDailyChest,
    openDailyChest,
    recordSeenBlitzRank,
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
  musicEnabled: true,
  themeMode: 'dark',
  difficulty: 'medium',
  activeMode: null,
  blitzBestScore: 0,
  bestBlitzRankAchieved: null,
  lastSeenBlitzRank: null,
  inventory: { hint: 0, extraMoves: 0, freezeTime: 0 },
  dailyQuestDate: null,
  dailyQuestIds: [],
  dailyQuests: {},
  lastChestOpenedDate: null,

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
    get().ensureDailyQuests();
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

  completeLevel: (levelId, score, stars, movesRemaining = 0) => {
    const { levelProgress, unlockedLevelId, coins, difficulty } = get();
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

    const bonusCoins = stars > 0 ? movesRemaining * COINS_PER_LEFTOVER_MOVE : 0;
    const starCoins = Math.round(stars * 25 * DIFFICULTY_COIN_MULTIPLIER[difficulty]);
    const coinsEarned = starCoins + bonusCoins;
    const next = {
      levelProgress: newProgress,
      unlockedLevelId: nextUnlocked,
      coins: coins + coinsEarned,
    };
    set(next);
    persist({ ...get(), ...next });
    return { coinsEarned, bonusCoins };
  },

  totalStars: () => {
    // Career/title stars: awarded once per level on first completion (any
    // win), scaled by difficulty - decoupled from the 0-3 in-level star
    // rating (which still only affects the coin bonus for that attempt).
    return Object.entries(get().levelProgress).reduce((sum, [id, p]) => {
      if (p.bestStars <= 0) return sum;
      const level = getLevel(Number(id));
      return sum + (level?.titleStars ?? 0);
    }, 0);
  },

  markHowToPlaySeen: () => {
    set({ hasSeenHowToPlay: true });
    persist({ ...get(), hasSeenHowToPlay: true });
  },

  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    persist({ ...get(), soundEnabled: enabled });
  },

  setMusicEnabled: (enabled) => {
    set({ musicEnabled: enabled });
    persist({ ...get(), musicEnabled: enabled });
  },

  setThemeMode: (mode) => {
    set({ themeMode: mode });
    persist({ ...get(), themeMode: mode });
  },

  setDifficulty: (difficulty) => {
    set({ difficulty });
    persist({ ...get(), difficulty });
  },

  setMode: (mode) => {
    set({ activeMode: mode });
    persist({ ...get(), activeMode: mode });
  },

  completeBlitzRun: (score) => {
    const { coins, blitzBestScore, bestBlitzRankAchieved } = get();
    const isNewBest = score > blitzBestScore;
    const newBestScore = isNewBest ? score : blitzBestScore;
    const rank = getBlitzRank(newBestScore);

    // Rank-tier bonuses are one-time achievements, not repeatable per
    // session - otherwise sitting at #1 on a mostly-static leaderboard
    // would pay out every single run regardless of that run's score.
    const milestones = { top10: false, top3: false, first: false };
    let milestoneCoins = 0;
    if (rank <= 10 && (bestBlitzRankAchieved === null || bestBlitzRankAchieved > 10)) {
      milestones.top10 = true;
      milestoneCoins += BLITZ_TOP10_COINS;
    }
    if (rank <= 3 && (bestBlitzRankAchieved === null || bestBlitzRankAchieved > 3)) {
      milestones.top3 = true;
      milestoneCoins += BLITZ_TOP3_COINS;
    }
    if (rank === 1 && (bestBlitzRankAchieved === null || bestBlitzRankAchieved > 1)) {
      milestones.first = true;
      milestoneCoins += BLITZ_FIRST_PLACE_COINS;
    }

    const coinsEarned = BLITZ_COMPLETION_COINS + (isNewBest ? BLITZ_NEW_BEST_COINS : 0) + milestoneCoins;
    const nextBestRank = bestBlitzRankAchieved === null ? rank : Math.min(bestBlitzRankAchieved, rank);

    const next = {
      blitzBestScore: newBestScore,
      bestBlitzRankAchieved: nextBestRank,
      coins: coins + coinsEarned,
    };
    set(next);
    persist({ ...get(), ...next });
    return { coinsEarned, isNewBest, rank, milestones };
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

  purchaseBoost: (id) => {
    const { coins, inventory } = get();
    const price = getBoost(id).price;
    if (coins < price) return false;
    const next = {
      coins: coins - price,
      inventory: { ...inventory, [id]: inventory[id] + 1 },
    };
    set(next);
    persist({ ...get(), ...next });
    return true;
  },

  consumeBoost: (id) => {
    const { inventory } = get();
    if (inventory[id] <= 0) return false;
    const next = { inventory: { ...inventory, [id]: inventory[id] - 1 } };
    set(next);
    persist({ ...get(), ...next });
    return true;
  },

  purchaseHeart: () => {
    const { coins, lives } = get();
    if (coins < HEART_PRICE_COINS || lives >= MAX_LIVES) return false;
    const newLives = lives + 1;
    const next = {
      coins: coins - HEART_PRICE_COINS,
      lives: newLives,
      lastLifeLostAt: newLives >= MAX_LIVES ? null : get().lastLifeLostAt,
    };
    set(next);
    persist({ ...get(), ...next });
    return true;
  },

  ensureDailyQuests: () => {
    const today = todayString();
    const { dailyQuestDate } = get();
    if (dailyQuestDate === today) return;
    const ids = pickDailyQuestIds(today);
    const quests: Partial<Record<QuestId, QuestProgress>> = {};
    for (const id of ids) quests[id] = { progress: 0, claimed: false };
    const next = { dailyQuestDate: today, dailyQuestIds: ids, dailyQuests: quests };
    set(next);
    persist({ ...get(), ...next });
  },

  recordQuestProgress: (id, amount) => {
    const { dailyQuestIds, dailyQuests } = get();
    if (!dailyQuestIds.includes(id)) return;
    const existing = dailyQuests[id];
    if (!existing || existing.claimed) return;
    const def = getQuestDef(id);
    const nextProgress =
      def.mode === 'max' ? Math.max(existing.progress, amount) : existing.progress + amount;
    const next = {
      dailyQuests: { ...dailyQuests, [id]: { ...existing, progress: Math.min(def.target, nextProgress) } },
    };
    set(next);
    persist({ ...get(), ...next });
  },

  claimQuest: (id) => {
    const { dailyQuests, coins } = get();
    const existing = dailyQuests[id];
    const def = getQuestDef(id);
    if (!existing || existing.claimed || existing.progress < def.target) return 0;
    const next = {
      dailyQuests: { ...dailyQuests, [id]: { ...existing, claimed: true } },
      coins: coins + def.reward,
    };
    set(next);
    persist({ ...get(), ...next });
    return def.reward;
  },

  canOpenDailyChest: () => get().lastChestOpenedDate !== todayString(),

  openDailyChest: () => {
    if (!get().canOpenDailyChest()) return 0;
    const reward = DAILY_CHEST_REWARDS[Math.floor(Math.random() * DAILY_CHEST_REWARDS.length)];
    const next = { lastChestOpenedDate: todayString(), coins: get().coins + reward };
    set(next);
    persist({ ...get(), ...next });
    return reward;
  },

  recordSeenBlitzRank: (rank) => {
    set({ lastSeenBlitzRank: rank });
    persist({ ...get(), lastSeenBlitzRank: rank });
  },
}));
