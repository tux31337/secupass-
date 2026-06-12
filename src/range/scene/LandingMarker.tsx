import { useRef } from "react";
import { useFrame } from "@react-three/fiber/native";
import type { Group } from "three";
import { useRangeStore } from "../store/useRangeStore.ts";
import { RANGE_GROUND_Y } from "../rangeConfig.ts";

// 착지 지점 마커. 재생이 끝나면 착지 좌표에 맥동하는 타깃 링을 띄운다.
export function LandingMarker() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;

    const { landing, status } = useRangeStore.getState();
    const show = status === "finished" && !!landing;
    g.visible = show;
    if (!show || !landing) return;

    g.position.set(landing.x, RANGE_GROUND_Y + 0.06, landing.z);
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.2) * 0.06;
    g.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <mesh>
        <ringGeometry args={[0.82, 1.08, 48]} />
        <meshBasicMaterial color="#ff5a3c" transparent opacity={0.62} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <circleGeometry args={[0.26, 32]} />
        <meshBasicMaterial color="#ffd23c" transparent opacity={0.52} toneMapped={false} />
      </mesh>
    </group>
  );
}
