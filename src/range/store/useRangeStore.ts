import { create } from "zustand";
import { TEE } from "../rangeConfig.ts";
import {
  TrajectoryPlayer,
  type PlaybackStatus,
  type ShotStats,
} from "../trajectory/TrajectoryPlayer.ts";
import type { ShotTrajectory, Vec3 } from "../trajectory/types.ts";
import sampleTrajectory from "../trajectory/sampleTrajectory.json";

// 드라이빙레인지는 센서 궤적을 재생하는 뷰어다 (mini-game-test docs/RANGE.md).
// 탄도 계산은 하지 않는다. 재생 시계와 보간은 TrajectoryPlayer가 소유하고,
// 이 store는 재생 상태와 프레임별 공 좌표를 컴포넌트(카메라/트레일/HUD)에 노출한다.
export type RangeState = {
  player: TrajectoryPlayer | null;
  status: PlaybackStatus;
  speed: number;
  progress: number;
  stats: ShotStats | null;
  landing: Vec3 | null;

  // 현재 프레임의 공 월드 좌표.
  bx: number;
  by: number;
  bz: number;

  loadTrajectory: (traj: ShotTrajectory) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  restart: () => void;
  setSpeed: (speed: number) => void;
  // RangeBall의 useFrame에서 매 프레임 호출해 재생을 진행한다.
  tick: (deltaMs: number) => void;
};

export const useRangeStore = create<RangeState>((set, get) => ({
  player: null,
  status: "idle",
  speed: 1,
  progress: 0,
  stats: null,
  landing: null,

  bx: TEE.x,
  by: TEE.y,
  bz: TEE.z,

  loadTrajectory(traj) {
    const player = new TrajectoryPlayer(traj);
    player.speed = get().speed;
    const p = player.position();
    set({
      player,
      status: "idle",
      progress: 0,
      stats: player.stats,
      landing: player.landing,
      bx: p.x,
      by: p.y,
      bz: p.z,
    });
  },

  play() {
    const { player } = get();
    if (!player) return;
    player.play();
    set({ status: player.status });
  },

  pause() {
    const { player } = get();
    if (!player) return;
    player.pause();
    set({ status: player.status });
  },

  toggle() {
    const { player, status } = get();
    if (!player) return;
    if (status === "playing") player.pause();
    else player.play();
    set({ status: player.status });
  },

  restart() {
    const { player } = get();
    if (!player) return;
    player.restart();
    const p = player.position();
    set({ status: player.status, progress: 0, bx: p.x, by: p.y, bz: p.z });
  },

  setSpeed(speed) {
    const { player } = get();
    if (player) player.speed = speed;
    set({ speed });
  },

  tick(deltaMs) {
    const { player } = get();
    if (!player || player.status !== "playing") return;
    player.update(deltaMs);
    const p = player.position();
    set({ bx: p.x, by: p.y, bz: p.z, progress: player.progress, status: player.status });
  },
}));

// 초기에는 샘플 JSON 궤적을 로드한다. 추후 WebSocket / Native Event 입력으로 교체한다.
useRangeStore.getState().loadTrajectory(sampleTrajectory as ShotTrajectory);
