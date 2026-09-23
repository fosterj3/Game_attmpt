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
  background: '#F3F3FA',
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
