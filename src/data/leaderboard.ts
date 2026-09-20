export type LeaderboardEntry = {
  id: string;
  name: string;
  stars: number;
  isPlayer?: boolean;
};

const FRIENDS: LeaderboardEntry[] = [
  { id: 'f1', name: 'Maya', stars: 41 },
  { id: 'f2', name: 'DeShawn', stars: 33 },
  { id: 'f3', name: 'Priya', stars: 27 },
  { id: 'f4', name: 'Oliver', stars: 19 },
  { id: 'f5', name: 'Sana', stars: 12 },
  { id: 'f6', name: 'Ben', stars: 6 },
];

export function buildLeaderboard(playerStars: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [
    ...FRIENDS,
    { id: 'me', name: 'You', stars: playerStars, isPlayer: true },
  ];
  return entries.sort((a, b) => b.stars - a.stars);
}
