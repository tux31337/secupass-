import { DoubleSide, type WebGLProgramParametersWithUniforms } from "three";
import { FAIRWAY_HALF, FIELD_END } from "./rangeTerrain.ts";

// 웹 버전 DistanceMarkers에서 라인 요소만 포팅 (drei Text 야디지 숫자는 1차 제외).
const DISTANCES = [50, 100, 150, 200, 250, 300];
const MARKER_Y = 0.062;
const LINE_HALF = FAIRWAY_HALF + 40;

// 뷰 고도각(V.y) 기반 알파 페이드. 거의 수평에서 보일 때의 z-fighting성 번쩍임만 차단.
function applyGrazingFade(edge0: number, edge1: number) {
  return (shader: WebGLProgramParametersWithUniforms) => {
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      /* glsl */ `
        varying vec3 vMarkerWorldPos;
        void main() {
          vMarkerWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      `
    );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "void main() {",
        /* glsl */ `
          varying vec3 vMarkerWorldPos;
          void main() {
        `
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `
          #include <color_fragment>
          vec3 markerV = normalize(cameraPosition - vMarkerWorldPos);
          diffuseColor.a *= smoothstep(${edge0.toFixed(4)}, ${edge1.toFixed(4)}, markerV.y);
        `
      );
  };
}

const lineFade = applyGrazingFade(0.004, 0.02);
const guideFade = applyGrazingFade(0.02, 0.06);

// 트랙맨 스타일 거리 라인: 페어웨이를 가로지르는 얇은 흰 페인트 라인.
function GroundLine({ distance }: { distance: number }) {
  // 원거리는 그레이징 압축으로 선이 사라지므로 두께를 거리 비례로 보강.
  const thickness = 0.6 + distance * 0.002;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, MARKER_Y, distance]} renderOrder={4}>
      <planeGeometry args={[LINE_HALF * 2, thickness]} />
      <meshBasicMaterial
        color="#f4f9ec"
        transparent
        opacity={0.8}
        side={DoubleSide}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
        onBeforeCompile={lineFade}
      />
    </mesh>
  );
}

function CenterGuide() {
  const length = FIELD_END - 34;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, MARKER_Y + 0.004, FIELD_END / 2]}>
      <planeGeometry args={[0.7, length]} />
      <meshBasicMaterial
        color="#f8fff4"
        transparent
        opacity={0.55}
        side={DoubleSide}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-3}
        polygonOffsetUnits={-3}
        onBeforeCompile={guideFade}
      />
    </mesh>
  );
}

export function DistanceLines() {
  return (
    <group>
      <CenterGuide />
      {DISTANCES.map((distance) => (
        <GroundLine key={distance} distance={distance} />
      ))}
    </group>
  );
}
