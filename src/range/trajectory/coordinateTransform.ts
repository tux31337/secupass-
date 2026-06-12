import type { TrajectoryPoint, Vec3 } from "./types.ts";

// 센서 좌표 → Three.js 월드 좌표 변환 경계.
// 현재 센서는 Three.js 규칙(x=좌우, y=높이, z=전방)을 그대로 따른다고 가정하므로
// 항등 변환이다. 실제 센서의 축 매핑/스케일/원점 보정이 달라지면 이 함수만 고친다.
// 이 경계를 분리해 두는 이유는 원본 센서 좌표와 렌더링 좌표를 섞지 않기 위함이다.
export function sensorToWorld(p: TrajectoryPoint): Vec3 {
  return { x: p.x, y: p.y, z: p.z };
}
