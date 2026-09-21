export type ComboMessage = {
  label: string;
  points: number;
};

/**
 * Tetris-Attack-style feedback: bigger matches and chained cascades get an
 * escalating label alongside the points earned, so the player can feel the
 * difference between a plain 3-match and a big chain.
 */
export function getComboMessage(clearedCount: number, cascadeIndex: number, points: number): ComboMessage {
  const parts: string[] = [];
  if (cascadeIndex >= 3) parts.push('Unstoppable!');
  else if (cascadeIndex >= 2) parts.push('Combo x' + (cascadeIndex + 1) + '!');
  else if (cascadeIndex >= 1) parts.push('Chain!');

  if (clearedCount >= 7) parts.push('Incredible!');
  else if (clearedCount >= 6) parts.push('Awesome!');
  else if (clearedCount >= 5) parts.push('Great job!');
  else if (clearedCount >= 4) parts.push('Nice!');

  return { label: parts.join(' '), points };
}
