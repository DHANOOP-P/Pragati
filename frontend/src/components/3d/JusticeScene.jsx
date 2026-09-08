import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float } from "@react-three/drei";
import * as THREE from "three";

const lerp = (a, b, t) => a + (b - a) * t;

function useBrass() {
  return useMemo(() => {
    const brass = new THREE.MeshPhysicalMaterial({
      color: "#6b4e2a",
      metalness: 1,
      roughness: 0.38,
      clearcoat: 0.12,
      clearcoatRoughness: 0.55,
      envMapIntensity: 1.15,
      sheen: 0.12,
      sheenColor: new THREE.Color("#c9a45a"),
    });
    const dark = new THREE.MeshPhysicalMaterial({
      color: "#3a2a18",
      metalness: 1,
      roughness: 0.48,
      envMapIntensity: 0.9,
    });
    const highlight = new THREE.MeshPhysicalMaterial({
      color: "#a0783a",
      metalness: 1,
      roughness: 0.28,
      envMapIntensity: 1.35,
    });
    return { brass, dark, highlight };
  }, []);
}

function Chain({ from, to, material, count = 10 }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const rotZ = Math.atan2(dx, -dy);
  const rotX = Math.atan2(dz, Math.hypot(dx, dy));
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5) / count;
        return (
          <mesh
            key={i}
            position={[lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)]}
            rotation={[rotX + (i % 2 ? Math.PI / 2 : 0), 0, rotZ]}
            material={material}
          >
            <torusGeometry args={[0.018, 0.0055, 7, 12]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Pan({ mats }) {
  const dish = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.155, 0.008),
      new THREE.Vector2(0.2, 0.038),
      new THREE.Vector2(0.215, 0.062),
      new THREE.Vector2(0.2, 0.07),
      new THREE.Vector2(0.188, 0.052),
    ];
    return new THREE.LatheGeometry(pts, 56);
  }, []);
  return (
    <group>
      <mesh geometry={dish} material={mats.brass} castShadow receiveShadow />
      <mesh position={[0, 0.068, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.highlight}>
        <torusGeometry args={[0.2, 0.01, 10, 40]} />
      </mesh>
    </group>
  );
}

function FlutedColumn({ mats, height = 1.22, radius = 0.062 }) {
  const flutes = 10;
  return (
    <group>
      <mesh material={mats.dark} castShadow>
        <cylinderGeometry args={[radius * 0.84, radius * 0.92, height, 28]} />
      </mesh>
      {Array.from({ length: flutes }, (_, i) => {
        const a = (i / flutes) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * radius * 0.78, 0, Math.sin(a) * radius * 0.78]}
            material={mats.brass}
          >
            <cylinderGeometry args={[0.011, 0.011, height * 0.96, 8]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Collar({ y, r, mats }) {
  return (
    <group position={[0, y, 0]}>
      <mesh material={mats.highlight} castShadow>
        <cylinderGeometry args={[r, r * 0.96, 0.045, 28]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={mats.dark}>
        <torusGeometry args={[r * 0.92, 0.01, 8, 28]} />
      </mesh>
    </group>
  );
}

function ScaleOfJustice({ reduce, spin }) {
  const group = useRef();
  const auto = useRef(0.25);
  const mats = useBrass();
  const beamY = 1.42;
  const span = 0.78;
  const panY = 0.72;

  useFrame((state, dt) => {
    if (!group.current) return;
    if (!reduce && !spin.current.dragging) auto.current += dt * 0.32;
    const yaw = auto.current + spin.current.yaw + state.pointer.x * 0.72;
    const pitch = 0.05 + spin.current.pitch + state.pointer.y * 0.18;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, yaw, 3.4, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pitch, 3.4, dt);
  });

  const panRims = (side) => {
    const cx = side * span;
    return [0, 1, 2].map((i) => {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      return [cx + Math.cos(a) * 0.175, panY + 0.07, Math.sin(a) * 0.175];
    });
  };

  return (
    <Float speed={reduce ? 0 : 0.7} floatIntensity={reduce ? 0 : 0.08} rotationIntensity={0}>
      <group ref={group} position={[0, -0.92, 0]} scale={1.02}>
        <mesh position={[0, 0.05, 0]} material={mats.dark} castShadow receiveShadow>
          <cylinderGeometry args={[0.58, 0.64, 0.1, 48]} />
        </mesh>
        <mesh position={[0, 0.13, 0]} material={mats.brass} castShadow>
          <cylinderGeometry args={[0.46, 0.52, 0.08, 48]} />
        </mesh>
        <mesh position={[0, 0.2, 0]} material={mats.highlight}>
          <cylinderGeometry args={[0.34, 0.4, 0.07, 40]} />
        </mesh>
        <mesh position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.dark}>
          <torusGeometry args={[0.33, 0.014, 10, 40]} />
        </mesh>

        <group position={[0, 0.84, 0]}>
          <FlutedColumn mats={mats} />
        </group>
        <Collar y={0.32} r={0.09} mats={mats} />
        <Collar y={0.72} r={0.082} mats={mats} />
        <Collar y={1.18} r={0.08} mats={mats} />
        <Collar y={1.38} r={0.07} mats={mats} />

        <mesh position={[0, 1.5, 0]} material={mats.highlight} castShadow>
          <sphereGeometry args={[0.055, 20, 16]} />
        </mesh>
        <mesh position={[0, 1.58, 0]} material={mats.dark} castShadow>
          <coneGeometry args={[0.038, 0.14, 16]} />
        </mesh>

        <mesh position={[0, beamY, 0]} material={mats.brass} castShadow>
          <boxGeometry args={[0.7, 0.04, 0.04]} />
        </mesh>
        <mesh position={[-0.52, beamY - 0.02, 0]} rotation={[0, 0, 0.1]} material={mats.brass} castShadow>
          <boxGeometry args={[0.72, 0.034, 0.034]} />
        </mesh>
        <mesh position={[0.52, beamY - 0.02, 0]} rotation={[0, 0, -0.1]} material={mats.brass} castShadow>
          <boxGeometry args={[0.72, 0.034, 0.034]} />
        </mesh>
        {[-span, span].map((x) => (
          <group key={x}>
            <mesh position={[x, beamY, 0]} material={mats.highlight} castShadow>
              <sphereGeometry args={[0.032, 14, 12]} />
            </mesh>
            <mesh position={[x, beamY - 0.04, 0]} material={mats.dark}>
              <cylinderGeometry args={[0.012, 0.012, 0.06, 10]} />
            </mesh>
          </group>
        ))}

        {[-1, 1].map((side) => (
          <group key={side} position={[side * span, panY, 0]}>
            <Pan mats={mats} />
          </group>
        ))}
        {[-1, 1].map((side) =>
          panRims(side).map((to, i) => (
            <Chain key={`${side}-${i}`} from={[side * span, beamY - 0.05, 0]} to={to} material={mats.highlight} />
          ))
        )}
      </group>
    </Float>
  );
}

const JusticeScene = ({ reduce = false }) => {
  const spin = useRef({ yaw: 0, pitch: 0, dragging: false, x: 0, y: 0 });

  const onPointerDown = (e) => {
    spin.current.dragging = true;
    spin.current.x = e.clientX;
    spin.current.y = e.clientY;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!spin.current.dragging) return;
    spin.current.yaw += (e.clientX - spin.current.x) * 0.008;
    spin.current.pitch += (e.clientY - spin.current.y) * 0.004;
    spin.current.pitch = Math.max(-0.4, Math.min(0.4, spin.current.pitch));
    spin.current.x = e.clientX;
    spin.current.y = e.clientY;
  };
  const onPointerUp = (e) => {
    spin.current.dragging = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div
      className="idea-stage-canvas absolute inset-0"
      data-cursor="Weigh"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ position: [0.08, 0.38, 3.45], fov: 32, near: 0.1, far: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ touchAction: "none" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <ambientLight intensity={0.12} />
        <spotLight
          position={[0, 2.4, -3.2]}
          angle={0.55}
          penumbra={0.9}
          intensity={4.2}
          color="#e8b45a"
        />
        <pointLight position={[0, 1.2, -1.4]} intensity={2.1} color="#d7b56d" />
        <spotLight
          position={[2.6, 4.2, 2.8]}
          angle={0.4}
          penumbra={0.85}
          intensity={1.35}
          color="#f3e6c8"
          castShadow
        />
        <directionalLight position={[-2.4, 1.6, 1.2]} intensity={0.28} color="#8a5a32" />
        <ScaleOfJustice reduce={reduce} spin={spin} />
        <Suspense fallback={null}>
          <Environment preset="night" environmentIntensity={0.35} />
        </Suspense>
        <ContactShadows position={[0, -1.12, 0]} opacity={0.52} scale={5.8} blur={2.6} far={2} color="#050308" />
      </Canvas>
    </div>
  );
};

export default JusticeScene;
