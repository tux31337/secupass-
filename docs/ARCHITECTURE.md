# 아키텍처

## 개요
이 프로젝트는 정보보안기사 실기 단답형 학습용 모바일 앱이다. v1은 백엔드 없는 오프라인 앱이며, 모든 단답형 문제 데이터와 채점 로직은 앱 안에 포함된다. UI는 Expo/React Native로 만들고, 핵심 채점 및 학습 로직은 순수 TypeScript 함수로 분리한다.

## 디렉토리 구조
```text
App.tsx                    # 앱 진입점과 주요 화면 조립
app.json                   # Expo 앱 설정
eas.json                   # EAS 빌드/제출 설정
src/
  components/              # 재사용 UI 컴포넌트
  data/
    questions.ts           # 재구성 단답형 문제 은행과 콘텐츠 검증
  domain/
    grading.ts             # 단답형 채점 순수 함수
    progress.ts            # 학습 기록, 오답, 북마크 계산
  screens/                 # 홈, 문제풀이, 오답노트, 설정 화면
  storage/
    progressStore.ts       # 로컬 저장소 입출력
  types.ts                 # 공통 타입 정의
tests/
  grading.test.ts          # 단답형 채점 정책 테스트
  questionBank.test.ts     # 문제 데이터와 라이선스 정책 테스트
  progress.test.ts         # 학습 기록 계산 테스트
docs/
  PRD.md
  ARCHITECTURE.md
  ADR.md
```

## 데이터 모델
v1의 문제는 단답형 `ShortQuestion`만 사용한다.

- `ShortQuestion`
  - `id`: 문항 고유 ID
  - `category`: 분야
  - `difficulty`: 난이도
  - `title`: 짧은 제목
  - `prompt`: 문제 지문
  - `referenceAnswer`: 대표 정답
  - `acceptableAnswers`: 정답 후보 배열
  - `explanation`: 채점 후 보여줄 해설
  - `sourceType`: `rewritten`, `official_original`, `licensed_original`
  - `licenseRef`: 원문 콘텐츠를 쓸 때 필요한 권리 근거

- `ShortAnswerKey`
  - `value`: 정답 문자열
  - `caseSensitive`: 대소문자 구분 여부
  - `aliases`: 허용할 별칭 또는 축약어
  - `note`: 선택 설명

서술형 타입과 rubric은 v1 구현 대상이 아니다. 필요하면 v2에서 별도 ADR과 타입 변경으로 추가한다.

## 데이터 흐름
```text
사용자 단답 입력
→ UI에서 현재 ShortQuestion과 답안을 domain/grading.ts에 전달
→ 정답/오답 및 대소문자 피드백 생성
→ domain/progress.ts에서 Attempt로 학습 기록 반영
→ storage/progressStore.ts가 로컬 저장소에 저장
→ UI가 정답률, 진행률, 오답노트, 북마크 상태를 갱신
```

## 단답형 채점 정책
- 정답 후보마다 `caseSensitive`를 반드시 명시한다.
- `caseSensitive: false`
  - 앞뒤 공백 제거
  - 연속 공백 정규화
  - 대소문자 무시
  - 예: `SQL Injection`, `sql injection`, `SQLi`
- `caseSensitive: true`
  - 앞뒤 공백 제거
  - 연속 공백 정규화
  - 대소문자 정확히 비교
  - 예: `/etc/passwd`, `chmod`, `btmp`
- 사용자의 답이 철자는 같고 대소문자만 다르면 “대소문자 오류”로 별도 피드백을 제공한다.

## 콘텐츠 검증
- `validateQuestionBank`는 다음을 검사한다.
  - 문항 ID 중복 금지
  - 모든 문항은 단답형이어야 함
  - 모든 정답 후보의 `caseSensitive` 명시
  - 정답 후보 최소 1개 이상
  - `sourceType`이 원문 계열이면 `licenseRef` 필수
- v1 출시 데이터는 `sourceType: "rewritten"`만 허용하는 것을 기본으로 한다.

## 상태 관리
- 화면 내부 입력값은 React state로 관리한다.
- 풀이 기록, 오답, 북마크는 `StudyProgress`로 관리한다.
- v1 저장은 기기 로컬 저장소만 사용한다.
- 서버 상태는 v1에 존재하지 않는다.

## 보안/개인정보 원칙
- v1은 로그인하지 않는다.
- v1은 개인정보를 서버로 전송하지 않는다.
- OpenAI API 키나 서버 비밀값을 앱 번들에 포함하지 않는다.
- v2에서 AI 채점을 도입할 경우 모바일 앱은 자체 백엔드만 호출하고, OpenAI API는 서버에서만 호출한다.

## 배포
- Expo EAS Build를 기준으로 iOS와 Android 빌드를 준비한다.
- iOS는 TestFlight, Android는 Google Play 내부 테스트를 먼저 사용한다.
- 스토어 심사를 위해 앱 설명, 개인정보 처리방침, 지원 URL, 스크린샷을 준비한다.
