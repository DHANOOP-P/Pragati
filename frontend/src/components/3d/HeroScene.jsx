import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function Sculpture({ progress }) {
  const group = useRef();
  const ribbon = useRef();
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d7b56d",
        metalness: 0.86,
        roughness: 0.22,
      }),
    []
  );
  const ember = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c45c2d",
        metalness: 0.4,
        roughness: 0.35,
        emissive: "#3a1408",
        emissiveIntensity: 0.4,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    const p = progress.current;
    group.current.rotation.y += delta * 0.15 + p * 0.002;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, p * 0.6 - 0.15, 0.05);
    group.current.position.y = Math.sin(Date.now() * 0.001) * 0.12;
    group.current.scale.setScalar(1 + p * 0.25);
    if (ribbon.current) ribbon.current.rotation.z += delta * 0.4;
  });

  return (
    <Float speed={1.1} floatIntensity={0.4} rotationIntensity={0.15}>
      <group ref={group}>
        <mesh material={mat}>
          <torusKnotGeometry args={[1.05, 0.18, 180, 16, 2, 3]} />
        </mesh>
        <mesh ref={ribbon} position={[0, 0, 0]} material={ember}>
          <torusGeometry args={[1.55, 0.02, 8, 80]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={mat}>
          <torusGeometry args={[1.9, 0.015, 8, 80]} />
        </mesh>
      </group>
    </Float>
  );
}

const HeroScene = ({ progress }) => (
  <div className="absolute inset-0 z-0">
    <Canvas camera={{ position: [0, 0.2, 6.2], fov: 40 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
      <color attach="background" args={["#07060a"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.7} color="#ffe7b8" />
      <pointLight position={[-4, -1, 2]} intensity={1.2} color="#c45c2d" />
      <Suspense fallback={null}>
        <Sculpture progress={progress} />
      </Suspense>
    </Canvas>
  </div>
);

export default HeroScene;
