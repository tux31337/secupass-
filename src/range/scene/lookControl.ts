// 드래그 시선(yaw/pitch) 공유 상태. RangeScreen의 PanResponder가 갱신하고
// RangeCamera의 useFrame이 읽는다. React state로 두면 프레임마다 리렌더가
// 발생하므로 모듈 레벨 mutable 객체로 둔다 (웹 버전의 lookOffset ref와 동일한 역할).

const LOOK_SENSITIVITY = 0.0022;
const MAX_LOOK_YAW = 0.72;
const MAX_LOOK_UP = 0.3;
const MAX_LOOK_DOWN = -0.24;

export const lookControl = { yaw: 0, pitch: 0 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function applyLookDelta(dx: number, dy: number) {
  lookControl.yaw = clamp(lookControl.yaw + dx * LOOK_SENSITIVITY, -MAX_LOOK_YAW, MAX_LOOK_YAW);
  lookControl.pitch = clamp(
    lookControl.pitch - dy * LOOK_SENSITIVITY,
    MAX_LOOK_DOWN,
    MAX_LOOK_UP,
  );
}

export function resetLook() {
  lookControl.yaw = 0;
  lookControl.pitch = 0;
}
