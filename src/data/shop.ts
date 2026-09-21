export type BoostId = 'hint' | 'extraMoves' | 'freezeTime';

export type BoostDef = {
  id: BoostId;
  name: string;
  emoji: string;
  price: number;
  description: string;
};

export const BOOSTS: BoostDef[] = [
  {
    id: 'hint',
    name: 'Hint',
    emoji: '💡',
    price: 30,
    description: 'Highlights a valid match on the board when you\'re stuck.',
  },
  {
    id: 'extraMoves',
    name: 'Extra Moves',
    emoji: '➕',
    price: 60,
    description: 'Adds 3 extra moves to your current attempt.',
  },
  {
    id: 'freezeTime',
    name: 'Freeze Time',
    emoji: '❄️',
    price: 50,
    description: 'Freezes the countdown timer for 10 seconds on timed levels.',
  },
];

export function getBoost(id: BoostId): BoostDef {
  return BOOSTS.find((b) => b.id === id)!;
}
