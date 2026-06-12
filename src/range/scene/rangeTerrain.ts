// 드라이빙레인지 지형 셰이핑 — 웹 원본(mini-game-test components/range/field/rangeTerrain.ts)
// 전체 포팅. 공이 날아가는 중앙 플레이 코리도는 RANGE_GROUND_Y(=0)로 평평하게 유지해
// 재생되는 공과 착지 마커가 지면에 정확히 붙고, 굴곡은 양옆 러프와 코스 가장자리에만 준다.

import { RANGE_GROUND_Y } from "../rangeConfig.ts";

export const FIELD_WIDTH = 1100;
export const FIELD_START = -28; // 티 뒤쪽
export const FIELD_END = 1850; // 다운레인지 끝
export const FIELD_LENGTH = FIELD_END - FIELD_START;
export const FIELD_CENTER_Z = (FIELD_START + FIELD_END) / 2;

// |x| < FAIRWAY_HALF 는 페어웨이, CORRIDOR_HALF 까지는 평평, 그 너머부터 러프가 솟는다.
export const FAIRWAY_HALF = 125;
export const CORRIDOR_HALF = 165;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export { smoothstep };

// 코리도 안에서는 0, 바깥으로 갈수록 부드럽게 솟아오르는 굴곡. 코리도 경계에서
// 마스크가 0이라 평평한 레인과 자연스럽게 이어진다(접힘선 없음).
export function rangeTerrainY(x: number, z: number): number {
  const ax = Math.abs(x);
  const sideMask = smoothstep(CORRIDOR_HALF, CORRIDOR_HALF + 85, ax);

  // 낮은 주파수 롤 + 약간의 디테일. +1.1 베이스로 러프를 페어웨이보다 살짝 높여
  // 완만한 분지(valley) 느낌을 준다.
  const roll =
    Math.sin(x * 0.028 + 0.6) * 1.7 +
    Math.cos(z * 0.017 + 1.1) * 1.25 +
    Math.sin((x * 0.4 + z) * 0.011) * 0.9 +
    1.15;

  // 코스 맨 끝에서 러프가 한 단계 더 솟아, 지평선이 평면 절단처럼 보이지 않게 든다.
  const backRise = smoothstep(FIELD_END - 180, FIELD_END + 40, z) * 7.5;
  const fairwayHorizonLift =
    smoothstep(FIELD_END - 420, FIELD_END + 40, z) *
    (1.25 + Math.sin(x * 0.012 + z * 0.004) * 0.35);
  const fairwayHorizonMask =
    1 - smoothstep(FAIRWAY_HALF * 0.65, CORRIDOR_HALF + 120, ax) * 0.55;

  return RANGE_GROUND_Y + roll * sideMask + backRise * sideMask + fairwayHorizonLift * fairwayHorizonMask;
}
