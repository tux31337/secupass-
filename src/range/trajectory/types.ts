// 센서 궤적 데이터 계약 (docs/RANGE.md). 원본 센서 좌표는 수정하지 않는다.

export interface TrajectoryPoint {
  timestampMs: number;
  x: number;
  y: number;
  z: number;
}

export interface ShotTrajectory {
  shotId: string;
  points: TrajectoryPoint[];
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}
