import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { DYE_PALETTE } from '../constants';

interface SheepProps {
  colorType: number;
  isTarget?: boolean;
  scale?: number;
}

// Dancer (replaces the sheep). Chunky humanoid in a neon outfit — the dye
// color slot drives the shirt/jacket so a sea of pink dancers reads "all of
// these go to the pink stage door." Dark head + glowing wristbands so each
// figure has a clear silhouette against the dark floor.
export function Sheep({ colorType, isTarget = false, scale = 1 }: SheepProps) {
  const dye = DYE_PALETTE[colorType % DYE_PALETTE.length];
  const bounceRef = useRef<THREE.Group>(null);
  const armsRef = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    const g = bounceRef.current;
    if (!g) return;
    const inChain = g.parent?.userData.inChain;
    const speed = inChain ? 6 : 3.2;
    const t = clock.getElapsedTime() * speed + phase;
    g.position.y = Math.abs(Math.sin(t)) * 0.32;
    g.rotation.z = Math.sin(t) * 0.06;
    if (armsRef.current) {
      armsRef.current.rotation.x = -0.4 + Math.sin(t * 1.2) * 0.55;
    }
  });

  return (
    <group scale={scale}>
      {/* floor shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.45} />
      </mesh>
      <group ref={bounceRef}>
        {/* lower torso (dark pants) */}
        <RoundedBox args={[0.55, 0.5, 0.4]} radius={0.15} smoothness={5}
                    position={[0, 0.32, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#100c18" roughness={0.85} />
        </RoundedBox>
        {/* upper torso — NEON outfit in dye color (the gameplay-critical bit) */}
        <RoundedBox args={[0.7, 0.62, 0.46]} radius={0.18} smoothness={5}
                    position={[0, 0.82, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={dye} emissive={dye} emissiveIntensity={0.5} roughness={0.55} />
        </RoundedBox>
        {/* head — dark sphere */}
        <mesh position={[0, 1.32, 0]} castShadow>
          <sphereGeometry args={[0.25, 18, 14]} />
          <meshStandardMaterial color="#161620" roughness={0.8} />
        </mesh>
        {/* hair tuft — dye-tinted highlight so the head feels lit up */}
        <mesh position={[0, 1.48, -0.02]} castShadow>
          <sphereGeometry args={[0.20, 14, 10]} />
          <meshStandardMaterial color={dye} emissive={dye} emissiveIntensity={0.35} roughness={0.7} />
        </mesh>

        {/* arms — up in the air, dye color sleeves */}
        <group ref={armsRef} position={[0, 1.02, 0]}>
          <mesh position={[-0.42, 0.16, 0]} rotation={[0, 0, 0.55]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.52, 10]} />
            <meshStandardMaterial color={dye} emissive={dye} emissiveIntensity={0.3} roughness={0.6} />
          </mesh>
          <mesh position={[ 0.42, 0.16, 0]} rotation={[0, 0, -0.55]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.52, 10]} />
            <meshStandardMaterial color={dye} emissive={dye} emissiveIntensity={0.3} roughness={0.6} />
          </mesh>
          {/* glowing wristbands */}
          <mesh position={[-0.55, 0.40, 0]}>
            <sphereGeometry args={[0.085, 12, 10]} />
            <meshStandardMaterial color="#ffffff" emissive={dye} emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[ 0.55, 0.40, 0]}>
            <sphereGeometry args={[0.085, 12, 10]} />
            <meshStandardMaterial color="#ffffff" emissive={dye} emissiveIntensity={2.5} />
          </mesh>
        </group>

        {/* legs */}
        <mesh position={[-0.13, 0.10, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.20, 10]} />
          <meshStandardMaterial color="#08080d" roughness={0.85} />
        </mesh>
        <mesh position={[ 0.13, 0.10, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.20, 10]} />
          <meshStandardMaterial color="#08080d" roughness={0.85} />
        </mesh>

        {/* target ribbon — same readability hook as Piper: a glowing tag
            floating above any dancer the player should currently grab. */}
        {isTarget && (
          <mesh position={[0, 1.92, 0]} rotation={[0, 0.4, 0]}>
            <planeGeometry args={[0.42, 0.22]} />
            <meshStandardMaterial color={dye} side={THREE.DoubleSide} emissive={dye} emissiveIntensity={1.0} transparent opacity={0.95} />
          </mesh>
        )}
      </group>
    </group>
  );
}
