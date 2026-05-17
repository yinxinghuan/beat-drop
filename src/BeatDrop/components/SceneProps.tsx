// Beat Drop scene props — neon columns, speaker stacks, amps, monitor wedges,
// LED floor markers, glowing barrier posts, drones, music-note particles, and
// a DJ mainstage booth. Zone composition mirrors the Piper pasture so the
// spatial choreography (dense cluster here, open meadow there) survives the
// retheme; only the visual primitives changed.

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { PLAYFIELD } from '../constants';

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ============================================================================
// VIP platform (replaces the pond) — a small raised matte-black disc with a
// rope of glowing seam light around the edge. Sits where the pond used to be.
// ============================================================================
function VipPlatform({ position, radius }: { position: [number, number, number]; radius: number }) {
  const rimRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!rimRef.current) return;
    rimRef.current.emissiveIntensity = 0.30 + Math.sin(clock.getElapsedTime() * 1.4) * 0.10;
  });
  return (
    <group position={position}>
      {/* base disc — matte black */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[radius, 48]} />
        <meshStandardMaterial color="#0c0c14" roughness={0.55} metalness={0.2} />
      </mesh>
      {/* very faint rim seam — barely there */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[radius * 0.92, radius * 1.0, 48]} />
        <meshStandardMaterial ref={rimRef} color={DECOR.dimAmber} emissive={DECOR.dimAmber} emissiveIntensity={0.35} />
      </mesh>
      {/* a low raised tile in the middle to read as a platform */}
      <mesh position={[0, 0.10, 0]} receiveShadow>
        <cylinderGeometry args={[radius * 0.75, radius * 0.78, 0.20, 36]} />
        <meshStandardMaterial color="#16101e" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* inner disc — purple but barely glowing */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <circleGeometry args={[radius * 0.62, 36]} />
        <meshStandardMaterial color="#1b0e2e" emissive="#3a2050" emissiveIntensity={0.20} />
      </mesh>
    </group>
  );
}

// ============================================================================
// Speaker stack (replaces the hay bale) — vertical 3-driver tower. Black box,
// circular dust caps, neon LED strip down the side.
// ============================================================================
function HayBale({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* cabinet */}
      <RoundedBox args={[1.0, 2.0, 0.85]} radius={0.05} smoothness={3}
                  position={[0, 1.0, 0]} castShadow>
        <meshStandardMaterial color="#0d0d12" roughness={0.65} metalness={0.25} />
      </RoundedBox>
      {/* three drivers stacked — dark circles with metal cone */}
      {[1.55, 1.0, 0.45].map((y, i) => (
        <group key={i} position={[0, y, 0.43]}>
          <mesh>
            <cylinderGeometry args={[0.30, 0.30, 0.05, 24]} />
            <meshStandardMaterial color="#1a1a22" />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <cylinderGeometry args={[0.26, 0.30, 0.06, 24]} />
            <meshStandardMaterial color="#0a0a10" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <sphereGeometry args={[0.07, 14, 10]} />
            <meshStandardMaterial color="#2a2a32" metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {/* faint side LED strip — barely lit, just a hint of "powered on" */}
      <mesh position={[0.51, 1.0, 0]}>
        <boxGeometry args={[0.02, 1.7, 0.10]} />
        <meshStandardMaterial color={DECOR.warmWhite} emissive={DECOR.warmWhite} emissiveIntensity={0.35} />
      </mesh>
      {/* small handle on top */}
      <mesh position={[0, 2.07, 0]}>
        <boxGeometry args={[0.6, 0.06, 0.18]} />
        <meshStandardMaterial color="#1c1c22" metalness={0.5} />
      </mesh>
    </group>
  );
}

// ============================================================================
// Amp box (replaces the boulder cluster) — black square amplifier with a grille
// pattern and a thin neon LED strip on top. Variants in scale fill the role
// the boulder cluster played: low chunky obstacle silhouettes.
// ============================================================================
function Boulder({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <RoundedBox args={[1.1, 0.85, 1.1]} radius={0.06} smoothness={3}
                  position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color="#0e0e14" roughness={0.7} metalness={0.25} />
      </RoundedBox>
      {/* grille (front face) */}
      <mesh position={[0, 0.45, 0.56]}>
        <planeGeometry args={[0.92, 0.65]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.95} />
      </mesh>
      {/* very faint warm-white seam on top */}
      <mesh position={[0, 0.89, 0]}>
        <boxGeometry args={[0.95, 0.04, 0.95]} />
        <meshStandardMaterial color={DECOR.warmWhite} emissive={DECOR.warmWhite} emissiveIntensity={0.30} />
      </mesh>
      {/* small back amp peeking */}
      <RoundedBox args={[0.65, 0.45, 0.55]} radius={0.05} smoothness={3}
                  position={[0.7, 0.22, -0.35]} castShadow>
        <meshStandardMaterial color="#10101a" roughness={0.7} />
      </RoundedBox>
    </group>
  );
}

// ============================================================================
// DECOR palette — STRICTLY DISCIPLINED to NOT overlap with the dye palette.
// Dancers, gates, and target ribbons are the only places where #ff3ea5 (pink),
// #38e6ff (cyan), #ffd84a (amber), #6dff7a (lime) may appear. Everything else
// — light columns, speaker LEDs, amp caps, mic glows, floor markers, barrier
// posts, dance-floor seams — uses muted neutrals so the gameplay-critical
// colors stay legible in a crowded scene. Same rule as Piper's
// feedback_dye_palette_discipline. (Soft warm white biased toward amber-gold
// is the one decoration accent that doesn't clash because the gameplay amber
// has full saturation while the decoration warm-white reads as off-white.)
// ============================================================================
const DECOR = {
  white:     '#ffffff',          // pure light source core (bulb)
  warmWhite: '#f7e8c6',          // warm bulb glow
  coolWhite: '#cfe0f0',          // cool fluorescent bulb glow
  dimAmber:  '#9c7a36',          // a warm decorative LED — desaturated so it
                                 // can't be mistaken for the dye amber
  steel:     '#2a2a30',          // bare metal trim
  darkSlate: '#16161e',          // matte casing
  void:      '#0a0a10',          // deepest shadow
};

// ============================================================================
// Oak → MASSIVE 4-driver speaker stack. The dominant decoration silhouette.
// Pure matte black cabinets, visible round drivers, one tiny power LED. Reads
// as "underground warehouse PA system."
// ============================================================================
function Oak({ position, scale = 1, rot = 0 }:
             { position: [number, number, number]; scale?: number; rot?: number }) {
  return (
    <group position={position} scale={scale} rotation={[0, rot, 0]}>
      {/* concrete riser at the base */}
      <RoundedBox args={[1.5, 0.25, 1.4]} radius={0.03} smoothness={3}
                  position={[0, 0.12, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#13131a" roughness={0.95} metalness={0.0} />
      </RoundedBox>
      {/* lower sub cabinet — biggest box */}
      <RoundedBox args={[1.35, 1.5, 1.2]} radius={0.04} smoothness={3}
                  position={[0, 1.0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={DECOR.void} roughness={0.7} metalness={0.2} />
      </RoundedBox>
      {/* mid cabinet */}
      <RoundedBox args={[1.20, 1.4, 1.05]} radius={0.04} smoothness={3}
                  position={[0, 2.45, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={DECOR.darkSlate} roughness={0.7} metalness={0.2} />
      </RoundedBox>
      {/* top horn cabinet */}
      <RoundedBox args={[1.0, 0.65, 0.9]} radius={0.04} smoothness={3}
                  position={[0, 3.50, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={DECOR.darkSlate} roughness={0.7} metalness={0.2} />
      </RoundedBox>
      {/* drivers — circles inset into each cabinet face. Pure dark, no glow. */}
      {/* sub: one big 18" driver */}
      <mesh position={[0, 1.0, 0.61]}>
        <cylinderGeometry args={[0.50, 0.50, 0.04, 28]} />
        <meshStandardMaterial color="#0a0a10" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.0, 0.63]}>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* mid: two 12" drivers stacked */}
      {[2.9, 2.0].map((y, i) => (
        <group key={i} position={[0, y, 0.53]}>
          <mesh>
            <cylinderGeometry args={[0.30, 0.30, 0.04, 24]} />
            <meshStandardMaterial color="#0a0a10" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <sphereGeometry args={[0.10, 12, 10]} />
            <meshStandardMaterial color="#1a1a22" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* top: horn slot */}
      <mesh position={[0, 3.50, 0.46]}>
        <boxGeometry args={[0.6, 0.30, 0.04]} />
        <meshStandardMaterial color="#0a0a10" roughness={0.85} />
      </mesh>
      {/* single tiny dim power LED on the side — proves it's on */}
      <mesh position={[0.61, 0.30, 0]}>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshStandardMaterial color={DECOR.dimAmber} emissive={DECOR.dimAmber} emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

// ============================================================================
// Pine → STEEL TRUSS scaffold with hanging speakers. Tall dark scaffolding,
// crossbars, two black speaker boxes hanging from the truss. All matte dark
// metal — the only emission is one tiny indicator on each speaker.
// ============================================================================
function Pine({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* base plates */}
      {[-0.7, 0.7].map((x, i) => (
        <RoundedBox key={i} args={[0.4, 0.12, 0.4]} radius={0.02} smoothness={3}
                    position={[x, 0.06, 0]} castShadow>
          <meshStandardMaterial color={DECOR.darkSlate} roughness={0.85} metalness={0.4} />
        </RoundedBox>
      ))}
      {/* vertical steel posts */}
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={i} position={[x, 3.0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 6.0, 8]} />
          <meshStandardMaterial color={DECOR.steel} roughness={0.55} metalness={0.7} />
        </mesh>
      ))}
      {/* horizontal crossbars (3 levels) */}
      {[1.6, 3.4, 5.8].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.6, 6]} />
          <meshStandardMaterial color={DECOR.steel} roughness={0.55} metalness={0.7} />
        </mesh>
      ))}
      {/* diagonal cross-braces */}
      {[
        { y: 2.5, rotZ: 0.8 },
        { y: 4.6, rotZ: -0.8 },
      ].map((c, i) => (
        <mesh key={i} position={[0, c.y, 0]} rotation={[0, 0, c.rotZ]}>
          <cylinderGeometry args={[0.035, 0.035, 2.0, 6]} />
          <meshStandardMaterial color={DECOR.steel} roughness={0.55} metalness={0.7} />
        </mesh>
      ))}
      {/* hanging speaker boxes */}
      {[
        { x: -0.6, y: 4.2 },
        { x:  0.6, y: 3.6 },
      ].map((s, i) => (
        <group key={i} position={[s.x, s.y, 0]}>
          {/* chain / strap */}
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
            <meshStandardMaterial color="#222229" metalness={0.5} />
          </mesh>
          {/* speaker box */}
          <RoundedBox args={[0.55, 0.75, 0.55]} radius={0.04} smoothness={3} castShadow>
            <meshStandardMaterial color={DECOR.void} roughness={0.75} metalness={0.2} />
          </RoundedBox>
          {/* driver */}
          <mesh position={[0, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.03, 18]} />
            <meshStandardMaterial color="#0a0a10" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ============================================================================
// Birch → industrial steel pole with a junction box. Used in "wildflower"
// zones to thin out the scene without adding light. All matte dark metal,
// one almost-invisible LED on the junction box.
// ============================================================================
function Birch({ position, scale = 1, rot = 0 }:
               { position: [number, number, number]; scale?: number; rot?: number }) {
  return (
    <group position={position} scale={scale} rotation={[0, rot, 0]}>
      {/* concrete base */}
      <RoundedBox args={[0.55, 0.18, 0.55]} radius={0.02} smoothness={3}
                  position={[0, 0.09, 0]} castShadow>
        <meshStandardMaterial color="#13131a" roughness={0.95} />
      </RoundedBox>
      {/* tall slim steel pole */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 5.0, 8]} />
        <meshStandardMaterial color={DECOR.steel} roughness={0.5} metalness={0.7} />
      </mesh>
      {/* junction box clamped onto the pole */}
      <RoundedBox args={[0.32, 0.40, 0.22]} radius={0.02} smoothness={3}
                  position={[0.14, 1.4, 0]} castShadow>
        <meshStandardMaterial color={DECOR.darkSlate} roughness={0.7} metalness={0.4} />
      </RoundedBox>
      {/* one tiny power indicator on the box */}
      <mesh position={[0.30, 1.55, 0]}>
        <sphereGeometry args={[0.022, 8, 6]} />
        <meshStandardMaterial color={DECOR.dimAmber} emissive={DECOR.dimAmber} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// ============================================================================
// Stage monitor (replaces Stump) — small wedge-shaped speaker tilted up.
// ============================================================================
function Stump({ position, rot = 0 }: { position: [number, number, number]; rot?: number }) {
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <RoundedBox args={[1.1, 0.50, 0.85]} radius={0.05} smoothness={3}
                  position={[0, 0.30, 0]} rotation={[-0.25, 0, 0]} castShadow>
        <meshStandardMaterial color="#0d0d14" roughness={0.7} metalness={0.2} />
      </RoundedBox>
      {/* driver */}
      <mesh position={[0, 0.45, 0.34]} rotation={[-0.25, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 18]} />
        <meshStandardMaterial color="#1a1a22" />
      </mesh>
      <mesh position={[0, 0.45, 0.36]} rotation={[-0.25, 0, 0]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <meshStandardMaterial color={DECOR.warmWhite} emissive={DECOR.warmWhite} emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

// ============================================================================
// Sub crate (replaces Bush) — short matte-black box on the floor. Pure
// decoration, no light. Reads as "extra sub speaker scattered around."
// ============================================================================
function Bush({ position, scale = 1, tint = DECOR.darkSlate, accent }:
              { position: [number, number, number]; scale?: number; tint?: string; accent?: string }) {
  // remap legacy sage tints onto dark slate so existing callers paint dark
  const isLegacySage = tint.startsWith('#4') || tint.startsWith('#5') || tint.startsWith('#6') || tint.startsWith('#7');
  const color = isLegacySage ? DECOR.darkSlate : tint;
  return (
    <group position={position} scale={scale}>
      {/* main crate */}
      <RoundedBox args={[0.95, 0.6, 0.85]} radius={0.04} smoothness={3}
                  position={[0, 0.30, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.15} />
      </RoundedBox>
      {/* driver inset (front face) */}
      <mesh position={[0, 0.30, 0.43]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.20, 0.20, 0.04, 18]} />
        <meshStandardMaterial color="#08080e" roughness={0.85} />
      </mesh>
      {/* dim power LED only when accent is set */}
      {accent && (
        <mesh position={[0.47, 0.45, 0.30]}>
          <sphereGeometry args={[0.018, 8, 6]} />
          <meshStandardMaterial color={DECOR.dimAmber} emissive={DECOR.dimAmber} emissiveIntensity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ============================================================================
// Mic stand (replaces Cattail) — vertical thin pole with a mic ball on top.
// ============================================================================
function Cattail({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 1, 2, 3, 4].map(i => {
        const a = (i / 5) * Math.PI * 2;
        const x = Math.cos(a) * 0.25;
        const z = Math.sin(a) * 0.25;
        return (
          <group key={i} position={[x, 0, z]}>
            {/* pole */}
            <mesh position={[0, 0.65, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 1.3, 6]} />
              <meshStandardMaterial color="#2a2a32" metalness={0.5} roughness={0.4} />
            </mesh>
            {/* mic ball */}
            <mesh position={[0, 1.35, 0]} castShadow>
              <sphereGeometry args={[0.08, 12, 10]} />
              <meshStandardMaterial color="#1a1a22" metalness={0.6} roughness={0.35} />
            </mesh>
            {/* tip — barely lit warm-white indicator */}
            <mesh position={[0, 1.42, 0]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial color={DECOR.warmWhite} emissive={DECOR.warmWhite} emissiveIntensity={0.50} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ============================================================================
// Floor scuff (replaces FlowerPatch) — dark paint marks on the dance floor.
// No emission. Reads as worn-in club floor scuffs / chewing gum / tape marks
// rather than glowing decoration. Mostly invisible until lit by spotlights.
// ============================================================================
function FlowerPatch({ position, n = 10 }: { position: [number, number, number]; color?: string; n?: number }) {
  const blossoms = useMemo(() => {
    const rand = seeded(position[0] * 31 + position[2] * 19 + 7);
    return Array.from({ length: n }, () => ({
      x: (rand() - 0.5) * 1.8,
      z: (rand() - 0.5) * 1.8,
      s: 0.06 + rand() * 0.09,
      tone: 0.05 + rand() * 0.08,
    }));
  }, [position, n]);
  return (
    <group position={position}>
      {blossoms.map((b, i) => {
        const grey = `rgb(${Math.round(b.tone * 255)}, ${Math.round(b.tone * 255)}, ${Math.round(b.tone * 255 * 1.1)})`;
        return (
          <mesh key={i} position={[b.x, 0.04, b.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[b.s, 8]} />
            <meshStandardMaterial color={grey} roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

// ============================================================================
// DJ mainstage booth (replaces Barn) — raised stage with two turntables on a
// central console, neon "DJ" banner, columnar speaker towers flanking it,
// backlight LED bar. Same XY footprint as the barn so the scene composition
// holds.
// ============================================================================
function Barn({ position }: { position: [number, number, number] }) {
  const W = 7, H = 1.3, D = 4;
  const consoleRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!consoleRef.current) return;
    consoleRef.current.emissiveIntensity = 0.22 + Math.sin(clock.getElapsedTime() * 1.4) * 0.08;
  });
  return (
    <group position={position}>
      {/* raised stage base */}
      <RoundedBox args={[W + 2, H, D + 1]} radius={0.08} smoothness={3}
                  position={[0, H / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#0a0a12" roughness={0.5} metalness={0.3} />
      </RoundedBox>
      {/* very faint front fascia strip — barely-there work-light hint */}
      <mesh position={[0, H * 0.55, (D + 1) / 2 + 0.01]}>
        <boxGeometry args={[W + 2, 0.10, 0.02]} />
        <meshStandardMaterial color={DECOR.dimAmber} emissive={DECOR.dimAmber} emissiveIntensity={0.25} />
      </mesh>
      {/* center console (the mixing desk) */}
      <RoundedBox args={[3.2, 0.7, 1.4]} radius={0.08} smoothness={3}
                  position={[0, H + 0.35, 0.2]} castShadow>
        <meshStandardMaterial color="#15151c" roughness={0.6} metalness={0.4} />
      </RoundedBox>
      {/* mixer top with knobs glow */}
      <mesh position={[0, H + 0.71, 0.2]}>
        <boxGeometry args={[3.0, 0.04, 1.2]} />
        <meshStandardMaterial ref={consoleRef} color="#1a1a22" emissive={DECOR.dimAmber} emissiveIntensity={0.25} />
      </mesh>
      {/* two turntables flanking the mixer */}
      {[-1.55, 1.55].map((x, i) => (
        <group key={i} position={[x, H + 0.40, 0.2]}>
          <mesh>
            <cylinderGeometry args={[0.55, 0.55, 0.10, 32]} />
            <meshStandardMaterial color="#0a0a10" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* platter — gold metal disc */}
          <mesh position={[0, 0.052, 0]}>
            <cylinderGeometry args={[0.50, 0.50, 0.02, 32]} />
            <meshStandardMaterial color="#3a2a18" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* spindle dot — barely lit indicator */}
          <mesh position={[0, 0.072, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.05, 12]} />
            <meshStandardMaterial color={DECOR.warmWhite} emissive={DECOR.warmWhite} emissiveIntensity={0.30} />
          </mesh>
          {/* tonearm */}
          <mesh position={[0.40, 0.10, -0.40]} rotation={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.55, 6]} />
            <meshStandardMaterial color="#aaa6a0" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* speaker stacks at the corners of the stage */}
      {[[-W / 2 - 0.5, D / 2], [W / 2 + 0.5, D / 2]].map((p, i) => (
        <group key={i} position={[p[0], H, p[1]]}>
          <RoundedBox args={[1.2, 3.0, 1.2]} radius={0.06} smoothness={3}
                      position={[0, 1.5, 0]} castShadow>
            <meshStandardMaterial color="#0a0a10" roughness={0.6} metalness={0.25} />
          </RoundedBox>
          {/* drivers */}
          {[2.5, 1.7, 0.9].map((y, j) => (
            <mesh key={j} position={[0, y, 0.61]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.34, 0.34, 0.06, 24]} />
              <meshStandardMaterial color="#1a1a22" />
            </mesh>
          ))}
          {/* faint side LED */}
          <mesh position={[0.61, 1.5, 0]}>
            <boxGeometry args={[0.02, 2.6, 0.12]} />
            <meshStandardMaterial color={i === 0 ? DECOR.coolWhite : DECOR.dimAmber} emissive={i === 0 ? DECOR.coolWhite : DECOR.dimAmber} emissiveIntensity={0.45} />
          </mesh>
        </group>
      ))}
      {/* back LED backdrop — a tall wide glowing strip behind the booth */}
      <mesh position={[0, H + 2.2, -D / 2 - 0.45]}>
        <boxGeometry args={[W + 3, 4.4, 0.10]} />
        <meshStandardMaterial color="#0a0612" roughness={0.4} />
      </mesh>
      {/* backdrop is just a dark wall — no neon stripes. The mainstage uses
          the overhead ClubLights for atmosphere, not painted neon. */}
      {/* truss bar above the backdrop */}
      <mesh position={[0, H + 4.65, -D / 2 - 0.20]}>
        <boxGeometry args={[W + 3.4, 0.18, 0.18]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* moving heads hanging off the truss */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <group key={i} position={[x, H + 4.4, -D / 2 - 0.20]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.16, 0.25, 12]} />
            <meshStandardMaterial color="#1a1a22" metalness={0.6} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <coneGeometry args={[0.16, 0.20, 12]} />
            <meshStandardMaterial color={DECOR.warmWhite} emissive={DECOR.warmWhite} emissiveIntensity={1.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ============================================================================
// Steel barrier (replaces wooden post fence) — same noise-shaped boundary
// generator, just matte black metal posts with hot-pink top caps and a thin
// horizontal belt strip connecting adjacent posts.
// ============================================================================
function PostFence({ baseRadius }: { baseRadius: number }) {
  const posts = useMemo(() => {
    const rand = seeded(8124);
    const noiseR = (a: number) =>
      baseRadius
      + 1.6 * Math.sin(a * 1.4 + 0.3)
      + 1.1 * Math.sin(a * 2.7 - 1.1)
      + 0.7 * Math.sin(a * 4.1 + 2.0)
      - 0.5 * Math.cos(a * 0.9);

    const arr: { x: number; z: number; h: number; thick: number; rotY: number; isBroken: boolean }[] = [];
    let a = 0;
    let safety = 0;
    while (a < Math.PI * 2 - 0.02 && safety++ < 600) {
      const r = noiseR(a);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r - 1.5;
      const inGateLane = z < -10 && Math.abs(x) < 13;
      const gapRoll = rand();
      const shouldGap = gapRoll < 0.06 && a > 0.5;
      if (!inGateLane && !shouldGap) {
        const jx = (rand() - 0.5) * 0.4;
        const jz = (rand() - 0.5) * 0.4;
        // Barrier posts are more uniform than wooden fence posts — clubs have
        // identical crowd-control stanchions, not weathered wood. Still vary
        // the height slightly so the silhouette isn't dead-flat.
        const archetype = rand();
        let h: number, thick: number;
        if (archetype < 0.85) {
          h     = 0.95 + rand() * 0.20;   // 0.95..1.15 — standard stanchion
          thick = 0.07 + rand() * 0.02;
        } else {
          h     = 1.10 + rand() * 0.20;   // 1.10..1.30 — tall marker
          thick = 0.06 + rand() * 0.02;
        }
        arr.push({
          x: x + jx,
          z: z + jz,
          h,
          thick,
          rotY: rand() * Math.PI * 2,
          isBroken: rand() < 0.04,
        });
      } else if (shouldGap) {
        a += 0.35 + rand() * 0.45;
        continue;
      }
      const step = (0.06 + rand() * 0.05);
      a += step;
    }
    return arr;
  }, [baseRadius]);

  // belt segments connecting consecutive posts
  const belts = useMemo(() => {
    const out: { x: number; z: number; len: number; rot: number; h: number }[] = [];
    for (let i = 0; i < posts.length - 1; i++) {
      const a = posts[i], b = posts[i + 1];
      const dx = b.x - a.x, dz = b.z - a.z;
      const len = Math.hypot(dx, dz);
      if (len > 2.2) continue; // too far apart — belt doesn't connect
      out.push({
        x: (a.x + b.x) / 2,
        z: (a.z + b.z) / 2,
        len,
        rot: Math.atan2(dz, dx),
        h: Math.min(a.h, b.h) * 0.82,
      });
    }
    return out;
  }, [posts]);

  return (
    <group>
      {posts.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} rotation={[0, p.rotY, 0]}>
          {/* post body — matte black steel */}
          <mesh position={[0, p.h / 2, 0]} castShadow>
            <cylinderGeometry args={[p.thick * 0.85, p.thick, p.h, 8]} />
            <meshStandardMaterial color="#1a1a22" metalness={0.6} roughness={0.35} />
          </mesh>
          {/* top cap — hot-pink puck */}
          {!p.isBroken && (
            <mesh position={[0, p.h + 0.045, 0]} castShadow>
              <cylinderGeometry args={[p.thick * 1.4, p.thick * 1.4, 0.09, 12]} />
              <meshStandardMaterial color={DECOR.dimAmber} emissive={DECOR.dimAmber} emissiveIntensity={1.4} />
            </mesh>
          )}
        </group>
      ))}
      {belts.map((b, i) => (
        <mesh
          key={`belt_${i}`}
          position={[b.x, b.h, b.z]}
          rotation={[0, -b.rot, 0]}
        >
          <boxGeometry args={[b.len, 0.04, 0.015]} />
          <meshStandardMaterial color="#2a2a30" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================================
// Drones (replaces birds) — small dark boxes with a red blinking light, orbit
// high above the dance floor.
// ============================================================================
function Birds() {
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  const matA = useRef<THREE.MeshStandardMaterial>(null);
  const matB = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (a.current) {
      a.current.position.set(Math.cos(t * 0.18) * 22, 11 + Math.sin(t * 0.5) * 0.8, Math.sin(t * 0.18) * 22);
      a.current.rotation.y = t * 0.18 + Math.PI / 2;
    }
    if (b.current) {
      b.current.position.set(Math.cos(t * 0.13 + 2) * 16, 13 + Math.sin(t * 0.6) * 0.6, Math.sin(t * 0.13 + 2) * 16);
      b.current.rotation.y = t * 0.13 + 2 + Math.PI / 2;
    }
    // blink red lights
    const blink = (Math.sin(t * 5) + 1) * 0.5;
    if (matA.current) matA.current.emissiveIntensity = blink * 2.5;
    if (matB.current) matB.current.emissiveIntensity = ((Math.sin(t * 5 + 1.7) + 1) * 0.5) * 2.5;
  });
  const Drone = ({ matRef }: { matRef: React.MutableRefObject<THREE.MeshStandardMaterial | null> }) => (
    <group>
      {/* body */}
      <RoundedBox args={[0.42, 0.10, 0.42]} radius={0.04} smoothness={3}>
        <meshStandardMaterial color="#0a0a10" metalness={0.4} roughness={0.5} />
      </RoundedBox>
      {/* arms with rotors */}
      {([[-0.30, -0.30], [0.30, -0.30], [-0.30, 0.30], [0.30, 0.30]] as const).map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.08, 6]} />
            <meshStandardMaterial color="#1a1a22" />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.005, 12]} />
            <meshStandardMaterial color="#1a1a22" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
      {/* belly red blink */}
      <mesh position={[0, -0.08, 0]}>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshStandardMaterial ref={matRef} color="#ff2030" emissive="#ff2030" emissiveIntensity={2.0} />
      </mesh>
    </group>
  );
  return (
    <>
      <group ref={a}><Drone matRef={matA} /></group>
      <group ref={b}><Drone matRef={matB} /></group>
    </>
  );
}

// ============================================================================
// Floating music notes / sparkles (replaces pollen) — simple points retinted
// so the "dust in the air" reads as light-show particulate rising from the
// crowd.
// ============================================================================
function Pollen() {
  const COUNT = 120;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * PLAYFIELD * 1.4;
      arr[i * 3 + 1] = Math.random() * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * PLAYFIELD * 1.4;
    }
    return arr;
  }, []);
  const velocities = useMemo(() => {
    const arr = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 2 + 0] = 0.3 + Math.random() * 0.4;
      arr[i * 2 + 1] = (Math.random() - 0.5) * 0.4;
    }
    return arr;
  }, []);
  useFrame((_, delta) => {
    const p = ref.current;
    if (!p) return;
    const arr = p.geometry.attributes.position.array as Float32Array;
    const c = Math.min(delta, 0.05);
    for (let i = 0; i < COUNT; i++) {
      const xi = i * 3, yi = i * 3 + 1, zi = i * 3 + 2;
      arr[yi] += velocities[i * 2 + 0] * c;
      arr[xi] += velocities[i * 2 + 1] * c;
      if (arr[yi] > 8) {
        arr[yi] = 0.2;
        arr[xi] = (Math.random() - 0.5) * PLAYFIELD * 1.4;
        arr[zi] = (Math.random() - 0.5) * PLAYFIELD * 1.4;
      }
      if (Math.abs(arr[xi]) > PLAYFIELD * 0.8) {
        arr[xi] = (Math.random() - 0.5) * PLAYFIELD * 1.4;
      }
    }
    p.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#fff5dd"
        size={0.22}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
}

// ============================================================================
// Combined export — zone composition mirrors the Piper pasture so the spatial
// choreography survives. Only the primitives draw differently.
// ============================================================================
export function SceneProps() {
  const groves = useMemo(() => buildGroves(), []);

  return (
    <>
      {/* runway lanes — flat concrete, no glow. Just a slightly different tile
          tone so they read as "lanes." Gates own all the color signal. */}
      <mesh position={[-1.2, 0.04, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.6, 22]} />
        <meshStandardMaterial color="#1a1426" roughness={0.85} />
      </mesh>
      <mesh position={[ 1.2, 0.04, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.6, 22]} />
        <meshStandardMaterial color="#1a1426" roughness={0.85} />
      </mesh>
      {/* faint white center seam — like a painted floor line */}
      <mesh position={[0, 0.05, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.06, 22]} />
        <meshStandardMaterial color={DECOR.warmWhite} emissive={DECOR.warmWhite} emissiveIntensity={0.30} />
      </mesh>

      <VipPlatform position={[7, 0, -2]} radius={3.0} />
      {([
        [ 4.0, 0,  -2.0], [ 5.0, 0,   0.8], [ 9.5, 0,  -3.4],
        [ 7.6, 0,  -4.8], [ 4.4, 0,  -0.4], [ 9.6, 0,  -0.6],
      ] as [number, number, number][]).map((p, i) => <Cattail key={`cat_${i}`} position={p} />)}

      {groves.trees.map((t, i) => {
        if (t.type === 'oak')   return <Oak   key={`oak_${i}`}   position={t.p} scale={t.s} rot={t.rot} />;
        if (t.type === 'pine')  return <Pine  key={`pine_${i}`}  position={t.p} scale={t.s} />;
        return                          <Birch key={`birch_${i}`} position={t.p} scale={t.s} rot={t.rot} />;
      })}
      {groves.bushes.map((b, i) => (
        <Bush key={`bush_${i}`} position={b.p} scale={b.s} tint={b.tint} accent={b.accent} />
      ))}
      {groves.stumps.map((s, i) => (
        <Stump key={`stump_${i}`} position={s.p} rot={s.rot} />
      ))}
      {groves.flowers.map((f, i) => (
        <FlowerPatch key={`flower_${i}`} position={f.p} color={f.color} n={f.n} />
      ))}
      {groves.boulders.map((b, i) => (
        <Boulder key={`boulder_${i}`} position={b.p} scale={b.s} />
      ))}
      {groves.hay.map((h, i) => (
        <HayBale key={`hay_${i}`} position={[h.p[0], 0, h.p[2]]} rotation={h.rot} />
      ))}

      <PostFence baseRadius={PLAYFIELD / 2 + 1.2} />

      <Barn position={[0, 0, -22]} />
      <Birds />
      <Pollen />
    </>
  );
}

// Hand-tuned zone composition (unchanged from Piper — spatial layout is the
// hard part and works as-is). The legacy color/accent values are remapped to
// neon inside Bush/FlowerPatch.
function buildGroves() {
  const rand = seeded(901322);
  const trees: { type: 'oak' | 'pine' | 'birch'; p: [number, number, number]; s: number; rot: number }[] = [];
  const bushes: { p: [number, number, number]; s: number; tint: string; accent?: string }[] = [];
  const stumps: { p: [number, number, number]; rot: number }[] = [];
  const flowers: { p: [number, number, number]; color: string; n: number }[] = [];
  const boulders: { p: [number, number, number]; s: number }[] = [];
  const hay: { p: [number, number, number]; rot: number }[] = [];

  const jit = (n: number) => (rand() - 0.5) * 2 * n;
  function addCluster(_cx: number, _cz: number, _radius: number, items: Array<() => void>) {
    for (const fn of items) fn();
  }
  function addTree(type: 'oak' | 'pine' | 'birch', x: number, z: number, s: number) {
    trees.push({ type, p: [x, 0, z], s, rot: rand() * Math.PI * 2 });
  }
  function addBush(x: number, z: number, s: number, tint: string, accent?: string) {
    bushes.push({ p: [x, 0, z], s, tint, accent });
  }
  function addStump(x: number, z: number) {
    stumps.push({ p: [x, 0, z], rot: rand() * Math.PI * 2 });
  }
  function addFlower(x: number, z: number, color: string, n = 12) {
    flowers.push({ p: [x, 0, z], color, n });
  }
  function addBoulder(x: number, z: number, s: number) {
    boulders.push({ p: [x, 0, z], s });
  }
  function addHay(x: number, z: number, rot: number) {
    hay.push({ p: [x, 0, z], rot });
  }

  // legacy zone palette tokens — Bush/FlowerPatch remap these onto neon
  const SAGE = ['#4e6240', '#5d7548', '#3f5234', '#6b8156'];
  const CREAM = '#e8dcb2';
  const LAVENDER = '#b9a3c4';
  const ROSE = '#c98a8a';
  const sageRand = () => SAGE[Math.floor(rand() * SAGE.length)];

  addCluster(-14, 0, 6, [
    () => addTree('pine', -15.5 + jit(0.5), -2 + jit(1.0), 1.30),
    () => addTree('pine', -16.2 + jit(0.6), -5 + jit(1.0), 1.40),
    () => addTree('oak',  -14.5 + jit(0.5),  1 + jit(1.0), 1.30),
    () => addTree('oak',  -16.5 + jit(0.5),  4 + jit(1.0), 1.20),
    () => addTree('pine', -13.5 + jit(0.4),  6 + jit(0.8), 1.15),
    () => addTree('oak',  -14.0 + jit(0.5), -8 + jit(0.8), 1.40),
    () => addTree('pine', -13.0 + jit(0.4), -10 + jit(0.8), 1.20),
    () => addTree('birch', -11.5 + jit(0.4), 3 + jit(0.6), 0.95),
    () => addTree('birch', -12.0 + jit(0.4), -3 + jit(0.6), 0.90),
    () => addBush(-11 + jit(0.5),  0 + jit(0.8), 1.1, sageRand()),
    () => addBush(-12 + jit(0.5), -5 + jit(0.8), 1.0, sageRand()),
    () => addBush(-13 + jit(0.5),  7 + jit(0.6), 1.2, sageRand()),
    () => addBush(-10.5 + jit(0.5), 5 + jit(0.6), 0.9, sageRand()),
    () => addStump(-10, -1),
  ]);

  addCluster(-9, -8, 5, [
    () => addTree('birch', -8.5 + jit(0.4), -8 + jit(0.6), 1.05),
    () => addTree('birch', -10.5 + jit(0.4), -10 + jit(0.6), 0.95),
    () => addTree('birch', -7 + jit(0.4), -10 + jit(0.6), 1.00),
    () => addBush(-8 + jit(0.3), -7 + jit(0.4), 1.0, sageRand(), CREAM),
    () => addBush(-9.5 + jit(0.3), -9 + jit(0.4), 0.95, sageRand(), LAVENDER),
    () => addBush(-7.5 + jit(0.3), -8.5 + jit(0.4), 0.85, sageRand()),
    () => addFlower(-9, -7, CREAM, 14),
    () => addFlower(-7.5, -10, LAVENDER, 10),
  ]);

  addTree('oak', 5, -12, 1.30);
  addBush(-4.5, -11.5, 0.9, sageRand());

  addCluster(8, -8, 4, [
    () => addTree('birch', 8 + jit(0.3), -8 + jit(0.5), 1.00),
    () => addTree('birch', 11 + jit(0.3), -9 + jit(0.5), 0.95),
    () => addFlower(9, -7, ROSE, 12),
    () => addBush(10.5 + jit(0.3), -8 + jit(0.4), 0.9, sageRand(), ROSE),
    () => addBush(9 + jit(0.3), -9 + jit(0.4), 0.8, sageRand()),
  ]);

  addCluster(11, 6, 5, [
    () => addBoulder(12, 5, 1.10),
    () => addBoulder(13, 7, 0.85),
    () => addBoulder(11, 8, 0.75),
    () => addBoulder(14, 4, 0.95),
    () => addBoulder(10, 6, 0.65),
    () => addTree('pine', 13 + jit(0.3), 9 + jit(0.4), 1.30),
    () => addTree('pine', 15 + jit(0.3), 6 + jit(0.4), 1.15),
    () => addBush(11.5 + jit(0.3), 5 + jit(0.3), 0.75, sageRand()),
  ]);

  addStump(-4, 8);
  addFlower(4, 10, CREAM, 14);
  addFlower(-3, 12, LAVENDER, 10);
  addBush(3 + jit(0.4), 13 + jit(0.4), 0.85, sageRand());
  addTree('oak', -6, 12, 1.20);

  addCluster(-9, 5, 4, [
    () => addHay(-9, 5, 0.4),
    () => addHay(-7.5, 4, 1.2),
    () => addHay(-10, 6.5, 0.8),
    () => addHay(-8, 7, 0.2),
    () => addStump(-6.5, 6),
    () => addTree('oak', -11, 8, 1.10),
    () => addTree('oak', -7, 9, 0.95),
    () => addBush(-9 + jit(0.3), 7 + jit(0.3), 0.9, sageRand()),
    () => addBush(-6 + jit(0.3), 5 + jit(0.3), 0.75, sageRand()),
  ]);

  addTree('oak', 9, 2, 1.20);
  addBush(4.5, -1, 0.7, sageRand());
  addBush(10, -5, 0.85, sageRand());
  addFlower(8, -6, CREAM, 10);

  for (const patch of [
    { cx: -16, cz: -13, a: ['oak', 'pine', 'birch'] as const },
    { cx:  -3, cz: -17, a: ['oak', 'oak', 'pine'] as const },
    { cx:  15, cz: -13, a: ['pine', 'oak'] as const },
    { cx:  18, cz:  -2, a: ['pine', 'oak', 'oak'] as const },
    { cx:  16, cz:  12, a: ['oak', 'birch'] as const },
    { cx:  -2, cz:  17, a: ['oak', 'pine'] as const },
    { cx: -16, cz:  12, a: ['pine', 'oak'] as const },
  ]) {
    for (const type of patch.a) {
      const ox = patch.cx + jit(1.3);
      const oz = patch.cz + jit(1.3);
      const s = type === 'pine'
        ? 1.10 + rand() * 0.35
        : type === 'oak'
        ? 1.20 + rand() * 0.40
        : 0.95 + rand() * 0.25;
      addTree(type, ox, oz, s);
    }
    addBush(patch.cx + jit(1.5), patch.cz + jit(1.5), 0.85, sageRand());
  }

  return { trees, bushes, stumps, flowers, boulders, hay };
}
