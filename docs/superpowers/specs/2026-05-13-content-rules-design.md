# 콘텐츠 규칙 설계

## 배경
v1은 정보보안기사 실기 단답형 전용 앱이다. 기출 원문과 원문 해설은 권리 확보 전까지 앱에 포함하지 않고, 내부 학습 노트를 바탕으로 재구성한 단답형 문항만 출시 콘텐츠로 사용한다.

## 결정
내부 원천 자료와 앱 문항 데이터를 분리한다. 원천 자료는 `docs/content-sources/` 아래에 저장하고, 앱에는 `sourceType: "rewritten"`인 `ShortQuestion`만 포함한다.

## 콘텐츠 구조
- 내부 원천 자료: 문제 제작자가 참고하는 노트이며 앱에 포함하지 않는다.
- 개념 단위: 단답형과 향후 서술형을 연결할 안정적인 학습 단위다.
- v1 단답형 문항: 하나의 개념과 하나의 대표 정답을 묻는다.
- v2 서술형 문항: 별도 타입으로 추가하되 v1 단답형과 같은 `conceptId`를 공유한다.

## 구현 전제
`ShortQuestion`은 `conceptId`, `examPart`, `sourceNoteRefs`를 포함한다. v1 출시 검증은 이 메타데이터가 없는 문항을 실패시켜 향후 서술형 확장과 원천 자료 추적이 끊기지 않게 한다.

## 검증 기준
- v1 출시 검증은 `sourceType: "rewritten"`만 허용한다.
- 모든 정답 후보는 `caseSensitive`를 명시한다.
- 앱 문항의 지문과 해설은 내부 원천 자료의 직접 복사가 아니어야 한다.
- 복수 정답 전체를 요구하는 문항은 v1에서 피한다.

## 산출물
- `docs/CONTENT_RULES.md`: 콘텐츠 제작과 문제 생성 규칙
- `docs/content-sources/security-general/information-protection-overview.md`: 정보보안일반 내부 원천 자료
