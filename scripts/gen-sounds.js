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

// --- in-play Blitz music: two original, looping "stealth-thriller" ambient
// tiers - a sparse minor-key drone with a soft resting-heartbeat pulse and
// an occasional plucked motif underneath, meant to stay unobtrusive and
// support focus/thinking rather than compete for attention. The intense
// tier (final countdown only) keeps the same instruments/motif but races
// the pulse, bends the drone upward, and swaps in a dissonant tritone pluck
// interval to raise tension as time runs out. Original composition, not a
// reproduction of any existing game's music. ---
const NOTE = {
  A2: 110.0,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  Ds4: 311.13,
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

// Concatenates `parts` then pads (or trims) with silence to exactly
// `totalSeconds`, so every layer of a loop lines up sample-for-sample and
// the loop repeats without a seam.
function padTo(totalSeconds, ...parts) {
  const combined = concat(...parts);
  const targetN = Math.round(totalSeconds * SAMPLE_RATE);
  if (combined.length >= targetN) return combined.slice(0, targetN);
  return combined.concat(silence((targetN - combined.length) / SAMPLE_RATE));
}

// A soft low double-thump ("lub-dub") like a resting heartbeat - the
// tension pulse under both music tiers.
function heartbeat(seconds, volume = 0.3) {
  return padTo(
    seconds,
    tone(90, 55, seconds * 0.16, { wave: 'sine', attack: 0.002, decayPow: 1.4, volume }),
    silence(seconds * 0.1),
    tone(80, 48, seconds * 0.14, { wave: 'sine', attack: 0.002, decayPow: 1.4, volume: volume * 0.85 })
  );
}

// A short, quiet plucked note - the sparse "thinking" motif.
function pluck(freq, seconds, volume = 0.2) {
  return note(freq, seconds, { wave: 'triangle', attack: 0.004, decayPow: 2.6, volume });
}

// calm: slow heartbeat, a quiet sustained low drone, and a sparse 3-note
// plucked motif spread far apart - meant to sit in the background.
const CALM_LOOP_SECONDS = 4;
writeWav(
  'music_calm.wav',
  mix(
    tone(NOTE.A2, NOTE.A2, CALM_LOOP_SECONDS, { wave: 'sine', attack: 1.2, decayPow: 0.6, volume: 0.11 }),
    concat(heartbeat(1, 0.26), heartbeat(1, 0.26), heartbeat(1, 0.26), heartbeat(1, 0.26)),
    padTo(
      CALM_LOOP_SECONDS,
      silence(0.4),
      pluck(NOTE.A3, 0.3, 0.18),
      silence(1.3),
      pluck(NOTE.C4, 0.3, 0.16),
      silence(1.0),
      pluck(NOTE.E4, 0.35, 0.17)
    )
  )
);

// intense: the same drone/pulse/pluck instruments, but the heartbeat races,
// the drone bends upward, and the pluck swaps to a dissonant tritone - only
// used in the final countdown of a run.
const INTENSE_LOOP_SECONDS = 2;
writeWav(
  'music_intense.wav',
  mix(
    tone(NOTE.A2, 132, INTENSE_LOOP_SECONDS, { wave: 'sine', attack: 0.3, decayPow: 0.3, volume: 0.15 }),
    concat(heartbeat(0.5, 0.4), heartbeat(0.5, 0.4), heartbeat(0.5, 0.4), heartbeat(0.5, 0.4)),
    padTo(
      INTENSE_LOOP_SECONDS,
      silence(0.15),
      pluck(NOTE.A3, 0.16, 0.24),
      silence(0.24),
      pluck(NOTE.Ds4, 0.16, 0.26),
      silence(0.24),
      pluck(NOTE.A3, 0.16, 0.24),
      silence(0.24),
      pluck(NOTE.Ds4, 0.16, 0.28)
    )
  )
);

// --- chain/combo escalation chimes: a bright, rising jingle that plays on
// top of the base pop/combo hit for chained cascades and big (4+) matches -
// each tier sits a step higher and adds another harmony note, echoing the
// escalating "connection" jingle from Tetris Attack. Purely original
// intervals/rhythm, not a reproduction of any existing game's chime. ---
function chainChime(tier) {
  const base = 587.33 * Math.pow(2, (tier - 1) / 7); // rises roughly a whole tone per tier
  const notes = [base, base * 1.2599]; // root + major third
  if (tier >= 3) notes.push(base * 1.4983); // + perfect fifth
  if (tier >= 5) notes.push(base * 2); // + octave sparkle
  return concat(
    ...notes.map((f, i) =>
      note(f, 0.07, { wave: 'sine', attack: 0.004, decayPow: 2.1, volume: 0.36 + i * 0.04 })
    )
  );
}

for (let tier = 1; tier <= 6; tier++) {
  writeWav(`chain${tier}.wav`, chainChime(tier));
}

console.log('Done.');
