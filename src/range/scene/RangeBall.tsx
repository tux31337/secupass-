import { useRef } from "react";
import { useFrame } from "@react-three/fiber/native";
import type { Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import { useRangeStore } from "../store/useRangeStore.ts";
import { RANGE_BALL_RADIUS, RANGE_GROUND_Y, TEE } from "../rangeConfig.ts";

const SHADOW_BASE_RADIUS = 0.18;
const SHADOW_MAX_HEIGHT = 24;

// 공은 물리를 돌리지 않는다. store가 노출하는 재생 좌표(bx/by/bz)를 따라가고,
// 재생 진행은 store.tick으로 위임한다. 웹 버전의 CanvasTexture(딤플 범프,
// 그라데이션 블롭 그림자)는 RN에 document가 없어 제거하고, 그림자는 단색
// 반투명 원판으로 대체한다.
export function RangeBall() {
  const meshRef = useRef<Mesh>(null);
  const shadowRef = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  const shadowMatRef = useRef<MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    const store = useRangeStore.getState();
    store.tick(delta * 1000);

    const { bx, by, bz, status } = useRangeStore.getState();

    if (meshRef.current) {
      meshRef.current.position.set(bx, by, bz);
    }

    if (matRef.current) {
      const targetEmissive = status === "playing" ? 0.4 : 0;
      matRef.current.emissiveIntensity +=
        (targetEmissive - matRef.current.emissiveIntensity) * 0.15;
    }

    if (shadowRef.current && shadowMatRef.current) {
      const heightAbove = Math.max(0, by - RANGE_GROUND_Y - RANGE_BALL_RADIUS);
      shadowRef.current.position.set(bx, RANGE_GROUND_Y + 0.05, bz);
      const t = Math.min(heightAbove / SHADOW_MAX_HEIGHT, 1);
      shadowRef.current.scale.setScalar(1 + t * 1.8);
      shadowMatRef.current.opacity = Math.max(0, 0.4 * (1 - t * 0.85));
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={[TEE.x, TEE.y, TEE.z]}>
        <sphereGeometry args={[RANGE_BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial
          ref={matRef}
          color="#f8f8f8"
          roughness={0.42}
          metalness={0.02}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      <mesh
        ref={shadowRef}
        position={[TEE.x, RANGE_GROUND_Y + 0.05, TEE.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={1}
      >
        <circleGeometry args={[SHADOW_BASE_RADIUS, 24]} />
        <meshBasicMaterial
          ref={shadowMatRef}
          color="#000000"
          transparent
          depthWrite={false}
          opacity={0.4}
        />
      </mesh>
    </>
  );
}
