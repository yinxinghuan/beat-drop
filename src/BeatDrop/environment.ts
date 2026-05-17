// Beat Drop — per-round club lighting presets. Cycled by `(round - 1) % len`.
// Each preset drives lights, fog, and dance-floor tints in Scene.tsx, plus an
// optional extra (sparkles / mist / etc).

export type EnvironmentExtra = 'sparkles' | 'mist' | null;

export interface EnvironmentPreset {
  id: 'warmup' | 'strobe' | 'fog' | 'laser';
  name: string;                 // shown on the round-clear banner ("STROBE")
  ambient: { color: string; intensity: number };
  directional: { color: string; intensity: number; position: [number, number, number] };
  hemisphere: { sky: string; ground: string; intensity: number };
  fog: { color: string; near: number; far: number };
  // Floor tint slots — outer dark void / outer ring / main floor / inner glow / seam tuft.
  pasture: { outerBg: string; outerRing: string; main: string; inner: string; tuft: string };
  pollenColor: string;          // ambient particle / sparkle tint
  extra: EnvironmentExtra;
  strobe?: boolean;             // pulse the directional at ~3 Hz subtly (0.85 ↔ 1.15)
}

// Floor base — deep purple `#1c1230` with `#3a2666` glowing seams.
// Dark slate base around `#08080f`-`#1a0a2a` for the void surround.

export const ENVIRONMENTS: EnvironmentPreset[] = [
  {
    id: 'warmup',
    name: 'WARM UP',
    ambient: { color: '#ffb87a', intensity: 0.32 },
    directional: { color: '#ff9a5a', intensity: 0.85, position: [14, 30, 8] },
    hemisphere: { sky: '#5a2a3a', ground: '#120816', intensity: 0.28 },
    fog: { color: '#1a0e1f', near: 30, far: 76 },
    pasture: {
      outerBg:   '#08080f',
      outerRing: '#11091a',
      main:      '#241636',
      inner:     '#2e1c44',
      tuft:      '#4a2a5e', // amber-purple seam glow
    },
    pollenColor: '#ffb670',
    extra: null,
  },
  {
    id: 'strobe',
    name: 'STROBE',
    ambient: { color: '#cfe8ff', intensity: 0.55 },
    directional: { color: '#ffffff', intensity: 1.45, position: [0, 36, 4] },
    hemisphere: { sky: '#aac4ff', ground: '#0a0a18', intensity: 0.42 },
    fog: { color: '#1a1024', near: 36, far: 88 },
    pasture: {
      outerBg:   '#08080f',
      outerRing: '#0e0b1c',
      main:      '#2a1c44',
      inner:     '#372456',
      tuft:      '#f7e8c6', // warm-white sparks on the floor seams (decor)
    },
    pollenColor: '#f7e8c6',
    extra: 'sparkles',
    strobe: true,
  },
  {
    id: 'fog',
    name: 'FOG ROOM',
    ambient: { color: '#a06edc', intensity: 0.52 },
    directional: { color: '#ff5cd2', intensity: 1.05, position: [-22, 18, -4] },
    hemisphere: { sky: '#7a3aa8', ground: '#160826', intensity: 0.5 },
    fog: { color: '#3a1858', near: 14, far: 42 },
    pasture: {
      outerBg:   '#150624',
      outerRing: '#1f0a36',
      main:      '#33165a',
      inner:     '#451f74',
      tuft:      '#7a3aa8',
    },
    pollenColor: '#ff8be0',
    extra: 'mist',
  },
  {
    id: 'laser',
    name: 'LASER',
    ambient: { color: '#1a2840', intensity: 0.28 },
    directional: { color: '#ff3ea5', intensity: 1.35, position: [-22, 22, 12] },
    hemisphere: { sky: '#38e6ff', ground: '#08080f', intensity: 0.6 },
    fog: { color: '#08080f', near: 32, far: 78 },
    pasture: {
      outerBg:   '#06060c',
      outerRing: '#0b0a1a',
      main:      '#1c1230',
      inner:     '#2a1648',
      tuft:      '#cfe0f0', // cool-white grid seams (NOT dye cyan)
    },
    pollenColor: '#cfe0f0',
    extra: 'sparkles',
  },
];

export function envForRound(round: number): EnvironmentPreset {
  // DEV: ?env=strobe|fog|laser|warmup forces a specific preset for QA
  if (typeof window !== 'undefined') {
    const m = new URLSearchParams(window.location.search).get('env');
    if (m) {
      const found = ENVIRONMENTS.find(e => e.id === m);
      if (found) return found;
    }
  }
  return ENVIRONMENTS[(round - 1) % ENVIRONMENTS.length];
}

export function nextEnvForRound(round: number): EnvironmentPreset {
  return envForRound(round + 1);
}
