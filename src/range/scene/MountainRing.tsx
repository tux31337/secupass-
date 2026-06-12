import { useEffect, useMemo, useState } from "react";
import {
  BackSide,
  ClampToEdgeWrapping,
  CylinderGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
  type WebGLProgramParametersWithUniforms,
} from "three";
import { loadAssetTexture } from "./assetTexture.ts";
import {
  GRADE_CONTRAST,
  GRADE_DESATURATE,
  GRADE_PIVOT,
  GRADE_TINT_LINEAR,
  RING_RADIUS,
  RING_ROTATION_Y,
} from "./mountainRingConfig.ts";

// 사진 기반 산: 웹 버전 RangeMountainRing 포팅. equirect 지평선 띠(하늘은 알파로
// 키잉된 PNG)를 360° 실린더에 두른다. 모바일 GPU 텍스처 한계를 고려해 원본
// 8192×650을 4096×325로 줄여서 쓴다 (HORIZON_FRAC은 비율이라 그대로 유효).
const STRIP_W = 8192;
const STRIP_H = 650;
// 띠에서 지평선(고도각 0) 아래 비율. 이 라인이 월드 y=0에 오게 배치.
const HORIZON_FRAC = (2150 - 2048) / STRIP_H;

const RADIUS = RING_RADIUS;
// 사진 원본 화각 그대로면 1.0. 키우면 산이 더 우뚝 솟는다.
const VERTICAL_STRETCH = 1.15;
const HEIGHT = ((2 * Math.PI * RADIUS * STRIP_H) / STRIP_W) * VERTICAL_STRETCH;

// 사진 톤 그레이딩: 채도↓ + 대비 유지 + 어두운 쿨 틴트를 map_fragment 뒤에 주입.
const GRADE_GLSL = /* glsl */ `
{
  float gradeLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
  vec3 graded = mix(diffuseColor.rgb, vec3(gradeLum), float(${GRADE_DESATURATE}));
  graded = (graded - float(${GRADE_PIVOT})) * float(${GRADE_CONTRAST}) + float(${GRADE_PIVOT});
  diffuseColor.rgb = max(graded, 0.0) * vec3(${GRADE_TINT_LINEAR.join(", ")});
}
`;

function injectGrade(shader: WebGLProgramParametersWithUniforms) {
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <map_fragment>",
    `#include <map_fragment>\n${GRADE_GLSL}`
  );
}

function configure(tex: Texture) {
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping; // equirect 좌우 가장자리가 이어져 u=0/1 경계가 보이지 않는다
  tex.wrapT = ClampToEdgeWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
}

export function MountainRing() {
  const [texture, setTexture] = useState<Texture | null>(null);

  const geometry = useMemo(
    () => new CylinderGeometry(RADIUS, RADIUS, HEIGHT, 128, 1, true),
    []
  );

  // three TextureLoader는 DOM <img>를 써서 RN에서 죽는다(document 없음).
  // expo-asset → expo-gl 직업로드 경로로 비동기 로딩한다.
  useEffect(() => {
    let disposed = false;
    loadAssetTexture(require("../assets/mountain_ring.png"))
      .then((tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        configure(tex);
        setTexture(tex);
      })
      .catch((err) => console.warn("MountainRing texture load failed:", err));
    return () => {
      disposed = true;
    };
  }, []);

  if (!texture) return null;

  return (
    <mesh
      geometry={geometry}
      // 지평선 라인(띠의 HORIZON_FRAC 지점)이 월드 y=0에 오도록 올린다.
      position={[0, HEIGHT * (0.5 - HORIZON_FRAC), 0]}
      rotation={[0, RING_ROTATION_Y, 0]}
      frustumCulled={false}
    >
      <meshBasicMaterial
        map={texture}
        onBeforeCompile={injectGrade}
        alphaTest={0.5}
        side={BackSide}
        fog
        toneMapped
      />
    </mesh>
  );
}
