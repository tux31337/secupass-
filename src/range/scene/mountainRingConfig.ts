// 산 사진 링 설정 — 웹 원본(mini-game-test components/range/field/mountainRingConfig.ts)에서
// 모바일에 필요한 값만 가져온다 (apron 방위별 톤 샘플링은 모바일 미사용).

import { Color } from "three";

export const RING_RADIUS = 2600;

// 산 사진 다크 그레이드 — 채도↓ + 대비 유지 + 어두운 쿨 틴트.
export const GRADE_DESATURATE = 0.55;
export const GRADE_CONTRAST = 1.05;
export const GRADE_PIVOT = 0.3;
export const GRADE_TINT = "#83878c";

const _gradeTint = new Color(GRADE_TINT);

// 셰이더 주입용 — 틴트의 linear 성분 (Color 생성 시 sRGB→linear 변환됨).
export const GRADE_TINT_LINEAR: readonly [number, number, number] = [
  _gradeTint.r,
  _gradeTint.g,
  _gradeTint.b,
];

// 띠의 u=RING_U_FRONT 콘텐츠(열린 계곡+원경 능선)를 다운레인지(+Z) 정면에 두는 회전.
export const RING_U_FRONT = 0.34;
export const RING_ROTATION_Y = -Math.PI * 2 * RING_U_FRONT;
