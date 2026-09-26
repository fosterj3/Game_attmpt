import { usePlayerStore } from '../state/playerStore';

export const TILE_COLORS = ['#FF5E5B', '#FFB84C', '#F9F871', '#6FDE6E', '#4C9AFF', '#C77DFF'];

export type ColorScheme = {
  background: string;
  surface: string;
  surfaceLight: string;
  primary: string;
  accent: string;
  success: string;
  danger: string;
  text: string;
  textMuted: string;
};

export const DARK_COLORS: ColorScheme = {
  background: '#12142B',
  surface: '#1E2148',
  surfaceLight: '#2A2F63',
  primary: '#7C5CFF',
  accent: '#FFB84C',
  success: '#4CD97B',
  danger: '#FF5E5B',
  text: '#F4F4FB',
  textMuted: '#9A9FD1',
};

export const LIGHT_COLORS: ColorScheme = {
  background: '#F5F3ED',
  surface: '#FFFFFF',
  surfaceLight: '#ECEBFA',
  primary: '#6A4CEF',
  accent: '#C97F0D',
  success: '#2FAE64',
  danger: '#D9433F',
  text: '#1B1D33',
  textMuted: '#666B94',
};

/** Default/static palette - only for the rare non-component context that
 * can't call hooks. Prefer `useColors()` inside components/screens so the
 * light/dark preference is respected. */
export const COLORS = DARK_COLORS;

export function useColors(): ColorScheme {
  const themeMode = usePlayerStore((s) => s.themeMode);
  return themeMode === 'light' ? LIGHT_COLORS : DARK_COLORS;
}

/** Adds alpha to a `#rrggbb` hex color - for tinted overlays that should
 * follow the current theme's background/surface instead of being a
 * hardcoded dark color that looks wrong in light mode. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
