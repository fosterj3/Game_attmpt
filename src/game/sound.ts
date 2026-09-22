import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

const sources = {
  tap: require('../../assets/sounds/tap.wav'),
  invalid: require('../../assets/sounds/invalid.wav'),
  pop: require('../../assets/sounds/pop.wav'),
  combo: require('../../assets/sounds/combo.wav'),
  win: require('../../assets/sounds/win.wav'),
  lose: require('../../assets/sounds/lose.wav'),
  fire: require('../../assets/sounds/fire.wav'),
  newbest: require('../../assets/sounds/newbest.wav'),
  beep: require('../../assets/sounds/beep.wav'),
  go: require('../../assets/sounds/go.wav'),
  tick: require('../../assets/sounds/tick.wav'),
} as const;

export type SoundName = keyof typeof sources;

const players: Partial<Record<SoundName, AudioPlayer>> = {};

function getPlayer(name: SoundName): AudioPlayer {
  let player = players[name];
  if (!player) {
    player = createAudioPlayer(sources[name]);
    players[name] = player;
  }
  return player;
}

let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted() {
  return muted;
}

export async function playSound(name: SoundName) {
  if (muted) return;
  try {
    const player = getPlayer(name);
    await player.seekTo(0);
    player.play();
  } catch {
    // Playback can fail in unsupported environments (e.g. autoplay-restricted
    // browsers before a user gesture) - never let a sound glitch break the game.
  }
}
