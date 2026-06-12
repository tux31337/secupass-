import { useMemo, useRef } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import { Canvas } from "@react-three/fiber/native";
import { RangeScene } from "./scene/RangeScene.tsx";
import { RangeHud } from "./ui/RangeHud.tsx";
import { applyLookDelta } from "./scene/lookControl.ts";

// 드라이빙레인지 화면 루트. Canvas(expo-gl) 위에 드래그 시선용 PanResponder
// 오버레이를 깔고, 그 위에 RN HUD를 얹는다 (HUD 버튼이 터치를 먼저 가져가고,
// 빈 영역 드래그만 시선 회전으로 흘러든다).
export function RangeScreen({ onExit }: { onExit: () => void }) {
  const lastDrag = useRef({ x: 0, y: 0 });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          Math.abs(gesture.dx) + Math.abs(gesture.dy) > 4,
        onPanResponderGrant: () => {
          lastDrag.current.x = 0;
          lastDrag.current.y = 0;
        },
        onPanResponderMove: (_evt, gesture) => {
          // gestureState.dx/dy는 누적값이라 직전 값과의 차분을 시선에 적용한다.
          applyLookDelta(gesture.dx - lastDrag.current.x, gesture.dy - lastDrag.current.y);
          lastDrag.current.x = gesture.dx;
          lastDrag.current.y = gesture.dy;
        },
      }),
    [],
  );

  return (
    <View style={styles.root}>
      {/* 웹(RangeGame)은 exposure 1.08 + HDR IBL — 모바일은 IBL이 없어 노출을
          1.15로 더 올려 보상한다 (라이트 보강은 RangeScene 참고). */}
      <Canvas
        camera={{ position: [0, 2.05, -10.5], fov: 45, near: 0.5, far: 3400 }}
        gl={{ toneMappingExposure: 1.15 }}
      >
        <RangeScene />
      </Canvas>

      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />

      <RangeHud onExit={onExit} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#d9e7df",
    flex: 1,
  },
});
