import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

// DJ silhouette (replaces the sheepdog). Player-controlled leader of the dance
// chain. Tall slim humanoid in dark club gear, glowing cyan headphone band on
// top of the head, holding a flashlight that throws a real cone of warm light
// onto the dance floor — so you can always find yourself in the dark.
export function Dog() {
  const bounceRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 6 + phase;
    const g = bounceRef.current;
    if (g) {
      // shorter, snappier hop than Piper (clubgoers don't bounce like dogs)
      g.position.y = Math.abs(Math.sin(t)) * 0.18;
      g.rotation.z = Math.sin(t) * 0.05;
    }
    // flashlight hand swings subtly so the cone moves with the beat
    if (armRef.current) {
      armRef.current.rotation.x = -0.25 + Math.sin(t * 1.05) * 0.08;
    }
  });

  return (
    <group>
      {/* floor shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.55} />
      </mesh>
      {/* "you are here" ground ring — slim glowing cyan torus on the floor
          centered on the DJ. Tracks the player so you always know where you
          are even when the camera is busy or the floor is crowded. */}
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.72, 32]} />
        <meshBasicMaterial color="#38e6ff" transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0.030, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.92, 32]} />
        <meshBasicMaterial color="#38e6ff" transparent opacity={0.30} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* flashlight cone — independent of the bouncing body so the beam is
          steady even as the DJ hops. Both the SpotLight and the volumetric
          cone live here. */}
      <FlashlightRig />

      <group ref={bounceRef}>
        {/* lower torso (black jeans) */}
        <RoundedBox args={[0.55, 0.55, 0.45]} radius={0.16} smoothness={5}
                    position={[0, 0.35, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#0d0d12" roughness={0.85} />
        </RoundedBox>
        {/* upper torso (dark tee) */}
        <RoundedBox args={[0.62, 0.55, 0.42]} radius={0.16} smoothness={5}
                    position={[0, 0.86, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#16161d" roughness={0.8} />
        </RoundedBox>
        {/* neck */}
        <mesh position={[0, 1.18, 0]} castShadow>
          <cylinderGeometry args={[0.10, 0.12, 0.12, 12]} />
          <meshStandardMaterial color="#1a1a22" />
        </mesh>
        {/* head */}
        <mesh position={[0, 1.38, 0]} castShadow>
          <sphereGeometry args={[0.26, 18, 14]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.75} />
        </mesh>
        {/* DJ signature — bright CYAN headphone band. This is the player's
            "I am the protagonist" identifier and is gameplay-critical: it
            tells you at a glance which figure on the floor is you. Cyan is
            also a dye color, but conflict is minimal — there's exactly one
            DJ on the field, and a small headphone band reads very differently
            from a cyan dancer's full-body neon outfit. */}
        <mesh position={[0, 1.50, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.055, 10, 28]} />
          <meshStandardMaterial color="#38e6ff" emissive="#38e6ff" emissiveIntensity={3.5} />
        </mesh>
        {/* headphone cups — bright cyan glow */}
        <mesh position={[-0.26, 1.45, 0]} castShadow>
          <sphereGeometry args={[0.10, 14, 12]} />
          <meshStandardMaterial color="#0a0a10" emissive="#38e6ff" emissiveIntensity={1.6} />
        </mesh>
        <mesh position={[ 0.26, 1.45, 0]} castShadow>
          <sphereGeometry args={[0.10, 14, 12]} />
          <meshStandardMaterial color="#0a0a10" emissive="#38e6ff" emissiveIntensity={1.6} />
        </mesh>

        {/* RIGHT arm — holds flashlight forward */}
        <group ref={armRef} position={[0.32, 1.02, 0.05]}>
          {/* upper arm */}
          <mesh position={[0, -0.16, 0.08]} rotation={[0.3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.38, 10]} />
            <meshStandardMaterial color="#16161d" roughness={0.85} />
          </mesh>
          {/* forearm + flashlight */}
          <mesh position={[0, -0.28, 0.32]} rotation={[1.15, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.4, 10]} />
            <meshStandardMaterial color="#16161d" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.31, 0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.16, 12]} />
            <meshStandardMaterial color="#2c2c34" metalness={0.6} roughness={0.35} />
          </mesh>
          {/* flashlight lens — bright */}
          <mesh position={[0, -0.31, 0.66]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.082, 0.082, 0.02, 16]} />
            <meshStandardMaterial color="#fff8d8" emissive="#fff2c0" emissiveIntensity={2.0} />
          </mesh>
        </group>

        {/* LEFT arm — relaxed at side */}
        <mesh position={[-0.34, 0.86, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.075, 0.5, 10]} />
          <meshStandardMaterial color="#16161d" roughness={0.85} />
        </mesh>

        {/* legs — two short cylinders */}
        <mesh position={[-0.14, 0.10, 0]} castShadow>
          <cylinderGeometry args={[0.10, 0.10, 0.20, 10]} />
          <meshStandardMaterial color="#0a0a10" roughness={0.85} />
        </mesh>
        <mesh position={[ 0.14, 0.10, 0]} castShadow>
          <cylinderGeometry args={[0.10, 0.10, 0.20, 10]} />
          <meshStandardMaterial color="#0a0a10" roughness={0.85} />
        </mesh>
        {/* shoes — pure white sneakers pop in the dark */}
        <RoundedBox args={[0.24, 0.10, 0.36]} radius={0.05} smoothness={3}
                    position={[-0.14, 0.02, 0.05]} castShadow>
          <meshStandardMaterial color="#f6f0e0" roughness={0.6} />
        </RoundedBox>
        <RoundedBox args={[0.24, 0.10, 0.36]} radius={0.05} smoothness={3}
                    position={[ 0.14, 0.02, 0.05]} castShadow>
          <meshStandardMaterial color="#f6f0e0" roughness={0.6} />
        </RoundedBox>
      </group>
    </group>
  );
}

// Real SpotLight + a forward-elongated floor puddle + a forward-elongated
// volumetric cone. All three live inside the Dog group so they rotate with the
// DJ's headRot. The puddle and cone use planeGeometry/coneGeometry sized
// directly (no negative-rotation + scale-hack that used to elongate the disc
// the wrong way). The spotLight target is wired manually each frame via
// useFrame so we don't depend on r3f's attach-mode auto-update.
function FlashlightRig() {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  useFrame(() => {
    const light = lightRef.current;
    const target = targetRef.current;
    if (!light || !target) return;
    if (light.target !== target) light.target = target;
    target.updateMatrixWorld(true);
  });

  return (
    <group>
      {/* SpotLight + its target. Target is a sibling object3D so its world
          matrix is updated through the same parent transform as the light. */}
      <spotLight
        ref={lightRef}
        position={[0, 1.3, 0.4]}
        angle={Math.PI / 5}
        penumbra={0.5}
        intensity={45}
        distance={12}
        decay={1.1}
        color="#fff2c0"
      />
      <object3D ref={targetRef} position={[0, 0, 3.5]} />

      {/* Floor puddle — one subtle disc that anchors the beam where it hits
          the floor. Kept dim so the SpotLight's real illumination carries
          most of the visual weight. */}
      <mesh position={[0, 0.014, 3.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.4, 36]} />
        <meshBasicMaterial color="#fff2c0" transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Volumetric beam — narrow at the lens, wide on the floor (like a real
          flashlight). ConeGeometry has its apex at local +Y and its base at
          local Y=0. Mesh origin sits AT the base (on the floor 3.5u ahead),
          and the rotation tilts the +Y axis back-and-up so the apex lands at
          the DJ's lens (~ y=1.0, z=0.3 in DJ local space).
          Vector from base→apex: (0, 1.0, -3.2), length ≈ 3.35 → cone height.
          Rotation: θ around X with cos θ = 0.30, sin θ = -0.95 → θ ≈ -72.5°. */}
      <mesh position={[0, 0, 3.5]} rotation={[-Math.PI * 0.403, 0, 0]}>
        <coneGeometry args={[1.5, 3.35, 28, 1, true]} />
        <meshBasicMaterial
          color="#fff0b0"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
