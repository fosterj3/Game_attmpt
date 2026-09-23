export type QuestId =
  | 'clearBigMatch'
  | 'chainCombo'
  | 'completeLevel'
  | 'playBlitzRuns'
  | 'igniteFire'
  | 'blitzScore';

export type QuestDef = {
  id: QuestId;
  label: string;
  description: string;
  emoji: string;
  target: number;
  reward: number;
  /**
   * 'increment': each recorded event adds `amount` (capped at target).
   * 'max': progress becomes the highest value ever recorded (capped at target)
   * - used for "reach a score of N" style goals rather than counted events.
   */
  mode: 'increment' | 'max';
};

export const QUEST_DEFS: QuestDef[] = [
  {
    id: 'clearBigMatch',
    label: 'Big Matches',
    description: 'Clear 3 matches of 4+ tiles',
    emoji: '💥',
    target: 3,
    reward: 30,
    mode: 'increment',
  },
  {
    id: 'chainCombo',
    label: 'Chain Reaction',
    description: 'Trigger 3 cascading chains',
    emoji: '⛓️',
    target: 3,
    reward: 30,
    mode: 'increment',
  },
  {
    id: 'completeLevel',
    label: 'Level Up',
    description: 'Complete 1 level',
    emoji: '🗺️',
    target: 1,
    reward: 25,
    mode: 'increment',
  },
  {
    id: 'playBlitzRuns',
    label: 'Blitz Warmup',
    description: 'Play 2 Blitz runs',
    emoji: '⏱️',
    target: 2,
    reward: 25,
    mode: 'increment',
  },
  {
    id: 'igniteFire',
    label: 'Catch Fire',
    description: "Get On Fire once in Blitz",
    emoji: '🔥',
    target: 1,
    reward: 40,
    mode: 'increment',
  },
  {
    id: 'blitzScore',
    label: 'Score Chaser',
    description: 'Score 400+ in a single Blitz run',
    emoji: '🎯',
    target: 400,
    reward: 40,
    mode: 'max',
  },
];

export function getQuestDef(id: QuestId): QuestDef {
  return QUEST_DEFS.find((q) => q.id === id)!;
}

/** Deterministic pseudo-random pick of 3 quests for a given date, so
 * everyone with the same date gets the same daily set and it doesn't
 * shuffle again until the date actually changes. */
export function pickDailyQuestIds(dateString: string): QuestId[] {
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed = (seed * 31 + dateString.charCodeAt(i)) >>> 0;
  }
  const pool = QUEST_DEFS.map((q) => q.id);
  const picked: QuestId[] = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const index = seed % pool.length;
    picked.push(pool[index]);
    pool.splice(index, 1);
  }
  return picked;
}
