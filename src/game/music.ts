import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const tracks = {
  calm: require('../../assets/sounds/music_calm.wav'),
  medium: require('../../assets/sounds/music_medium.wav'),
  intense: require('../../assets/sounds/music_intense.wav'),
} as const;

export type MusicTier = keyof typeof tracks;

let player: AudioPlayer | null = null;
let currentTier: MusicTier | null = null;
let muted = false;

function ensurePlayer(): AudioPlayer {
  if (!player) {
    player = createAudioPlayer(tracks.calm);
    player.loop = true;
    player.volume = 0.35;
    player.muted = muted;
  }
  return player;
}

export function setMusicMuted(value: boolean) {
  muted = value;
  if (player) player.muted = value;
}

export function startMusic(tier: MusicTier = 'calm') {
  try {
    const p = ensurePlayer();
    currentTier = tier;
    p.replace(tracks[tier]);
    p.loop = true;
    p.play();
  } catch {
    // Ignore playback errors - music is a nice-to-have, never block gameplay.
  }
}

export function setMusicTier(tier: MusicTier) {
  if (tier === currentTier) return;
  try {
    const p = ensurePlayer();
    const wasPlaying = p.playing;
    currentTier = tier;
    p.replace(tracks[tier]);
    p.loop = true;
    if (wasPlaying) p.play();
  } catch {
    // ignore
  }
}

export function stopMusic() {
  currentTier = null;
  try {
    player?.pause();
    player?.seekTo(0);
  } catch {
    // ignore
  }
}
