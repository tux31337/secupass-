import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber/native";
import { Vector3 } from "three";
import { useRangeStore } from "../store/useRangeStore.ts";
import { lookControl } from "./lookControl.ts";

const _desired = new Vector3();
const _target = new Vector3();
const _dir = new Vector3();
const _view = new Vector3();
const _right = new Vector3();
const Y_AXIS = new Vector3(0, 1, 0);

// 웹 버전의 추적/시선 수학을 그대로 옮긴 카메라. DOM 포인터 이벤트 대신
// RangeScreen의 PanResponder가 갱신하는 lookControl(yaw/pitch)을 읽는다.
export function RangeCamera() {
  const { camera } = useThree();
  const prev = useRef(new Vector3(0, 0, 0));
  const baseTarget = useRef(new Vector3(0, 1.45, 620));

  useFrame((_, delta) => {
    const { status, bx, by, bz, landing } = useRangeStore.getState();

    if (status !== "paused") {
      const clamped = Math.min(delta, 0.05);

      if (status === "playing") {
        _dir.set(bx - prev.current.x, 0, bz - prev.current.z);
        if (_dir.lengthSq() < 1e-5) _dir.set(0, 0, 1);
        _dir.normalize();
        _desired.set(bx - _dir.x * 14, by + 8, bz - _dir.z * 14);
        _target.set(bx + _dir.x * 4, by + 0.5, bz + _dir.z * 4);
        camera.position.lerp(_desired, 1 - Math.exp(-6 * clamped));
      } else if (status === "finished" && landing) {
        _desired.set(landing.x - 18, 12, landing.z - 54);
        _target.set(bx, 1.2, bz + 36);
        camera.position.lerp(_desired, 1 - Math.exp(-3 * clamped));
      } else {
        _desired.set(0, 2.05, -10.5);
        _target.set(0, 1.45, 620);
        camera.position.lerp(_desired, 1 - Math.exp(-4 * clamped));
      }

      baseTarget.current.copy(_target);
    }

    _view.copy(baseTarget.current).sub(camera.position);
    if (_view.lengthSq() < 1e-5) _view.set(0, 0, 1);
    _view.applyAxisAngle(Y_AXIS, lookControl.yaw);
    _dir.copy(_view).normalize();
    _right.crossVectors(_dir, Y_AXIS).normalize();
    _view.applyAxisAngle(_right, lookControl.pitch);
    _target.copy(camera.position).add(_view);
    camera.lookAt(_target);

    prev.current.set(bx, by, bz);
  });

  return null;
}
