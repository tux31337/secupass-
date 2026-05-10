# 프로젝트: 정보보안기사 실기 단답 트레이너

## 기술 스택
- 모바일 앱: Expo + React Native
- 언어: TypeScript strict mode
- 상태 저장: v1은 기기 로컬 저장소(AsyncStorage 계열)
- 테스트: Node test runner + TypeScript 실행 도구
- 배포 목표: iOS App Store + Google Play 동시 출시 가능 구조

## 아키텍처 규칙
- CRITICAL: v1은 단답형 전용 앱으로 만든다. 서술형 문제, rubric 채점, OpenAI API 채점은 v1 범위에 넣지 않는다.
- CRITICAL: v1은 백엔드 없는 오프라인 앱으로 만든다. 로그인, 클라우드 동기화, 서버 API는 v1 범위에 넣지 않는다.
- CRITICAL: 모바일 클라이언트에서 OpenAI API, 비밀키, 서버용 토큰을 직접 호출하거나 포함하지 않는다.
- CRITICAL: 권리 확보 전에는 기출 원문과 원문 해설을 출시 앱에 포함하지 않는다. v1 콘텐츠는 기출 경향 기반 재구성 단답형 문제만 사용한다.
- CRITICAL: 원문 콘텐츠를 추가해야 할 경우 `sourceType`과 `licenseRef`를 문항 단위로 기록하고, `licenseRef` 없는 원문 콘텐츠는 빌드/검증에서 실패해야 한다.
- 채점 로직은 UI와 분리된 순수 함수로 작성한다.
- 단답형 정답은 문항별로 `caseSensitive: true | false`를 반드시 명시한다.
- 문제 데이터, 채점 로직, 학습 진행률 로직은 UI 컴포넌트와 분리한다.
- 앱 화면은 모바일 우선으로 설계하고, 작은 화면에서 텍스트 겹침이 없어야 한다.

## 개발 프로세스
- CRITICAL: 새 기능 구현 시 반드시 테스트를 먼저 작성하고, 테스트가 통과하는 구현을 작성할 것(TDD).
- 구현 전 `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/ADR.md`의 결정과 충돌하지 않는지 확인한다.
- 서술형, AI 채점, 로그인, 동기화 요구가 나오면 v2+ 범위로 문서화한 뒤 별도 구현 계획을 세운다.
- 커밋 메시지는 conventional commits 형식을 따른다. 예: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`.
- 사용자 요청이 기획 변경이면 먼저 문서를 갱신하고, 구현은 별도 요청이 있을 때 진행한다.

## 명령어
```bash
npm.cmd run dev      # Expo 개발 서버
npm.cmd run android  # Android 실행
npm.cmd run ios      # iOS 실행
npm.cmd run build    # Expo export 또는 배포 빌드 준비
npm.cmd run lint     # TypeScript 검사
npm.cmd test         # 테스트
```

PowerShell에서는 실행 정책 문제를 피하기 위해 `npm` 대신 `npm.cmd`를 우선 사용한다.
