export type LeaderboardEntry = {
  id: string;
  name: string;
  value: number;
  isPlayer?: boolean;
};

const STAR_FRIENDS: LeaderboardEntry[] = [
  { id: 'f1', name: 'Maya', value: 41 },
  { id: 'f2', name: 'DeShawn', value: 33 },
  { id: 'f3', name: 'Priya', value: 27 },
  { id: 'f4', name: 'Oliver', value: 19 },
  { id: 'f5', name: 'Sana', value: 12 },
  { id: 'f6', name: 'Ben', value: 6 },
];

const BLITZ_FRIENDS: LeaderboardEntry[] = [
  { id: 'f1', name: 'Maya', value: 2140 },
  { id: 'f2', name: 'DeShawn', value: 1875 },
  { id: 'f3', name: 'Priya', value: 1530 },
  { id: 'f4', name: 'Oliver', value: 1120 },
  { id: 'f5', name: 'Sana', value: 740 },
  { id: 'f6', name: 'Ben', value: 310 },
];

export function buildLeaderboard(playerStars: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [...STAR_FRIENDS, { id: 'me', name: 'You', value: playerStars, isPlayer: true }];
  return entries.sort((a, b) => b.value - a.value);
}

export function buildBlitzLeaderboard(playerBestScore: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [
    ...BLITZ_FRIENDS,
    { id: 'me', name: 'You', value: playerBestScore, isPlayer: true },
  ];
  return entries.sort((a, b) => b.value - a.value);
}
