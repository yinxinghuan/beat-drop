import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

interface WolfProps {
  stunned?: boolean;
}

// Bouncer (replaces the wolf). Full character: bulky suited body, neon vest
// trim across the chest, dark head + white-bar sunglasses, earpiece coiled to
// the shoulder, arms folded across the chest. Stands taller than a dancer so
// the silhouette pops in a crowd. When stunned by a MIC DROP, the head tilts
// back, arms drop, and stun stars spin above.
export function Wolf({ stunned = false }: WolfProps) {
  const bounceRef = useRef<THREE.Group>(null);
  const armsRef = useRef<THREE.Group>(null);
  const lensMatL = useRef<THREE.MeshStandardMaterial>(null);
  const lensMatR = useRef<THREE.MeshStandardMaterial>(null);
  const earpieceMat = useRef<THREE.MeshStandardMaterial>(null);
  const ringMatInner = useRef<THREE.MeshBasicMaterial>(null);
  const ringMatOuter = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bounceRef.current) {
      bounceRef.current.position.y = stunned ? -0.04 : Math.abs(Math.sin(t * 6)) * 0.10;
      bounceRef.current.rotation.z = stunned ? 0.32 : Math.sin(t * 6) * 0.03;
    }
    // when stunned, arms slump
    if (armsRef.current) {
      const target = stunned ? -0.7 : 0;
      armsRef.current.rotation.x += (target - armsRef.current.rotation.x) * 0.18;
    }
    if (lensMatL.current && lensMatR.current) {
      const target = stunned ? 0 : 0.5;
      lensMatL.current.emissiveIntensity += (target - lensMatL.current.emissiveIntensity) * 0.2;
      lensMatR.current.emissiveIntensity = lensMatL.current.emissiveIntensity;
    }
    if (earpieceMat.current) {
      // earpiece pulses slowly so the bouncer reads as "on the radio"
      earpieceMat.current.emissiveIntensity = stunned ? 0 : 0.8 + Math.sin(t * 2.5) * 0.4;
    }
    // "threat" ring under the bouncer — pulses red when active, fades to a
    // dim warm-white when stunned so the visual state matches gameplay state.
    const pulse = stunned ? 0 : 0.7 + (Math.sin(t * 3.2) + 1) * 0.25;
    if (ringMatInner.current) ringMatInner.current.opacity = pulse;
    if (ringMatOuter.current) ringMatOuter.current.opacity = pulse * 0.45;
  });

  return (
    <group>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.55} />
      </mesh>
      {/* "watch out" threat ring under the bouncer — red, pulses when active,
          dims when stunned. Mirrors the DJ's cyan ring so the two characters
          are immediately distinguishable as Player (cyan) vs Threat (red). */}
      <mesh position={[0, 0.038, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.92, 32]} />
        <meshBasicMaterial ref={ringMatInner} color="#ff2030" transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0.033, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.92, 1.18, 32]} />
        <meshBasicMaterial ref={ringMatOuter} color="#ff2030" transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group ref={bounceRef}>
        {/* lower torso — broad dark suit pants */}
        <RoundedBox args={[0.85, 0.55, 0.55]} radius={0.16} smoothness={5}
                    position={[0, 0.4, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#0c0c14" roughness={0.9} />
        </RoundedBox>
        {/* upper torso — wide chest, suit jacket */}
        <RoundedBox args={[1.05, 0.72, 0.6]} radius={0.18} smoothness={5}
                    position={[0, 0.98, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#16161e" roughness={0.85} />
        </RoundedBox>
        {/* vivid RED hi-vis vest trim — RED is intentionally OUTSIDE the dye
            palette (which is pink/cyan/amber/lime) so a bouncer cannot be
            confused for a pink-dye dancer or any other delivery target */}
        <RoundedBox args={[1.08, 0.14, 0.62]} radius={0.04} smoothness={3}
                    position={[0, 1.20, 0]} castShadow>
          <meshStandardMaterial color="#ff2030" emissive="#ff2030" emissiveIntensity={1.3} roughness={0.4} />
        </RoundedBox>
        {/* secondary vest stripe */}
        <RoundedBox args={[1.08, 0.06, 0.62]} radius={0.02} smoothness={3}
                    position={[0, 0.78, 0]}>
          <meshStandardMaterial color="#ff2030" emissive="#ff2030" emissiveIntensity={0.95} roughness={0.4} />
        </RoundedBox>

        {/* neck */}
        <mesh position={[0, 1.45, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 0.16, 12]} />
          <meshStandardMaterial color="#1a1a22" />
        </mesh>
        {/* head — bigger than a dancer, shaved look */}
        <mesh position={[0, 1.68, 0]} castShadow>
          <sphereGeometry args={[0.32, 18, 14]} />
          <meshStandardMaterial color="#1c1c24" roughness={0.7} />
        </mesh>
        {/* sunglasses — white horizontal bar across the eyes, sits forward */}
        <RoundedBox args={[0.56, 0.13, 0.06]} radius={0.05} smoothness={3}
                    position={[0, 1.70, 0.28]} castShadow>
          <meshStandardMaterial color="#0a0a0e" metalness={0.4} roughness={0.25} />
        </RoundedBox>
        {/* mirror lenses — cool-white reflection catches club light without
            using a dye color */}
        <mesh position={[-0.13, 1.70, 0.32]}>
          <boxGeometry args={[0.20, 0.10, 0.02]} />
          <meshStandardMaterial ref={lensMatL} color="#0e0e14" emissive="#cfe0f0" emissiveIntensity={0.45} metalness={0.8} roughness={0.15} />
        </mesh>
        <mesh position={[ 0.13, 1.70, 0.32]}>
          <boxGeometry args={[0.20, 0.10, 0.02]} />
          <meshStandardMaterial ref={lensMatR} color="#0e0e14" emissive="#cfe0f0" emissiveIntensity={0.45} metalness={0.8} roughness={0.15} />
        </mesh>
        {/* earpiece — small pulsing dot at the right ear with a thin coil
            running down to the shoulder */}
        <mesh position={[0.30, 1.66, 0]} castShadow>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshStandardMaterial ref={earpieceMat} color="#fff" emissive="#fff5d8" emissiveIntensity={1.0} />
        </mesh>
        {/* earpiece coil — thin curved cylinder from ear to shoulder */}
        <mesh position={[0.34, 1.45, 0.02]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.014, 0.014, 0.38, 6]} />
          <meshStandardMaterial color="#222229" />
        </mesh>

        {/* ARMS — folded across chest. Two stacked rounded boxes angled in.
            Wrapped in a group so when stunned they slump downward together. */}
        <group ref={armsRef} position={[0, 1.10, 0]}>
          {/* upper arms (sleeves) */}
          <mesh position={[-0.55, -0.05, 0.15]} rotation={[0, 0, -1.0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.52, 12]} />
            <meshStandardMaterial color="#16161e" roughness={0.85} />
          </mesh>
          <mesh position={[ 0.55, -0.05, 0.15]} rotation={[0, 0,  1.0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.52, 12]} />
            <meshStandardMaterial color="#16161e" roughness={0.85} />
          </mesh>
          {/* forearms folded over the chest (horizontal) */}
          <RoundedBox args={[0.78, 0.18, 0.22]} radius={0.08} smoothness={3}
                      position={[0, -0.05, 0.36]} castShadow>
            <meshStandardMaterial color="#16161e" roughness={0.85} />
          </RoundedBox>
          {/* fists clenched at the wrists */}
          <mesh position={[-0.32, -0.05, 0.43]} castShadow>
            <sphereGeometry args={[0.11, 12, 10]} />
            <meshStandardMaterial color="#2a2a35" roughness={0.85} />
          </mesh>
          <mesh position={[ 0.32, -0.05, 0.43]} castShadow>
            <sphereGeometry args={[0.11, 12, 10]} />
            <meshStandardMaterial color="#2a2a35" roughness={0.85} />
          </mesh>
        </group>

        {/* legs — short, planted */}
        <mesh position={[-0.20, 0.10, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.20, 10]} />
          <meshStandardMaterial color="#08080e" roughness={0.85} />
        </mesh>
        <mesh position={[ 0.20, 0.10, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.20, 10]} />
          <meshStandardMaterial color="#08080e" roughness={0.85} />
        </mesh>
        {/* shoes — polished black with a tiny highlight */}
        <RoundedBox args={[0.28, 0.10, 0.36]} radius={0.05} smoothness={3}
                    position={[-0.20, 0.02, 0.05]} castShadow>
          <meshStandardMaterial color="#0a0a10" metalness={0.6} roughness={0.25} />
        </RoundedBox>
        <RoundedBox args={[0.28, 0.10, 0.36]} radius={0.05} smoothness={3}
                    position={[ 0.20, 0.02, 0.05]} castShadow>
          <meshStandardMaterial color="#0a0a10" metalness={0.6} roughness={0.25} />
        </RoundedBox>

        {stunned && <StunStars />}
      </group>
    </group>
  );
}

function StunStars() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 5;
  });
  return (
    <group ref={ref} position={[0, 2.05, 0.4]}>
      {[0, 1, 2].map(i => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.40, Math.sin(a) * 0.10, Math.sin(a) * 0.40]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.6} />
          </mesh>
        );
      })}
    </group>
  );
}
