import { useEffect, useMemo, useState } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
  type WebGLProgramParametersWithUniforms,
} from "three";
import {
  FAIRWAY_HALF,
  FIELD_CENTER_Z,
  FIELD_END,
  FIELD_LENGTH,
  FIELD_WIDTH,
  rangeTerrainY,
} from "./rangeTerrain.ts";
import { loadAssetTexture } from "./assetTexture.ts";

// 웹 원본(mini-game-test components/range/field/RangeGround.tsx)의 모바일 포팅.
// 동일한 룩 공식을 따른다:
// - 필드 전체 TURF_BASE 단일 톤, 러프는 어두운 모잉 줄의 연장(별도 색 없음)
// - CC0 턴 텍스처(3m 타일)를 안티타일링 + 매크로(23m) 블렌딩으로 얹음
// - 세로 모잉 스트라이프: 18m 폭 x 밴드, 줄은 다운레인지(z)로 길게
// - z 방향 잔디 fiber 결 (근거리, 나이퀴스트 가드)
// - 법선 전부 +Y 고정(computeVertexNormals 안 함) — 사면 명암 제거, 굴곡은 실루엣만
// 모바일 단순화: rough/AO 맵과 그림자는 생략(라이트 구성이 단순해 영향 작음).
// 필드 머티리얼은 웹과 같은 Standard(GGX) — Lambert로 줄였더니 스페큘러 반응이
// 사라져 잔디 거칠기가 죽었다(매트한 페인트 룩). roughness 0.92의 낮고 넓은
// 시트 + 디테일 노멀 요철이 "잎이 빛을 흩는" 거칢을 만든다. apron만 Lambert 유지.
// 거칠기 보강(모바일 전용): ×23 노멀 탭 green 채널로 러프니스를 0.78~0.98 진동시켜
// 잎 단위 스페큘러 글린트를 만들고, fine 탭 휘도 캐비티로 간접광만 깎아(pseudo-AO)
// 앰비언트 과다가 씻어낸 잎 겹침 깊이감을 되살린다 — 둘 다 근거리 페이드.
// 미드밴드 모틀링(모바일 전용): 샷 추적 카메라가 보는 100~600m 대역은 fine이 밉으로
// 평탄해져 질감 공백("맨들맨들")이 생긴다 — 9m/13m 월드 타일 휘도 변주로 메운다.
// macro도 휘도 전용으로 바꿔 진폭 상향(색조 고정이라 연두 얼룩은 계속 차단).
// 선명도(모바일 전용): 알베도 탭 LOD 바이어스 -0.6(밉 한 층 지연) + fine 탭 대비
// 샤픈 ×1.3 — 저대비 원본 텍스처의 그레인을 또렷하게. 노멀 탭은 바이어스 제외.

const TURF_BASE = new Color("#538140");
const OUTER_TONE = new Color("#456e34");
const SCRUB_LOW = new Color("#3f6530");
const SCRUB_HIGH = new Color("#3a5c2c");

const TURF_TILE_M = 3.0;
const STRIPE_WIDTH = 18;

const _near = new Color();
const _far = new Color();

// 웹 patchNoise — 지평선 스크럽 띠 색 변주용.
function patchNoise(x: number, z: number): number {
  const n =
    Math.sin(x * 0.013 + 0.7) * 0.5 +
    Math.sin(z * 0.011 - 0.3) * 0.35 +
    Math.sin((x * 0.7 + z) * 0.006 + 1.4) * 0.3 +
    Math.sin((x - z * 0.6) * 0.03) * 0.18 +
    Math.sin(x * 0.083 + z * 0.041 + 0.9) * 0.2 +
    Math.sin((z - x * 0.4) * 0.057 - 1.1) * 0.14;
  return Math.max(-1, Math.min(1, n));
}

// 웹 RangeGround 프래그먼트 포팅 — Lambert의 map_fragment를 통째로 교체한다.
// (웹의 uniform 튜닝 값들은 확정 상수라 리터럴로 인라인)
function injectTurfShader(shader: WebGLProgramParametersWithUniforms) {
  shader.vertexShader = shader.vertexShader.replace(
    "void main() {",
    /* glsl */ `
      varying vec3 vRangeWorldPos;
      void main() {
        vRangeWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    `
  );

  shader.fragmentShader = shader.fragmentShader
    .replace(
      "void main() {",
      /* glsl */ `
        varying vec3 vRangeWorldPos;
        void main() {
      `
    )
    .replace(
      "#include <map_fragment>",
      /* glsl */ `
        #ifdef USE_MAP
          // 타일 반복 제거: 같은 텍스처를 회전·오프셋 UV로 한 번 더 떠 저주파 마스크로 섞는다.
          float vmask = sin(vRangeWorldPos.x * 0.013 + 0.7) * 0.5 + sin(vRangeWorldPos.z * 0.011 - 0.3) * 0.5;
          vmask = clamp(vmask * 0.5 + 0.5, 0.0, 1.0);
          vec2 uvRot = vec2(vMapUv.y, -vMapUv.x) * 1.37 + vec2(0.31, 0.57);
          // 알베도 탭들에 음수 LOD 바이어스(-0.6) — 밉 단계를 한 층 늦춰 중거리까지
          // 디테일을 또렷하게 유지한다. 노멀/매크로 탭은 제외(스페큘러 끓음·지평선
          // 알리아싱 위험). 카메라 이동 시 반짝임이 보이면 -0.4로 완화.
          vec3 turfFine = mix(texture2D( map, vMapUv, -0.6 ).rgb, texture2D( map, uvRot, -0.6 ).rgb, vmask * 0.5);
          vec3 turfMacro = texture2D( map, vMapUv * 0.13 ).rgb;
          // 원거리는 fine(밉으로 뭉개짐) 대신 macro(23m, 밉 안정)가 주도.
          float horizonBlend = smoothstep(700.0, 1650.0, vRangeWorldPos.z);
          // 알베도 평균 휘도(~0.69) 정규화(×1.45) — 정점색과의 이중 곱셈 어두워짐 방지.
          vec3 turfFineN = turfFine * 1.45;
          // 대비 샤픈(blade 탭과 같은 기법) — 평균 ~1.0 기준으로 잎 단위 명암 증폭.
          // 원본 텍스처가 저대비라 그레인이 약했던 것을 보상. 밉으로 평탄해진 원거리는
          // 값이 이미 ~1.0이라 자동으로 효과가 사라진다(거리 페이드 불필요).
          turfFineN = (turfFineN - 1.0) * 1.3 + 1.0;
          // 매크로는 휘도 전용 변주 — 색조가 고정이라 진폭을 올려도(0.45→0.62)
          // 연두 얼룩 패치가 원천 차단된다.
          float rngMacroLum = dot(turfMacro, vec3(0.299, 0.587, 0.114)) * 1.45;
          vec3 turfMacroN = vec3(mix(0.9, rngMacroLum, 0.62));
          // 근거리는 매크로 비중을 낮춰(0.4→0.3) 저주파 얼룩 대신 잔디결이 주도.
          vec3 turf = mix(turfFineN, turfMacroN, mix(0.3, 0.85, horizonBlend));

          // 미드밴드 모틀링: 핵심 플레이 거리(100~600m)에서 fine(3m)은 밉으로
          // 평탄해지고 macro(23m)는 진폭이 눌려 질감 공백이 생긴다(샷 추적 카메라가
          // "맨들맨들"해 보이는 원인). 9m/13m 월드 타일 두 탭을 vmask로 안티타일링해
          // 휘도만 변주(색 얼룩 없음)로 메운다.
          float rngDistXZ = distance(vRangeWorldPos.xz, cameraPosition.xz);
          vec3 rngMidA = texture2D( map, vRangeWorldPos.xz / 9.0, -0.6 ).rgb;
          vec3 rngMidB = texture2D( map, vec2(vRangeWorldPos.z, -vRangeWorldPos.x) / 13.0 + vec2(0.37, 0.11), -0.6 ).rgb;
          float rngMidLum = dot(mix(rngMidA, rngMidB, vmask), vec3(0.299, 0.587, 0.114)) * 1.45;
          float rngMidBand = smoothstep(50.0, 150.0, rngDistXZ) * (1.0 - smoothstep(600.0, 1300.0, rngDistXZ));
          turf *= 1.0 + (rngMidLum - 1.0) * 0.7 * rngMidBand;

          // 근거리 블레이드(잎) 디테일: 같은 텍스처를 0.75m 월드 스케일로 한 번 더 떠
          // 잎 단위 그레인을 얹는다. 웹은 노멀맵 디테일이 이 역할을 했지만 모바일은
          // 노멀맵이 없어 알베도 탭으로 대체. (모바일 전용 보강)
          float bladeFade = 1.0 - smoothstep(60.0, 240.0, rngDistXZ);
          if (bladeFade > 0.001) {
            vec3 blade = texture2D( map, vRangeWorldPos.xz / 0.75, -0.6 ).rgb * 1.45;
            // 대비 sharpen — 정규화 평균(~1.0) 기준으로 잎 단위 명암을 또렷하게.
            blade = (blade - 1.0) * 1.35 + 1.0;
            turf = mix(turf, blade, bladeFade * 0.45);
          }

          // 디테일 강도 0.56→0.66 — 노멀/러프맵 부재를 알베도 대비로 보상.
          vec3 detail = clamp(mix(vec3(1.0), turf, 0.66 * (1.0 - horizonBlend * 0.25)), 0.0, 1.12);
          diffuseColor.rgb *= detail * 0.9;
          // 정점색 존 블렌딩과 같은 폭(±8~+40m)의 페어웨이 마스크.
          float fairMask = 1.0 - smoothstep(${(FAIRWAY_HALF - 8).toFixed(1)}, ${(FAIRWAY_HALF + 40).toFixed(1)}, abs(vRangeWorldPos.x));

          // 짧게 깎인 잔디 섬유 결 — world z 방향의 얇은 streak, 근거리 전용.
          float fiberA = sin(vRangeWorldPos.z * 21.0 + sin(vRangeWorldPos.x * 0.85) * 1.4);
          float fiberB = sin(vRangeWorldPos.z * 43.0 + vRangeWorldPos.x * 0.48 + sin(vRangeWorldPos.z * 0.19));
          float fiber = fiberA * 0.68 + fiberB * 0.32;
          float fiberLine = smoothstep(0.18, 0.96, abs(fiber));
          float fiberSign = fiber < 0.0 ? -1.0 : 1.0;
          float fiberFade = 1.0 - smoothstep(80.0, 380.0, rngDistXZ);
          // 나이퀴스트 가드: sin 패턴은 밉이 없어 픽셀 풋프린트가 주기에 접근하면 끓는다.
          float fiberPx = fwidth(vRangeWorldPos.z) * 43.0;
          float fiberAA = 1.0 - smoothstep(1.2, 2.4, fiberPx);
          fiberFade *= fiberAA;
          fiberFade *= 1.0 - horizonBlend;
          // 웹(0.075)보다 강한 0.13 — 노멀맵 부재로 약해진 결 표현을 보상.
          diffuseColor.rgb *= 1.0 + fiberLine * fiberSign * 0.13 * fairMask * fiberFade;
          diffuseColor.rgb *= 1.0 - fiberLine * 0.025 * fairMask * fiberFade;

          // 세로 모잉 스트라이프: 다운레인지(z)로 뻗는 줄이 x축으로 명/암 교차.
          // 뷰 무관 base(0.14)가 주역, 뷰 의존 sheen(0.05)은 양념 — 웹 확정 구성.
          float swX = sin(vRangeWorldPos.x * (3.14159265 / ${STRIPE_WIDTH.toFixed(1)}));
          float band = smoothstep(-0.22, 0.22, swX) * 2.0 - 1.0;
          vec3 V = normalize(cameraPosition - vRangeWorldPos);
          float sheen = band * (V.z * 0.05 + 0.14);
          float distFade = 1.0 - smoothstep(250.0, 900.0, rngDistXZ);
          float stripePx = fwidth(vRangeWorldPos.x) * (3.14159265 / ${STRIPE_WIDTH.toFixed(1)});
          distFade *= 1.0 - smoothstep(1.6, 2.8, stripePx);
          float fixedCut = band * 0.06;
          diffuseColor.rgb *= (1.0 + (fixedCut + sheen) * fairMask * distFade);
          // 밴드별 고정 색 틴트: 어두운 줄은 차갑게, 밝은 줄은 따뜻하게.
          vec3 stripeTint = mix(vec3(0.975, 1.0, 0.96), vec3(1.025, 1.015, 0.995), band * 0.5 + 0.5);
          diffuseColor.rgb *= mix(vec3(1.0), stripeTint, fairMask * distFade);

          // 잎 사이 틈 캐비티: fine 탭 휘도(평균 ~1.0)에서 어두운 곳을 골라
          // 간접광 전용 AO로 쓴다 (aomap_fragment 위치에서 적용). 앰비언트가
          // 씻어낸 잎 겹침 깊이감을 되살리되 키 라이트 명암은 보존한다.
          float rngCavLum = dot(turfFineN, vec3(0.299, 0.587, 0.114));
          float rngCavFade = 1.0 - smoothstep(80.0, 320.0, rngDistXZ);
          float rngCavity = mix(1.0, clamp(1.0 - (1.0 - min(rngCavLum, 1.0)) * 1.5, 0.55, 1.0), rngCavFade);

          // 웹 PostFX HueSaturation(+0.30) 대응 — 모바일은 포스트 체인이 없어
          // 알베도 단계에서 채도를 보강한다(휘도 보존). 웹의 "쨍한 초록"의 절반은
          // 이 포스트 채도였음.
          float rngSatLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          diffuseColor.rgb = clamp(mix(vec3(rngSatLum), diffuseColor.rgb, 1.3), 0.0, 1.0);
        #endif
      `
    )
    .replace(
      "#include <roughnessmap_fragment>",
      /* glsl */ `
        #include <roughnessmap_fragment>
        #if defined( USE_NORMALMAP_TANGENTSPACE ) && defined( USE_MAP )
          // 잎 단위 러프니스 변주: 마이크로 노멀 탭(×23)과 같은 좌표의 green 채널로
          // 0.78~0.98 진동 — GGX 글린트가 잎 요철과 같은 자리에서 반짝인다.
          // 원거리는 밉 평균이 러프니스를 일괄 ~0.88로 끌어내리므로 페이드로
          // 상수 0.92에 복귀시킨다.
          float rngGlintTex = texture2D( normalMap, vNormalMapUv * 23.0 ).g;
          float rngGlintFade = 1.0 - smoothstep(60.0, 260.0, rngDistXZ);
          roughnessFactor = mix( roughnessFactor, mix(0.78, 0.98, rngGlintTex), rngGlintFade );
        #endif
      `
    )
    .replace(
      "#include <aomap_fragment>",
      /* glsl */ `
        #include <aomap_fragment>
        #ifdef USE_MAP
          // map_fragment에서 계산한 캐비티 — 간접광(ambient/hemisphere)만 깎는다.
          reflectedLight.indirectDiffuse *= rngCavity;
        #endif
      `
    )
    .replace(
      "#include <normal_fragment_maps>",
      /* glsl */ `
        #include <normal_fragment_maps>
        #if defined( USE_NORMALMAP_TANGENTSPACE ) && defined( USE_MAP )
          // 디테일 노멀(웹 포팅): 같은 노멀맵을 7배 작은 타일로 한 번 더 떠
          // 근거리 마이크로 요철을 더한다 — "거칠기"의 핵심.
          vec3 rngDetN = texture2D( normalMap, vNormalMapUv * 7.0 ).xyz * 2.0 - 1.0;
          float rngNFade = 1.0 - smoothstep(100.0, 450.0, rngDistXZ);
          // 고주파 마이크로 탭(×23): 잎 단위 요철. GGX 글린트의 "입자 크기"를
          // 만든다 — 텍스처 탭이라 밉이 알리아싱을 막아주므로 거리 페이드만 건다.
          vec3 rngMicroN = texture2D( normalMap, vNormalMapUv * 23.0 ).xyz * 2.0 - 1.0;
          float rngMicroFade = 1.0 - smoothstep(40.0, 120.0, rngDistXZ);
          normal = normalize( normal + tbn * vec3( rngDetN.xy * 0.9 * rngNFade + rngMicroN.xy * 0.65 * rngMicroFade, 0.0 ) );
        #endif
      `
    );
}

// apron — 웹과 동일하게 필드 턴 컬러맵을 world XZ(23m 스케일)로 떠 알베도
// 그레인만 얹는다 ("페인트칠한 바닥" 방지). 색은 OUTER_TONE 단일 톤.
function makeApronShaderInjector(turf: Texture) {
  return (shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.uApronTurf = { value: turf };
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      /* glsl */ `
        varying vec3 vApronWorldPos;
        void main() {
          vApronWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      `
    );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "void main() {",
        /* glsl */ `
          uniform sampler2D uApronTurf;
          varying vec3 vApronWorldPos;
          void main() {
        `
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `
          #include <color_fragment>
          vec3 apronTurf = mix(vec3(0.9), texture2D(uApronTurf, vApronWorldPos.xz / 23.0).rgb * 1.45, 0.45);
          diffuseColor.rgb *= clamp(mix(vec3(1.0), apronTurf, 0.42), 0.0, 1.1) * 0.9;
          // 필드와 동일한 채도 보강(웹 HueSaturation +0.30 대응) — 경계 단차 방지.
          float apSatLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          diffuseColor.rgb = clamp(mix(vec3(apSatLum), diffuseColor.rgb, 1.3), 0.0, 1.0);
        `
      );
  };
}

function buildFieldGeometry() {
  const geo = new PlaneGeometry(FIELD_WIDTH, FIELD_LENGTH, 220, 192);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, FIELD_CENTER_Z);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, rangeTerrainY(pos.getX(i), pos.getZ(i)));
  }
  pos.needsUpdate = true;
  // computeVertexNormals를 부르지 않는다 — rotateX 후 법선은 전부 +Y이고, 이를
  // 유지해야 사면 명암이 0이 된다(웹 확정: 둔덕 사면이 연한 띠로 분리되는 것 제거).
  return geo;
}

// 지평선 스크럽 띠 — 필드 끝의 직선 경계를 낮은 실루엣 웨이브로 깬다 (웹 포팅).
function buildHorizonScrubGeometry(): BufferGeometry {
  const width = FIELD_WIDTH * 1.18;
  const z = FIELD_END - 18;
  const segments = 96;
  const positions = new Float32Array((segments + 1) * 2 * 3);
  const colors = new Float32Array((segments + 1) * 2 * 3);
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = -width / 2 + width * t;
    const wave =
      Math.sin(x * 0.018 + 0.8) * 2.2 +
      Math.sin(x * 0.043 - 1.2) * 1.3 +
      Math.sin(x * 0.091 + 2.7) * 0.65;
    const terrain = rangeTerrainY(x, z);
    const bottomY = terrain - 0.25;
    const topY = terrain + 6.0 + wave;
    const base = i * 6;

    positions[base] = x;
    positions[base + 1] = bottomY;
    positions[base + 2] = z;
    positions[base + 3] = x;
    positions[base + 4] = topY;
    positions[base + 5] = z + Math.sin(x * 0.028) * 5;

    _near.copy(SCRUB_LOW).lerp(OUTER_TONE, Math.max(0, patchNoise(x, z)) * 0.18);
    _far.copy(SCRUB_HIGH).lerp(SCRUB_LOW, 0.22 + Math.max(0, patchNoise(x * 1.7, z)) * 0.16);

    colors[base] = _near.r;
    colors[base + 1] = _near.g;
    colors[base + 2] = _near.b;
    colors[base + 3] = _far.r;
    colors[base + 4] = _far.g;
    colors[base + 5] = _far.b;

    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(positions, 3));
  geo.setAttribute("color", new BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// 필드 바깥 ~ 산 발치를 덮는 디스크. OUTER_TONE 단일 톤 (웹 확정: 바깥 잔디와
// 산 사이 색 완전 통일). 웹의 둑/둔덕 실루엣(apronShape)은 모바일 미포팅.
function buildApronGeometry() {
  const disc = new CircleGeometry(2580, 96);
  disc.rotateX(-Math.PI / 2);
  return disc;
}

function configureTurfTexture(tex: Texture, srgb: boolean) {
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(FIELD_WIDTH / TURF_TILE_M, FIELD_LENGTH / TURF_TILE_M);
  // 그레이징 각(idle 카메라가 지면을 거의 수평으로 봄)에서 텍스처 뭉개짐 감소.
  tex.anisotropy = 16;
  if (srgb) tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
}

export function TerrainGround() {
  const [turf, setTurf] = useState<Texture | null>(null);
  const [turfNormal, setTurfNormal] = useState<Texture | null>(null);

  const fieldGeometry = useMemo(() => buildFieldGeometry(), []);
  const apronGeometry = useMemo(() => buildApronGeometry(), []);
  const horizonScrubGeometry = useMemo(() => buildHorizonScrubGeometry(), []);

  useEffect(() => {
    let disposed = false;
    Promise.all([
      loadAssetTexture(require("../assets/turf_color.jpg")),
      loadAssetTexture(require("../assets/turf_normal.jpg")),
    ])
      .then(([color, normal]) => {
        if (disposed) {
          color.dispose();
          normal.dispose();
          return;
        }
        configureTurfTexture(color, true);
        configureTurfTexture(normal, false); // 노멀맵은 linear 공간
        setTurf(color);
        setTurfNormal(normal);
      })
      .catch((err) => console.warn("TerrainGround turf load failed:", err));
    return () => {
      disposed = true;
    };
  }, []);

  const apronInjector = useMemo(() => (turf ? makeApronShaderInjector(turf) : undefined), [turf]);

  return (
    <group>
      {/* apron — 필드와 겹치는 곳에선 필드가 이기도록 polygonOffset으로 뒤로 민다. */}
      <mesh geometry={apronGeometry} position={[0, -0.2, 0]}>
        <meshLambertMaterial
          key={turf ? "apron-turf" : "apron-plain"}
          color={OUTER_TONE}
          fog={false}
          polygonOffset
          polygonOffsetFactor={2}
          polygonOffsetUnits={3}
          onBeforeCompile={apronInjector}
        />
      </mesh>

      <mesh geometry={horizonScrubGeometry} renderOrder={3} frustumCulled={false}>
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.6}
          depthWrite={false}
          side={DoubleSide}
          fog={false}
        />
      </mesh>

      <mesh geometry={fieldGeometry}>
        <meshStandardMaterial
          key={turf && turfNormal ? "field-turf" : "field-plain"}
          color={TURF_BASE}
          map={turf ?? undefined}
          normalMap={turfNormal ?? undefined}
          normalScale={[0.9, 0.9]}
          roughness={0.92}
          metalness={0}
          side={DoubleSide}
          fog={false}
          onBeforeCompile={turf ? injectTurfShader : undefined}
        />
      </mesh>

      {/* 티 매트: 살짝 도드라진 짧은 잔디 매트 + 타깃 링 (웹 포팅). */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.6, 5.2]} />
        <meshLambertMaterial color="#2f7a3c" />
      </mesh>
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.9, 2.1, 48]} />
        <meshBasicMaterial color="#eafff0" side={DoubleSide} />
      </mesh>
    </group>
  );
}
