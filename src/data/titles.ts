export type Title = {
  minStars: number;
  name: string;
  emoji: string;
};

export const TITLES: Title[] = [
  { minStars: 0, name: 'Newcomer', emoji: '🌱' },
  { minStars: 1, name: 'Rising Star', emoji: '⭐' },
  { minStars: 25, name: 'Board Master', emoji: '🏆' },
  { minStars: 50, name: 'Cascade Legend', emoji: '👑' },
  { minStars: 100, name: 'Grandmaster', emoji: '💎' },
  { minStars: 200, name: 'Mythic', emoji: '🌌' },
];

export function titleForStars(stars: number): Title {
  let current = TITLES[0];
  for (const title of TITLES) {
    if (stars >= title.minStars) current = title;
  }
  return current;
}
