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

// A wider spread than the star leaderboard so Blitz's top-10/top-3/#1 reward
// tiers are meaningful, distinct milestones rather than trivially guaranteed.
const BLITZ_FRIENDS: LeaderboardEntry[] = [
  { id: 'b1', name: 'Maya', value: 3120 },
  { id: 'b2', name: 'Priya', value: 2870 },
  { id: 'b3', name: 'DeShawn', value: 2540 },
  { id: 'b4', name: 'Oliver', value: 2210 },
  { id: 'b5', name: 'Sana', value: 1980 },
  { id: 'b6', name: 'Ben', value: 1750 },
  { id: 'b7', name: 'Noah', value: 1520 },
  { id: 'b8', name: 'Grace', value: 1340 },
  { id: 'b9', name: 'Liam', value: 1180 },
  { id: 'b10', name: 'Ava', value: 1020 },
  { id: 'b11', name: 'Ethan', value: 890 },
  { id: 'b12', name: 'Zoe', value: 760 },
  { id: 'b13', name: 'Leo', value: 640 },
  { id: 'b14', name: 'Mia', value: 520 },
  { id: 'b15', name: 'Jack', value: 410 },
  { id: 'b16', name: 'Ruby', value: 320 },
  { id: 'b17', name: 'Finn', value: 240 },
  { id: 'b18', name: 'Iris', value: 160 },
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

/** 1-indexed rank of the player among the Blitz leaderboard for a given best score. */
export function getBlitzRank(playerBestScore: number): number {
  const entries = buildBlitzLeaderboard(playerBestScore);
  const index = entries.findIndex((e) => e.isPlayer);
  return index + 1;
}
