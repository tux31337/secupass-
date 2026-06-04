# CLAUDE.md

## 프로젝트

정보보안기사 실기 **단답 트레이너**. 모바일에서 단답형 문제를 반복 풀이하고 즉시 자동 채점한다.
**오프라인 단일 화면** 앱이며, Expo(React Native) + TypeScript로 만든다. 백엔드·로그인 없음.

## 절대 규칙 (어기기 쉬운 것들)

- **오프라인 전용**: 네트워크 호출·외부 API 키 번들·PII 전송 금지. 모든 로직은 앱 내부에 둔다.
  (근거: `docs/ARCHITECTURE.md`)
- **색상은 `src/design/theme.ts`에서만**: 컴포넌트에 hex/rgba 하드코딩 금지. 색상은 `ThemeColors`를
  prop으로 주입받는다. (`tests/componentStructure.test.ts`가 강제)
- **answer key는 `caseSensitive` 명시 필수**: 모든 `ShortAnswerKey`에 `caseSensitive`를 true/false로
  명시한다. 용어·약어·한글 = `false`, 명령어·경로·코드·설정값 = `true`.
  (`tests/questionBank.test.ts`가 강제)
- **v1 콘텐츠는 `sourceType: "rewritten"`만**: 원문 인용 금지. `examPart`·`conceptId`·
  `sourceNoteRefs`(1개 이상) 필수. 상세는 `docs/CONTENT_RULES.md`.
- **테스트는 `node --test`** (Jest/Vitest 아님). ESM 프로젝트(`package.json`의 `"type": "module"`).

## 명령어 치트 시트

```
npm run dev      # expo start (Metro 개발 서버)
npm run ios      # expo start --ios
npm run android  # expo start --android
npm run build    # expo export (프로덕션 번들)
npm run lint     # tsc --noEmit  ← ESLint 아님, 타입 체크만
npm test         # node --test tests/*.test.ts  ← Jest 아님
```

PR 전 권장: `npm run lint` + `npm test`.

## 아키텍처

데이터 흐름:
`TextInput → StudyScreen state → gradeShortAnswer() → GradeResult → FeedbackPanel`

컴포넌트 트리:
`App(theme) → StudyScreen → ScreenScaffold → { StudyHeader, QuestionCard, FeedbackPanel, AnswerDock }`
`+ CategorySelector(modal)`

핵심 좌표:
- 채점 로직(순수 함수): `src/domain/grading.ts`
- 문제 은행 + 검증: `src/data/questions.ts`
- 공유 타입: `src/types.ts`
- 테마: `src/design/theme.ts` — `getThemeColors(scheme)`, light/dark 팔레트
- 화면 / 컴포넌트: `src/screens/`, `src/components/`

상세: `docs/ARCHITECTURE.md`

## 컨벤션

- **상태관리 없음**: React local state만 사용. 라우터·전역 스토어(Redux/Context) 없음.
- **컴포넌트 스타일**: `createStyles(colors)`를 `useMemo`로 감싸 `StyleSheet`를 만들고, 색상은 prop으로
  주입한다.
- **타입 패턴**: `as const` 배열 → 리터럴 유니온 + `Record<Type, string>` 라벨 사전 (`src/types.ts`).
- **UI 가이드라인**(safe area·키보드 처리·터치 타깃·검증 매트릭스): `docs/DESIGN.md`
- **콘텐츠 작성 규칙**(난이도·conceptId·채점 정책): `docs/CONTENT_RULES.md`

## 진행 중

- 다크/라이트 **테마 모드**(`useColorScheme` → `getThemeColors`)와 **컴포넌트 구조 분리** 리팩터 진행 중.
- 상세 현황은 git 히스토리/브랜치 참고.

## 참고자료

- 제품 요구사항: `docs/PRD.md`
- 아키텍처: `docs/ARCHITECTURE.md`
- 설계 결정(ADR): `docs/ADR.md`
- UI 가이드: `docs/DESIGN.md`
- 콘텐츠 규칙: `docs/CONTENT_RULES.md`
