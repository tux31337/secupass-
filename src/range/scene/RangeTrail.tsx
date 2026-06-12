import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber/native";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Line,
  LineBasicMaterial,
} from "three";
import { useRangeStore } from "../store/useRangeStore.ts";

// 궤적 라인. 로드된 궤적의 월드 좌표를 재생 진행도(progress)까지 점진적으로 그린다.
// 공이 날아가는 동안 라인이 자라나고, 재생 전/후에는 전체 호가 보인다.
// 웹 버전은 <line> 인트린식을 썼지만, RN(DOM lib 부재) 타입 충돌을 피해
// THREE.Line 객체를 직접 만들어 <primitive>로 렌더링한다.
export function RangeTrail() {
  const builtForRef = useRef<string | null>(null);
  const lastCountRef = useRef(-1);

  const lineObj = useMemo(() => {
    const geometry = new BufferGeometry();
    const material = new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const line = new Line(geometry, material);
    line.frustumCulled = false;
    return line;
  }, []);

  useFrame(() => {
    const { player, status, progress } = useRangeStore.getState();
    if (!player) return;

    const geo = lineObj.geometry;
    const pts = player.worldPoints();
    const total = pts.length;

    // 궤적이 바뀌면 색상 그라데이션을 다시 만든다.
    if (builtForRef.current !== player.shotId) {
      const colors = new Float32Array(total * 3);
      for (let i = 0; i < total; i++) {
        const t = i / Math.max(total - 1, 1);
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.6 + t * 0.4;
        colors[i * 3 + 2] = t * 0.3;
      }
      const positions = new Float32Array(total * 3);
      for (let i = 0; i < total; i++) {
        positions[i * 3] = pts[i].x;
        positions[i * 3 + 1] = pts[i].y;
        positions[i * 3 + 2] = pts[i].z;
      }
      geo.setAttribute("position", new BufferAttribute(positions, 3));
      geo.setAttribute("color", new BufferAttribute(colors, 3));
      builtForRef.current = player.shotId;
      lastCountRef.current = -1;
    }

    // 재생 중에는 진행도까지만, 그 외에는 전체 호를 보여준다.
    const reveal =
      status === "playing" || status === "paused"
        ? Math.max(2, Math.ceil(progress * total))
        : total;

    if (reveal !== lastCountRef.current) {
      geo.setDrawRange(0, reveal);
      lastCountRef.current = reveal;
    }

    (lineObj.material as LineBasicMaterial).opacity = status === "playing" ? 0.9 : 0.55;
  });

  return <primitive object={lineObj} />;
}
