# 콘텐츠 제작 및 문제 생성 규칙

## 목적
이 문서는 정보보안기사 실기 단답 트레이너의 문제 제작 기준을 정의한다. v1 앱에는 재구성된 단답형 문항만 포함하고, 내부 학습 노트와 기출 기반 분석 자료는 앱 번들에 직접 포함하지 않는다. 향후 서술형 확장을 위해 문제는 개념 단위와 연결될 수 있어야 한다.

## 콘텐츠 계층

### 1. 내부 원천 자료
- 위치: `docs/content-sources/<part>/<topic>.md`
- 용도: 문제 제작자가 참고하는 내부 자료
- 앱 포함 여부: 포함하지 않음
- 예: `docs/content-sources/security-general/information-protection-overview.md`

내부 원천 자료는 앱 화면, 문제 지문, 해설에 그대로 복사하지 않는다. 앱에 들어가는 문항은 반드시 짧은 문제 지문과 해설로 재작성한다.

### 2. 개념 단위
개념은 단답형과 향후 서술형이 함께 바라볼 수 있는 최소 학습 단위다. 구현 단계에서는 문항에 `conceptId`를 추가하는 방향으로 확장한다.

개념 ID 형식:

```text
<part>-<topic>-<concept>
```

예:

```text
security-general-info-protection-definition
security-general-security-classification
security-general-cia-confidentiality
security-general-cia-integrity
security-general-cia-availability
security-general-authentication-factors
security-general-accountability
security-general-non-repudiation
```

### 3. v1 단답형 문항
- 앱에는 `ShortQuestion`만 포함한다.
- `sourceType`은 v1 출시 콘텐츠 기준으로 `rewritten`만 사용한다.
- 한 문항은 하나의 개념과 하나의 대표 정답을 묻는다.
- 복수 정답 전체를 요구하는 문항은 v1에서 피한다.
- 목록 암기가 필요하면 목록 전체를 한 번에 묻지 말고 개별 문항으로 쪼갠다.

### 4. v2 서술형 문항
서술형 문항은 v1에 포함하지 않는다. 향후 추가할 경우 단답형과 별도 타입으로 관리하되 같은 `conceptId`를 공유한다.

예:

```text
conceptId: security-general-cia-confidentiality

v1 단답:
인가된 주체만 알 필요성에 따라 정보자산에 접근하도록 보장하는 정보보호 목표는?

v2 서술:
기밀성의 의미를 설명하고, 이를 보장하기 위해 사용할 수 있는 암호학적 도구를 예시와 함께 서술하시오.
```

## 단답형 생성 규칙

### 문항 지문
- 노트 원문 문장을 그대로 쓰지 않는다.
- 시험 답안을 떠올릴 수 있도록 단서가 충분해야 한다.
- 하나의 질문 안에서 두 개 이상의 정답을 요구하지 않는다.
- 모바일 화면에서 읽기 쉽도록 한 문항 지문은 가능하면 한두 문장으로 제한한다.
- "다음 설명에 해당하는 것은?" 형태는 허용하되, 설명은 앱용으로 재작성한다.

### 정답 키
- `referenceAnswer`는 대표 정답 하나를 둔다.
- `acceptableAnswers`에는 한국어, 영문, 약어, 흔한 표기 변형을 넣는다.
- 모든 정답 후보는 `caseSensitive`를 반드시 명시한다.
- 일반 보안 용어, 약어, 한글 답안은 기본적으로 `caseSensitive: false`를 사용한다.
- 명령어, 경로, 설정값, 코드, 로그 필드처럼 대소문자가 의미에 영향을 줄 수 있는 답은 `caseSensitive: true`를 검토한다.

예:

```ts
{
  value: "Confidentiality",
  caseSensitive: false,
  aliases: ["기밀성"]
}
```

### 해설
- 해설도 원천 노트 문장을 그대로 복사하지 않는다.
- 채점 직후 이해할 수 있도록 1-2문장으로 작성한다.
- 정답의 정의, 오답이 되기 쉬운 인접 개념, 암기 연결고리를 우선 설명한다.

## 정보보안일반 파트 관리 기준

`정보보안일반`은 현행 앱의 대분류 필터와 별도로 관리할 시험 파트다. 구현 전까지는 문항 ID 접두어로 파트를 표현한다.

```text
secgen-001
secgen-002
secgen-003
```

향후 타입 확장 시 다음 필드를 추가하는 방향을 우선 검토한다.

```ts
examPart: "security_general";
conceptId: "security-general-cia-confidentiality";
sourceNoteRefs: ["docs/content-sources/security-general/information-protection-overview.md"];
```

현재 `category`는 앱 필터 기준으로 유지한다. 정보보안일반 문항은 내용에 따라 기존 카테고리에 매핑한다.

- 보안 분류, CIA, 책임성: `management_security`
- 암호학적 도구, MAC, 전자서명: `cryptography`
- 접근통제 구성요소: `management_security`

## 난이도 기준

- `basic`: 용어, 정의, 1:1 대응 암기
- `intermediate`: 개념과 도구의 연결, 인접 개념 구분
- `advanced`: 상황 설명에서 개념을 판별하거나 여러 요소를 비교해야 하는 문항

## 콘텐츠 검수 체크리스트

문항을 앱 데이터에 추가하기 전에 다음을 확인한다.

- 앱에 들어가는 지문과 해설이 내부 원천 노트 문장의 직접 복사가 아닌가?
- v1 문항이 단답형 하나로 채점 가능한가?
- 정답 후보마다 `caseSensitive`가 명시되어 있는가?
- `acceptableAnswers`에 한국어, 영문, 약어 등 필요한 별칭이 들어갔는가?
- `sourceType`이 `rewritten`인가?
- 원문 계열 콘텐츠를 쓰는 경우 `licenseRef`가 있는가?
- 향후 서술형 확장을 위해 연결할 개념이 명확한가?
