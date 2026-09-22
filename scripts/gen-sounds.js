// One-off generator for simple procedural WAV sound effects (no external assets/licensing).
// Run with: node scripts/gen-sounds.js
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

function writeWav(filename, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
  console.log('wrote', filename, `${(numSamples / SAMPLE_RATE).toFixed(2)}s`);
}

function silence(seconds) {
  return new Array(Math.round(seconds * SAMPLE_RATE)).fill(0);
}

// envelope: linear attack, exponential-ish decay
function envelope(n, attackN, decayPow = 2) {
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    let amp;
    if (i < attackN) amp = i / attackN;
    else amp = Math.pow(1 - (i - attackN) / (n - attackN), decayPow);
    out[i] = amp;
  }
  return out;
}

function tone(freqStart, freqEnd, seconds, { wave = 'sine', attack = 0.05, decayPow = 2, volume = 0.5 } = {}) {
  const n = Math.round(seconds * SAMPLE_RATE);
  const env = envelope(n, Math.round(attack * n), decayPow);
  const out = new Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const freq = freqStart + (freqEnd - freqStart) * t;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    let s;
    if (wave === 'square') s = Math.sign(Math.sin(phase));
    else if (wave === 'triangle') s = (2 / Math.PI) * Math.asin(Math.sin(phase));
    else s = Math.sin(phase);
    out[i] = s * env[i] * volume;
  }
  return out;
}

function mix(...tracks) {
  const len = Math.max(...tracks.map((t) => t.length));
  const out = new Array(len).fill(0);
  for (const t of tracks) {
    for (let i = 0; i < t.length; i++) out[i] += t[i];
  }
  return out;
}

function concat(...parts) {
  return parts.reduce((a, b) => a.concat(b), []);
}

// --- tap: soft short click for selecting a tile ---
writeWav('tap.wav', tone(700, 620, 0.05, { attack: 0.02, decayPow: 3, volume: 0.35 }));

// --- invalid: low buzz for a rejected swap ---
writeWav(
  'invalid.wav',
  tone(180, 140, 0.16, { wave: 'square', attack: 0.02, decayPow: 1.5, volume: 0.25 })
);

// --- pop: match clear ---
writeWav('pop.wav', tone(420, 880, 0.13, { attack: 0.01, decayPow: 2.5, volume: 0.45 }));

// --- combo: bigger/cascading match clear, brighter + slight double hit ---
writeWav(
  'combo.wav',
  concat(
    tone(520, 1040, 0.09, { attack: 0.01, decayPow: 2.5, volume: 0.4 }),
    tone(700, 1300, 0.12, { attack: 0.01, decayPow: 2.2, volume: 0.5 })
  )
);

// --- win: ascending major arpeggio ---
writeWav(
  'win.wav',
  concat(
    tone(523.25, 523.25, 0.14, { attack: 0.01, decayPow: 2, volume: 0.4 }), // C5
    tone(659.25, 659.25, 0.14, { attack: 0.01, decayPow: 2, volume: 0.4 }), // E5
    tone(783.99, 783.99, 0.22, { attack: 0.01, decayPow: 1.5, volume: 0.45 }) // G5
  )
);

// --- lose: descending buzz ---
writeWav(
  'lose.wav',
  tone(320, 120, 0.45, { wave: 'triangle', attack: 0.02, decayPow: 1.2, volume: 0.35 })
);

// --- fire: dramatic ignition whoosh + sting for Blitz "On Fire" ---
writeWav(
  'fire.wav',
  concat(
    tone(160, 950, 0.32, { wave: 'triangle', attack: 0.04, decayPow: 1, volume: 0.5 }),
    tone(1300, 1300, 0.05, { attack: 0.005, decayPow: 2, volume: 0.55 }),
    tone(1000, 1000, 0.05, { attack: 0.005, decayPow: 2, volume: 0.5 }),
    tone(1500, 1500, 0.18, { attack: 0.005, decayPow: 1.6, volume: 0.6 })
  )
);

// --- newbest: extra-grand fanfare for a new Blitz high score ---
writeWav(
  'newbest.wav',
  concat(
    tone(523.25, 523.25, 0.1, { attack: 0.005, decayPow: 2, volume: 0.4 }),
    tone(659.25, 659.25, 0.1, { attack: 0.005, decayPow: 2, volume: 0.42 }),
    tone(783.99, 783.99, 0.1, { attack: 0.005, decayPow: 2, volume: 0.45 }),
    tone(1046.5, 1046.5, 0.3, { attack: 0.005, decayPow: 1.3, volume: 0.55 })
  )
);

// --- beep: countdown tick (3, 2, 1) before a Blitz run starts ---
writeWav('beep.wav', tone(720, 720, 0.14, { attack: 0.01, decayPow: 2.2, volume: 0.45 }));

// --- go: bright confirm chime when the Blitz countdown finishes ---
writeWav(
  'go.wav',
  concat(
    tone(660, 660, 0.09, { attack: 0.005, decayPow: 2, volume: 0.45 }),
    tone(990, 990, 0.22, { attack: 0.005, decayPow: 1.4, volume: 0.55 })
  )
);

// --- tick: urgent clock tick for the last 5 seconds of a Blitz run ---
writeWav('tick.wav', tone(1150, 1050, 0.06, { wave: 'square', attack: 0.005, decayPow: 2.5, volume: 0.3 }));

// --- in-play Blitz music: three original, looping arcade-rhythm tiers
// (melody + bassline + kick/snare/hihat) that ramp up in tempo/energy as
// time runs out (calm -> medium -> intense). Bouncy synth-arpeggio feel in
// the spirit of Tetris Attack's puzzle-music style, but wholly original
// notes/rhythm - not a reproduction of any existing game's music. ---
const NOTE = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
};

function note(freq, seconds, opts) {
  return tone(freq, freq, seconds, opts);
}

// White-noise burst (envelope-shaped) - used for hi-hats/snares, since this
// generator has no real percussion samples.
function noiseHit(seconds, { attack = 0.001, decayPow = 3, volume = 0.4, seed = 1 } = {}) {
  const n = Math.round(seconds * SAMPLE_RATE);
  const env = envelope(n, Math.round(attack * n), decayPow);
  const out = new Array(n);
  let s = (seed * 2654435761) >>> 0;
  for (let i = 0; i < n; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const r = (s / 0xffffffff) * 2 - 1;
    out[i] = r * env[i] * volume;
  }
  return out;
}

function kickHit(seconds, volume = 0.5) {
  return tone(160, 45, seconds, { wave: 'sine', attack: 0.002, decayPow: 1.6, volume });
}

// Builds one bar-loop of `steps.length` equal-length steps by layering a
// melody line, a bassline, and a simple drum pattern (kick/snare/hat), all
// sharing the same step grid so the mixed track loops cleanly.
function buildLoop({ step, melody, bass, kicks, snares, hats, opts = {} }) {
  const {
    melodyWave = 'triangle',
    bassWave = 'sine',
    melodyVolume = 0.3,
    bassVolume = 0.28,
    kickVolume = 0.5,
    snareVolume = 0.32,
    hatVolume = 0.14,
  } = opts;
  const steps = melody.length;

  const melodyTrack = concat(
    ...melody.map((f) =>
      f ? note(f, step, { wave: melodyWave, attack: 0.008, decayPow: 1.6, volume: melodyVolume }) : silence(step)
    )
  );
  const bassTrack = concat(
    ...bass.map((f) =>
      f ? note(f, step, { wave: bassWave, attack: 0.004, decayPow: 1.9, volume: bassVolume }) : silence(step)
    )
  );
  const drumTrack = concat(
    ...Array.from({ length: steps }, (_, i) => {
      let layer = silence(step);
      if (kicks.includes(i)) layer = mix(layer, kickHit(step, kickVolume));
      if (snares.includes(i)) layer = mix(layer, noiseHit(step, { decayPow: 2.4, volume: snareVolume, seed: 7 }));
      if (hats.includes(i)) layer = mix(layer, noiseHit(step, { decayPow: 4.5, volume: hatVolume, seed: 3 }));
      return layer;
    })
  );

  return mix(melodyTrack, bassTrack, drumTrack);
}

const { C3, D3, E3, F3, G3, A3, B3, C4, D4, E4, F4, G4, A4, B4, C5, D5, E5 } = NOTE;

// calm: laid-back bounce, sparse hats, root-note bass on the downbeats.
writeWav(
  'music_calm.wav',
  buildLoop({
    step: 0.155,
    melody: [C4, E4, G4, E4, C4, E4, A4, G4, F4, A4, C5, A4, F4, G4, E4, D4],
    bass: [C3, null, null, null, C3, null, null, null, F3, null, null, null, G3, null, null, null],
    kicks: [0, 8],
    snares: [4, 12],
    hats: [0, 4, 8, 12],
    opts: {
      melodyWave: 'triangle',
      bassWave: 'sine',
      melodyVolume: 0.26,
      bassVolume: 0.24,
      kickVolume: 0.4,
      snareVolume: 0.22,
      hatVolume: 0.08,
    },
  })
);

// medium: brighter square-lead, four-on-the-floor kick, steady 8th-note hats.
writeWav(
  'music_medium.wav',
  buildLoop({
    step: 0.125,
    melody: [C4, E4, G4, C5, B4, G4, E4, G4, F4, A4, C5, D5, C5, A4, F4, G4],
    bass: [C3, null, C3, null, F3, null, F3, null, G3, null, G3, null, C3, null, C3, null],
    kicks: [0, 4, 8, 12],
    snares: [4, 12],
    hats: [0, 2, 4, 6, 8, 10, 12, 14],
    opts: {
      melodyWave: 'square',
      bassWave: 'triangle',
      melodyVolume: 0.26,
      bassVolume: 0.24,
      kickVolume: 0.48,
      snareVolume: 0.3,
      hatVolume: 0.14,
    },
  })
);

// intense: fast, syncopated, walking bass, hats on every 8th plus off-beat
// snare accents - the "clock's almost out" push.
writeWav(
  'music_intense.wav',
  buildLoop({
    step: 0.1,
    melody: [C5, G4, E5, G4, C5, D5, E5, D5, C5, A4, C5, E5, D5, B4, D5, G4],
    bass: [C3, C3, null, E3, F3, F3, null, A3, G3, G3, null, B3, C3, C3, null, E3],
    kicks: [0, 3, 6, 8, 11, 14],
    snares: [4, 12],
    hats: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    opts: {
      melodyWave: 'square',
      bassWave: 'square',
      melodyVolume: 0.26,
      bassVolume: 0.22,
      kickVolume: 0.5,
      snareVolume: 0.32,
      hatVolume: 0.1,
    },
  })
);

console.log('Done.');
