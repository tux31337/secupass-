import { RANGE_BALL_RADIUS } from "../rangeConfig.ts";
import { sensorToWorld } from "./coordinateTransform.ts";
import type { ShotTrajectory, Vec3 } from "./types.ts";

export type PlaybackStatus = "idle" | "playing" | "paused" | "finished";

export interface ShotStats {
  carry: number; // 첫 착지까지 수평 거리 (m)
  total: number; // 최종 정지까지 수평 거리 (m)
  apex: number; // 최고 높이 (m)
  ballSpeedKmh: number; // 발사 직후 볼 스피드 (km/h)
  durationMs: number;
}

const GROUND_EPS = RANGE_BALL_RADIUS + 0.05;

// 균일 Catmull-Rom 스플라인 (구간 [p1, p2], 파라미터 f∈[0,1]).
function catmullRom(p0: number, p1: number, p2: number, p3: number, f: number): number {
  const f2 = f * f;
  const f3 = f2 * f;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * f +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * f3)
  );
}

// 렌더러와 useFrame에 독립적인 시간 기반 궤적 재생기.
// 외부에서 update(deltaMs)로 시계를 진행시키고 position()으로 보간된 좌표를 읽는다.
// 원본 센서 좌표는 보관하지 않고, 생성 시 월드 좌표로 한 번 변환해 둔다.
export class TrajectoryPlayer {
  readonly shotId: string;
  readonly durationMs: number;
  readonly stats: ShotStats;
  readonly landing: Vec3;

  private readonly times: number[]; // 0부터 시작하도록 정규화된 ms
  private readonly pts: Vec3[]; // 월드 좌표
  private elapsedMs = 0;
  private _status: PlaybackStatus = "idle";

  speed = 1;
  // 공 렌더링을 부드럽게 하기 위한 시각 보간. 끄면 순수 선형 보간을 쓴다.
  // 원본 센서 좌표(this.pts)는 그대로 두고 렌더링 좌표만 매끄럽게 만든다.
  smoothing = true;

  constructor(traj: ShotTrajectory) {
    if (!traj.points.length) throw new Error("TrajectoryPlayer: empty trajectory");

    const t0 = traj.points[0].timestampMs;
    this.shotId = traj.shotId;
    this.times = traj.points.map((p) => p.timestampMs - t0);
    this.pts = traj.points.map(sensorToWorld);
    this.durationMs = this.times[this.times.length - 1];

    const horiz = (p: Vec3) => Math.hypot(p.x, p.z);

    let apex = 0;
    for (const p of this.pts) if (p.y > apex) apex = p.y;

    // 발사 직후 볼 스피드: 처음 두 점 사이의 속도.
    const a = this.pts[0];
    const b = this.pts[1] ?? this.pts[0];
    const dtSec = ((this.times[1] ?? 1000) - this.times[0]) / 1000 || 1;
    const speedMs = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / dtSec;

    // 착지: 발사 후 공이 처음으로 지면 근처로 내려오는 지점.
    let landingIdx = this.pts.length - 1;
    for (let i = 1; i < this.pts.length; i++) {
      if (this.pts[i].y <= GROUND_EPS && this.pts[i - 1].y > GROUND_EPS) {
        landingIdx = i;
        break;
      }
    }
    this.landing = this.pts[landingIdx];

    this.stats = {
      carry: horiz(this.landing),
      total: horiz(this.pts[this.pts.length - 1]),
      apex,
      ballSpeedKmh: speedMs * 3.6,
      durationMs: this.durationMs,
    };
  }

  get status(): PlaybackStatus {
    return this._status;
  }

  get elapsed(): number {
    return this.elapsedMs;
  }

  get progress(): number {
    return this.durationMs > 0 ? this.elapsedMs / this.durationMs : 1;
  }

  play(): void {
    if (this._status === "finished") this.elapsedMs = 0;
    this._status = "playing";
  }

  pause(): void {
    if (this._status === "playing") this._status = "paused";
  }

  restart(): void {
    this.elapsedMs = 0;
    this._status = "playing";
  }

  seek(ms: number): void {
    this.elapsedMs = Math.max(0, Math.min(this.durationMs, ms));
    if (this.elapsedMs >= this.durationMs) this._status = "finished";
  }

  // 시간 기반 진행. deltaMs는 실제 경과 시간(프레임 간격)이며 speed가 곱해진다.
  update(deltaMs: number): void {
    if (this._status !== "playing") return;
    this.elapsedMs += deltaMs * this.speed;
    if (this.elapsedMs >= this.durationMs) {
      this.elapsedMs = this.durationMs;
      this._status = "finished";
    }
  }

  // 현재 경과 시간의 보간된 월드 좌표.
  // 기본은 Catmull-Rom 시각 보간이고, smoothing=false면 선형 보간이다.
  position(): Vec3 {
    const t = this.elapsedMs;
    const times = this.times;
    if (t <= 0) return { ...this.pts[0] };
    if (t >= this.durationMs) return { ...this.pts[this.pts.length - 1] };

    let i = 1;
    while (i < times.length && times[i] < t) i++;
    const tA = times[i - 1];
    const tB = times[i];
    const f = tB > tA ? (t - tA) / (tB - tA) : 0;

    const pts = this.pts;
    const p1 = pts[i - 1];
    const p2 = pts[i];

    if (!this.smoothing) {
      return {
        x: p1.x + (p2.x - p1.x) * f,
        y: p1.y + (p2.y - p1.y) * f,
        z: p1.z + (p2.z - p1.z) * f,
      };
    }

    // 끝점은 이웃을 복제해 경계를 안정시킨다.
    const p0 = pts[i - 2] ?? p1;
    const p3 = pts[i + 1] ?? p2;
    return {
      x: catmullRom(p0.x, p1.x, p2.x, p3.x, f),
      y: catmullRom(p0.y, p1.y, p2.y, p3.y, f),
      z: catmullRom(p0.z, p1.z, p2.z, p3.z, f),
    };
  }

  // 궤적 라인 렌더링용 전체 월드 좌표 배열(읽기 전용 참조).
  worldPoints(): readonly Vec3[] {
    return this.pts;
  }
}
