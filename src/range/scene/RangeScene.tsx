import { SkyDome } from "./SkyDome.tsx";
import { MountainRing } from "./MountainRing.tsx";
import { TerrainGround } from "./TerrainGround.tsx";
import { DistanceLines } from "./DistanceLines.tsx";
import { RangeBall } from "./RangeBall.tsx";
import { RangeTrail } from "./RangeTrail.tsx";
import { LandingMarker } from "./LandingMarker.tsx";
import { RangeCamera } from "./RangeCamera.tsx";

// 산 사진 링(r=2600)에 안개가 많이 끼면 배경판처럼 바래므로, 웹과 동일하게
// 시작을 산 근처(1900)까지 밀고 아주 옅게만 건다 (링 위치 fog 비율 ~16%).
const FOG_COLOR = "#ccd6db";

export function RangeScene() {
  return (
    <>
      <color attach="background" args={["#d9e7df"]} />
      <fog attach="fog" args={[FOG_COLOR, 1900, 6200]} />

      <SkyDome />
      {/* 텍스처 로딩(expo-asset) 동안은 하늘 돔만 보인다. */}
      <MountainRing />

      {/* 웹은 puresky HDR 환경맵(IBL)이 간접광을 추가 공급한다(웹 ambient/hemi는
          0.22/0.36으로 오히려 낮음). 모바일은 IBL이 없으므로 ambient/hemi를 더 올려
          대신한다 — 0.45/0.5로는 부족해 잔디가 웹보다 한 단계 어두웠음(사용자 캡처). */}
      <ambientLight intensity={0.7} color="#ffffff" />
      <hemisphereLight color="#e8f5ff" groundColor="#5a8244" intensity={0.8} />
      {/* 모바일 성능을 위해 그림자맵 없이 키 라이트만 쓴다 (공 그림자는 블롭 원판).
          강도 1.5는 웹 동일. */}
      <directionalLight position={[55, 75, 40]} intensity={1.5} color="#fff4d8" />
      <directionalLight position={[-30, 25, -20]} intensity={0.35} color="#e9fbff" />

      <TerrainGround />
      <DistanceLines />

      <RangeBall />
      <RangeTrail />
      <LandingMarker />

      <RangeCamera />
    </>
  );
}
