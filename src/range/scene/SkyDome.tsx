import { useRef } from "react";
import { useFrame } from "@react-three/fiber/native";
import { BackSide, Color, Group, NoColorSpace, ShaderMaterial, SphereGeometry } from "three";

// 웹 버전 RangeSky 포팅: 천정→지평선 그라데이션 + 적운 스타일 구름 돔.
// 카메라를 따라다니므로 어느 위치에서도 하늘이 같은 거리로 보인다.
const SKY_RADIUS = 1800;

// three r152+는 Color hex를 sRGB→linear로 변환해 uniform에 담는데, 이 셰이더는
// gl_FragColor를 변환 없이 그대로 출력하므로 화면에 어둡고 채도 높은 색이 찍힌다.
// 변환을 우회해 hex 값이 그대로 화면에 나오게 한다 (웹 구버전 three와 동일한 결과).
const rawColor = (hex: number) => new Color().setHex(hex, NoColorSpace);

const skyMaterial = new ShaderMaterial({
  uniforms: {
    uZenith: { value: rawColor(0x3aa8ff) },
    uHorizon: { value: rawColor(0xdcf2ff) },
    uCloud: { value: rawColor(0xffffff) },
    uExponent: { value: 0.55 },
  },
  vertexShader: /* glsl */ `
    varying vec3 vDir;

    void main() {
      // 돔 그룹이 카메라 x/z를 따라다니므로 월드 좌표를 normalize하면
      // 카메라가 원점에서 멀어질수록 방향이 왜곡된다. 오브젝트 공간 방향을 쓴다.
      vDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uZenith;
    uniform vec3 uHorizon;
    uniform vec3 uCloud;
    uniform float uExponent;
    varying vec3 vDir;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float valueNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 5; i++) {
        v += valueNoise(p) * amp;
        p *= 2.1;
        amp *= 0.5;
      }
      return v;
    }

    // 적운 스타일 구름 실루엣: 저주파 베이스 + 고주파 범프를 합쳐
    // 하드 threshold로 잘라 둥근 외곽선을 만든다.
    float cloudBlob(vec2 p) {
      float base = fbm(p * 0.55);
      float bumps = fbm(p * 1.7 + vec2(19.1, 7.3));
      float combined = base * 0.7 + bumps * 0.3;
      // 컷 구간이 좁을수록 외곽선이 또렷해진다 (넓으면 안개처럼 번짐).
      return smoothstep(0.505, 0.545, combined);
    }

    void main() {
      float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
      float t = pow(h, uExponent);
      vec3 sky = mix(uHorizon, uZenith, t);

      float y = vDir.y;
      // 넓고 부드러운 구름 밴드 — 천정 쪽은 잘라내 깔끔하게 유지.
      float cloudBand = smoothstep(0.04, 0.12, y) * (1.0 - smoothstep(0.50, 0.80, y));

      // 방향각 기준 샘플링: 구름이 하늘 둘레를 일관되게 감싼다.
      vec2 sampleUV = vec2(atan(vDir.z, vDir.x), vDir.y) * vec2(1.8, 4.2);

      // 두 레이어: 전경 큰 덩어리 + 배경 작은 덩어리.
      float layer1 = cloudBlob(sampleUV);
      float layer2 = cloudBlob(sampleUV * 1.4 + vec2(31.7, 5.2)) * 0.8;
      float cloudShape = clamp(layer1 + layer2, 0.0, 1.0);

      // 밑면 셰이딩: 구름 아래쪽이 살짝 어두워 입체감이 생긴다.
      float undersideMask = 1.0 - smoothstep(0.06, 0.30, y);
      vec3 cloudColor = mix(uCloud, uCloud * 0.78, undersideMask * 0.55);

      float cloudAlpha = cloudShape * cloudBand;
      vec3 col = mix(sky, cloudColor, cloudAlpha);

      // 8비트 버퍼에서 완만한 그라데이션에 생기는 밴딩(줄무늬)을 디더로 깬다.
      col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
  side: BackSide,
  depthWrite: false,
  depthTest: false,
});

const skyGeometry = new SphereGeometry(SKY_RADIUS, 48, 20);

export function SkyDome() {
  const groupRef = useRef<Group>(null);

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.position.set(camera.position.x, 0, camera.position.z);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={skyGeometry} material={skyMaterial} renderOrder={-20} frustumCulled={false} />
    </group>
  );
}
