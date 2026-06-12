// 드라이빙레인지 공통 상수. 과거 rangePhysics.ts의 탄도 계산은 제거되었고
// (재생 뷰어로 전환, docs/RANGE.md 참고) 배치 기준 상수만 여기 남는다.

export const RANGE_GROUND_Y = 0;
export const RANGE_BALL_RADIUS = 0.105;

// 티는 월드 원점에 있고 플레이어는 항상 +Z(down-range)를 향해 친다.
export const TEE = {
  x: 0,
  y: RANGE_GROUND_Y + RANGE_BALL_RADIUS,
  z: 0,
} as const;
