// Beat Drop audio engine — techno-flavored procedural BGM + SFX. Same public
// API as the Piper engine (playSfx, startBgm, stopBgm, unlockAudio) and same
// SfxKey set, so the game-loop callers don't need to change.
//
// BGM: 128 BPM 4-on-the-floor with a kick on every quarter, off-beat open
// hi-hats, claps on 2 & 4, a closed-hat 16th underlay, an acid-style sub
// bass that slowly opens its lowpass cutoff over four bars, and a synth
// chord stab on every other bar. Reverb-like delay tail glues the kit.

type SfxKey =
  | 'bleat_short' | 'bleat_chain' | 'bark'
  | 'deliver_good' | 'deliver_bad' | 'whistle'
  | 'wolf_growl' | 'wolf_hit'
  | 'combo_up' | 'round_clear' | 'round_fail';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bgmGain: GainNode | null = null;
let bgmTimer: number | null = null;

// Reverb-ish feedback delay shared by BGM elements so the kit sits in one room.
let bgmFx: GainNode | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC: typeof AudioContext | undefined =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }
  return ctx;
}

export async function unlockAudio() {
  const c = ensureCtx();
  if (c && c.state === 'suspended') await c.resume();
}

// ---------------------------------------------------------------------------
// SFX primitives
// ---------------------------------------------------------------------------

function envelope(node: GainNode, peak: number, attack: number, decay: number, t0: number) {
  node.gain.setValueAtTime(0, t0);
  node.gain.linearRampToValueAtTime(peak, t0 + attack);
  node.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
}

function tone(freq: number, type: OscillatorType, dur: number, peak: number, t0: number, glideTo?: number, dst?: AudioNode) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glideTo), t0 + dur);
  envelope(g, peak, 0.01, dur, t0);
  osc.connect(g).connect(dst ?? master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur: number, peak: number, t0: number, lp = 2000, dst?: AudioNode) {
  if (!ctx || !master) return;
  const buf = ctx.createBuffer(1, Math.max(1, Math.ceil(ctx.sampleRate * dur)), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = lp;
  const g = ctx.createGain();
  envelope(g, peak, 0.005, dur, t0);
  src.connect(filt).connect(g).connect(dst ?? master);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

function noiseBandpass(dur: number, peak: number, t0: number, center: number, q: number, attack: number, dst?: AudioNode) {
  if (!ctx || !master) return;
  const buf = ctx.createBuffer(1, Math.max(1, Math.ceil(ctx.sampleRate * dur)), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = center;
  filt.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filt).connect(g).connect(dst ?? master);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

// ---------------------------------------------------------------------------
// Techno kit pieces — these double as in-game SFX and as BGM voices.
// ---------------------------------------------------------------------------

// Deep 4-on-the-floor kick. Short sine pitch-dive + transient click.
function kick(t: number, peak = 0.5, dst?: AudioNode) {
  if (!ctx || !master) return;
  const dest = dst ?? master;
  // body — sine glide from punchy 110Hz down to sub 38Hz
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0008, t + 0.22);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + 0.30);
  // transient click for attack
  noise(0.012, peak * 0.30, t, 4500, dest);
}

// Closed hi-hat — very short, high-pitched noise burst.
function chat(t: number, peak = 0.10, dst?: AudioNode) {
  noiseBandpass(0.030, peak, t, 9000, 1.2, 0.001, dst);
}

// Open hi-hat — longer, with a slight sustain.
function ohat(t: number, peak = 0.14, dst?: AudioNode) {
  noiseBandpass(0.18, peak, t, 8200, 1.0, 0.002, dst);
}

// Clap — three quick noise hits packed together, like a real 808 clap.
function clap(t: number, peak = 0.32, dst?: AudioNode) {
  noiseBandpass(0.005, peak * 0.6, t + 0.000, 1500, 1.5, 0.001, dst);
  noiseBandpass(0.005, peak * 0.6, t + 0.012, 1500, 1.5, 0.001, dst);
  noiseBandpass(0.005, peak * 0.6, t + 0.024, 1500, 1.5, 0.001, dst);
  noiseBandpass(0.140, peak * 0.55, t + 0.034, 1500, 1.0, 0.002, dst);
}

// Acid-ish sub bass — saw through a lowpass with an envelope-driven cutoff.
// The cutoff arg controls how open the filter is (in Hz).
function bassNote(freq: number, t: number, dur: number, peak: number, cutoff: number, dst?: AudioNode) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(freq, t);
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.Q.value = 8;
  filt.frequency.setValueAtTime(cutoff * 1.8, t);
  filt.frequency.exponentialRampToValueAtTime(Math.max(80, cutoff * 0.5), t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  o.connect(filt).connect(g).connect(dst ?? master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Sub-only kick reinforcement — sine pulse on the kick beat for the chest.
function sub(freq: number, t: number, dur: number, peak: number, dst?: AudioNode) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, t);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
  o.connect(g).connect(dst ?? master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Synth chord stab — three saws stacked, brief envelope, lowpass for warmth.
function chordStab(roots: number[], t: number, dur: number, peak: number, cutoff = 1800, dst?: AudioNode) {
  if (!ctx || !master) return;
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = cutoff;
  filt.Q.value = 1.4;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  for (const f of roots) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f, t);
    o.connect(filt);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  filt.connect(g).connect(dst ?? master);
}

// Airhorn-style stab — saw glide up + 4-tone harmony stack held briefly.
function airhorn(t: number, dst?: AudioNode) {
  if (!ctx || !master) return;
  const dest = dst ?? master;
  // Glide-up sweep — the "WHOOP" lead-in
  const sweep = ctx.createOscillator();
  sweep.type = 'sawtooth';
  sweep.frequency.setValueAtTime(200, t);
  sweep.frequency.exponentialRampToValueAtTime(620, t + 0.12);
  const sg = ctx.createGain();
  sg.gain.setValueAtTime(0, t);
  sg.gain.linearRampToValueAtTime(0.35, t + 0.018);
  sg.gain.linearRampToValueAtTime(0.25, t + 0.12);
  sg.gain.exponentialRampToValueAtTime(0.0008, t + 0.55);
  sweep.connect(sg).connect(dest);
  sweep.start(t);
  sweep.stop(t + 0.60);
  // 4-tone harmony — root + 5th + octave + 12th (perfect intervals)
  const root = 220;
  for (const ratio of [1, 1.5, 2, 3]) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(root * ratio, t + 0.10);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t + 0.10);
    g.gain.linearRampToValueAtTime(0.18, t + 0.13);
    g.gain.linearRampToValueAtTime(0.16, t + 0.34);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.60);
    o.connect(g).connect(dest);
    o.start(t + 0.10);
    o.stop(t + 0.65);
  }
  // sub punch under it for weight
  sub(80, t, 0.25, 0.22, dest);
}

// Reverse-cymbal sweep — noise with rising lowpass + rising gain, ending with
// a kick. Used as the round-clear "DROP" effect.
function reverseDrop(t: number, dst?: AudioNode) {
  if (!ctx || !master) return;
  const dest = dst ?? master;
  const dur = 1.2;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.setValueAtTime(300, t);
  filt.frequency.exponentialRampToValueAtTime(8000, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.35, t + dur * 0.95);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  src.connect(filt).connect(g).connect(dest);
  src.start(t);
  src.stop(t + dur + 0.1);
  // landing kick
  kick(t + dur, 0.55, dest);
  sub(48, t + dur, 0.5, 0.30, dest);
}

// ---------------------------------------------------------------------------
// SFX dispatch — each gameplay event maps to a techno-flavored sound. Keys
// preserved from the legacy Piper engine so the game-loop callers don't move.
// ---------------------------------------------------------------------------

export function playSfx(key: SfxKey) {
  const c = ensureCtx();
  if (!c || !master) return;
  if (c.state === 'suspended') c.resume();
  const t = c.currentTime;
  switch (key) {
    case 'bleat_short':
      // dancer "yeah!" — brief synth blip
      tone(660, 'triangle', 0.10, 0.18, t, 880);
      tone(990, 'sine', 0.06, 0.10, t + 0.04, 1200);
      break;
    case 'bleat_chain':
      // brighter blip — dancer joins the chain
      tone(880, 'triangle', 0.09, 0.22, t, 1320);
      tone(1320, 'sine', 0.06, 0.14, t + 0.05, 1760);
      break;
    case 'bark':
      // MIC DROP airhorn
      airhorn(t);
      break;
    case 'wolf_growl':
      // bouncer approach — low filtered growl
      tone(140, 'sawtooth', 0.35, 0.22, t, 90);
      noiseBandpass(0.30, 0.10, t, 700, 1.4, 0.005);
      break;
    case 'wolf_hit':
      // bouncer slap — fat percussive impact
      kick(t, 0.45);
      noiseBandpass(0.15, 0.28, t, 1800, 1.0, 0.001);
      tone(140, 'sawtooth', 0.18, 0.26, t + 0.02, 70);
      break;
    case 'combo_up':
      // three ascending chord stabs — combo tier up
      chordStab([660, 990, 1320], t + 0.00, 0.16, 0.30, 2400);
      chordStab([880, 1320, 1760], t + 0.10, 0.16, 0.32, 2800);
      chordStab([1100, 1650, 2200], t + 0.20, 0.22, 0.34, 3200);
      break;
    case 'whistle':
      // attract — a single high stab
      chordStab([1100, 1760], t, 0.18, 0.18, 2600);
      break;
    case 'deliver_good':
      // successful delivery — bright two-note chord stab
      chordStab([660, 990, 1320], t, 0.18, 0.32, 2200);
      chordStab([880, 1320, 1760], t + 0.10, 0.22, 0.30, 2600);
      break;
    case 'deliver_bad':
      // wrong delivery — dull low thump + brief noise hit
      sub(80, t, 0.22, 0.32);
      noiseBandpass(0.14, 0.22, t, 900, 1.0, 0.001);
      break;
    case 'round_clear':
      // celebratory DROP — reverse sweep + kick
      reverseDrop(t);
      break;
    case 'round_fail':
      // wind-down — chord descending into a sub thud
      chordStab([660, 990, 1320], t,        0.30, 0.28, 1800);
      chordStab([440, 660,  880], t + 0.25, 0.30, 0.28, 1400);
      chordStab([220, 330,  440], t + 0.50, 0.45, 0.28, 900);
      sub(40, t + 0.95, 0.6, 0.28);
      break;
  }
}

// ---------------------------------------------------------------------------
// BGM — 128 BPM techno loop. 16-step bar, 4-bar phrase. The acid bass cutoff
// slowly opens across the phrase so the loop has a sense of buildup even
// without melodic variation.
// ---------------------------------------------------------------------------

let bgmRunning = false;
let bgmNextStepT = 0;
let bgmStep = 0;          // monotonic step counter
let bgmPeak = 0.06;

const BGM_BPM = 128;
const STEP_T = 60 / BGM_BPM / 4;           // 16th note ≈ 0.117s
const BAR = 16;                            // 16 16th steps per bar
const PHRASE_BARS = 4;                     // 4-bar phrase for filter sweep

// Pattern per bar — each track is an array of which 16th steps fire.
// Track names: K=kick, C=clap, O=open-hat, H=closed-hat, B=bass(root), B5=bass(5th).
const PAT_KICK  = [0, 4, 8, 12];
const PAT_CLAP  = [4, 12];
const PAT_OHAT  = [2, 6, 10, 14];
const PAT_CHAT  = [1, 3, 5, 7, 9, 11, 13, 15];
const PAT_BASS  = [0, 4, 8, 12];      // root on every kick
const PAT_B5    = [10, 14];           // 5th syncopated

// Root note — A1 (deep) for techno. Frequencies in Hz.
const ROOT_HZ = 55.0;          // A1
const FIFTH_HZ = 82.41;        // E2
const MINOR_3RD_HZ = 65.41;    // C2

// Synth chord stab pattern (every 2nd bar, beat 1)
const CHORD_HZ = [261.63, 311.13, 392.0]; // C4 minor (C, Eb, G) — moody techno

function scheduleBgmAhead() {
  if (!ctx || !bgmRunning || !bgmGain || !bgmFx) return;
  const horizon = ctx.currentTime + 0.4;
  while (bgmNextStepT < horizon) {
    const stepInBar = bgmStep % BAR;
    const stepInPhrase = bgmStep % (BAR * PHRASE_BARS);
    const phraseProgress = stepInPhrase / (BAR * PHRASE_BARS); // 0..1
    const t = bgmNextStepT;

    if (PAT_KICK.includes(stepInBar)) {
      kick(t, bgmPeak * 7.0, bgmGain);
      sub(55, t, 0.18, bgmPeak * 3.5, bgmGain);
    }
    if (PAT_CLAP.includes(stepInBar)) {
      clap(t, bgmPeak * 4.5, bgmFx);
    }
    if (PAT_OHAT.includes(stepInBar)) {
      ohat(t, bgmPeak * 2.0, bgmFx);
    }
    if (PAT_CHAT.includes(stepInBar)) {
      chat(t, bgmPeak * 1.0, bgmGain);
    }
    if (PAT_BASS.includes(stepInBar)) {
      // cutoff slowly opens from 300 to 1400 over the 4-bar phrase, then
      // cycles back — gives the loop a constant "rising" feeling
      const cutoff = 280 + phraseProgress * 1100;
      bassNote(ROOT_HZ, t, STEP_T * 3.5, bgmPeak * 4.5, cutoff, bgmGain);
    }
    if (PAT_B5.includes(stepInBar)) {
      const cutoff = 320 + phraseProgress * 1300;
      bassNote(FIFTH_HZ, t, STEP_T * 1.6, bgmPeak * 3.0, cutoff, bgmGain);
    }
    // Chord stab on bar 1 of every 2-bar half — adds melodic interest
    if (stepInPhrase === 0 || stepInPhrase === BAR * 2) {
      chordStab(CHORD_HZ, t, 0.45, bgmPeak * 2.4, 1600, bgmFx);
    }
    // Minor-3rd accent on the last bar of each phrase — pre-drop tension
    if (stepInPhrase === BAR * 3) {
      bassNote(MINOR_3RD_HZ, t, STEP_T * 1.4, bgmPeak * 2.6, 600, bgmGain);
    }

    bgmNextStepT += STEP_T;
    bgmStep++;
  }
}

export function startBgm(volume = 0.06) {
  const c = ensureCtx();
  if (!c || !master) return;
  if (c.state === 'suspended') c.resume();
  stopBgm();

  bgmGain = c.createGain();
  bgmGain.gain.value = 0;
  bgmGain.connect(master);
  bgmGain.gain.linearRampToValueAtTime(volume, c.currentTime + 1.5);

  // Reverb-ish bus — short feedback delay loop. Claps, open-hats, and chord
  // stabs go through this so they sit in a small warehouse-ish room.
  bgmFx = c.createGain();
  const delay = c.createDelay(0.6);
  delay.delayTime.value = 0.18;
  const feedback = c.createGain();
  feedback.gain.value = 0.28;
  const wet = c.createGain();
  wet.gain.value = 0.6;
  bgmFx.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(bgmGain);
  // dry pass for the FX-bus signal so the original hits still come through
  bgmFx.connect(bgmGain);

  bgmPeak = volume;
  bgmRunning = true;
  bgmStep = 0;
  bgmNextStepT = c.currentTime + 0.05;

  bgmTimer = window.setInterval(() => scheduleBgmAhead(), 200) as unknown as number;
  scheduleBgmAhead();
}

export function stopBgm() {
  bgmRunning = false;
  if (bgmTimer !== null) { window.clearInterval(bgmTimer); bgmTimer = null; }
  if (bgmGain && ctx) {
    bgmGain.gain.cancelScheduledValues(ctx.currentTime);
    bgmGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    const g = bgmGain;
    const fx = bgmFx;
    setTimeout(() => {
      g.disconnect();
      if (fx) fx.disconnect();
    }, 700);
    bgmGain = null;
    bgmFx = null;
  }
}
