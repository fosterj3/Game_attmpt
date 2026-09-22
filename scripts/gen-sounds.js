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

console.log('Done.');
