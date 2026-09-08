import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const GOLD = "#d7b56d";
const EMBER = "#c45c2d";

function OrbitField({ reduce }) {
  const outer = useRef();
  const inner = useRef();
  const embers = useRef();

  useFrame((state, dt) => {
    if (reduce) return;
    const t = state.clock.elapsedTime;
    if (outer.current) {
      outer.current.rotation.y += dt * 0.14;
      outer.current.rotation.z += dt * 0.04;
    }
    if (inner.current) {
      inner.current.rotation.y -= dt * 0.22;
      inner.current.rotation.x = 0.55 + Math.sin(t * 0.35) * 0.08;
    }
    if (embers.current) {
      embers.current.children.forEach((child, i) => {
        const speed = 0.35 + i * 0.12;
        const radius = 0.7 + i * 0.38;
        child.position.x = Math.cos(t * speed + i) * radius;
        child.position.z = Math.sin(t * speed + i * 1.3) * radius;
        child.position.y = Math.sin(t * 0.7 + i) * 0.28;
        child.rotation.y += dt * (0.6 + i * 0.2);
      });
    }
  });

  return (
    <group>
      <group ref={outer} rotation={[0.72, 0.15, 0.35]}>
        {[1.05, 1.55, 2.1, 2.7].map((r, i) => (
          <mesh key={r} rotation={[Math.PI / 2, 0, i * 0.45]}>
            <torusGeometry args={[r, i === 2 ? 0.018 : 0.01, 8, 96]} />
            <meshStandardMaterial
              color={i % 2 ? GOLD : "#e8c888"}
              metalness={0.92}
              roughness={0.28}
              transparent
              opacity={0.62 - i * 0.1}
            />
          </mesh>
        ))}
      </group>
      <group ref={inner} rotation={[1.05, 0, 0.2]}>
        <mesh>
          <icosahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial
            color={GOLD}
            metalness={0.88}
            roughness={0.32}
            wireframe
            transparent
            opacity={0.55}
          />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={EMBER} metalness={0.7} roughness={0.35} />
        </mesh>
      </group>
      <group ref={embers}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i}>
            <octahedronGeometry args={[0.045 + i * 0.008, 0]} />
            <meshStandardMaterial
              color={i % 2 ? GOLD : EMBER}
              metalness={0.85}
              roughness={0.3}
              emissive={i % 2 ? GOLD : EMBER}
              emissiveIntensity={0.22}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

const CurrentScene = () => {
  const wrap = useRef(null);
  const reduce = useReducedMotion();
  const [live, setLive] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting), {
      threshold: 0.08,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="current-band-scene" aria-hidden>
      <Canvas
        frameloop={live && !reduce ? "always" : "demand"}
        dpr={[1, 1.35]}
        camera={{ position: [0, 0.15, 5.2], fov: 38, near: 0.1, far: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        style={{ pointerEvents: "none" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.22} />
        <pointLight position={[2.2, 1.4, 3]} intensity={2.4} color={GOLD} />
        <pointLight position={[-2.4, -0.6, 2]} intensity={1.4} color={EMBER} />
        <directionalLight position={[0, 3, 2]} intensity={0.45} color="#f3e6c8" />
        <OrbitField reduce={reduce} />
      </Canvas>
    </div>
  );
};

export default CurrentScene;
