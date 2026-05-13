# Design Guidelines

이 문서는 정보보안기사 실기 단답 트레이너 v1의 모바일 UI 기준이다. UI 화면, 컴포넌트, 입력 흐름을 변경할 때는 `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/ADR.md`와 함께 확인한다.

## Visual Direction

- v1은 문제를 빠르게 읽고, 단답을 입력하고, 즉시 채점하는 학습 앱이다. 화면은 조용하고 명확해야 하며 장식보다 가독성과 반복 사용성을 우선한다.
- 색상은 마켓컬리에서 연상되는 보라색을 절제해 사용한다. 브랜드를 복제하지 않고, 학습 앱에 맞는 흰색/중립 배경 위에 보라색을 주요 액션과 선택 상태에만 쓴다.
- 기본 토큰은 `src/design/theme.ts`를 기준으로 한다.
  - Primary: `#5F0080`
  - Pressed primary: `#4B0067`
  - Soft primary surface: `#F7EFFA`
  - App background: `#FAF8FB`
  - Surface: `#FFFFFF`
  - Border: `#E5DDEB`
- 보라색 면적을 과하게 넓히지 않는다. 헤더, 본문, 입력 영역은 흰색과 중립색을 중심으로 두고, 선택 상태, CTA, 메타 강조에만 보라색을 사용한다.
- 반복 UI의 border radius는 8px 이하를 기본으로 한다. 카드 안에 카드를 중첩하지 않는다.

## Layout Rules

- 화면 루트는 Safe Area를 고려한다. 상태바, Dynamic Island, 노치, Android 시스템 영역과 주요 콘텐츠가 겹치지 않아야 한다.
- 주요 학습 화면은 세로 스크롤을 허용한다. 긴 문제, 긴 해설, 키보드가 열린 상태에서도 사용자가 내용을 읽고 다음 액션으로 이동할 수 있어야 한다.
- 과도한 가로 스크롤은 금지한다. 특히 필터/카테고리처럼 전체 선택지를 이해해야 하는 UI는 일부만 잘린 칩 목록으로 만들지 않는다.
- 고정 높이 안에 긴 텍스트를 가두지 않는다. 문제 제목, 지문, 정답, 해설은 한국어 긴 문장과 보안 용어가 자연스럽게 줄바꿈되어야 한다.
- 버튼과 입력창은 내용 변화로 레이아웃이 흔들리지 않도록 최소 높이와 안정적인 여백을 가진다.

## Category Selector UX

- 카테고리는 “현재 학습 범위 선택” 컨트롤로 다룬다. 첫 화면에는 현재 선택값과 문항 수만 명확히 보여 준다.
- 전체 카테고리 목록은 명시적인 선택 버튼을 눌렀을 때 모달 시트로 연다.
- 카테고리 시트는 `전체`와 모든 카테고리를 한 번에 읽을 수 있게 보여 주며, 각 옵션은 최소 48dp 높이를 가진다.
- 현재 선택된 카테고리는 보라색 soft surface, primary border, primary text로 표시한다.
- 일부 칩만 화면 끝에서 잘려 보이는 패턴은 사용하지 않는다. 필요한 경우 모달, 드롭다운, 2열 전체 노출 중 하나를 선택한다.

## Keyboard And Input Rules

- `TextInput`이 있는 화면은 키보드가 열린 상태를 기본 검증 상태로 본다. 입력창, 채점 버튼, 다음 버튼은 키보드에 가려지면 안 된다.
- React Native에서는 `KeyboardAvoidingView`, 스크롤 컨테이너 조정, 고정 answer dock을 명시적으로 사용한다.
- iOS와 Android는 키보드 회피 동작이 다르므로 두 플랫폼 모두 확인한다. Android는 Expo `android.softwareKeyboardLayoutMode: "resize"`를 유지한다.
- 단답 입력은 `autoCapitalize="none"`과 `autoCorrect={false}`를 사용한다. 명령어, 경로, 약어의 대소문자를 사용자가 직접 제어할 수 있어야 한다.
- `returnKeyType`, `onSubmitEditing`, 포커스 이동은 학습 흐름과 충돌하지 않아야 한다.

## Touch And Accessibility Rules

- 터치 가능한 요소는 iOS 44pt, Android 48dp 기준을 만족해야 한다. 이 프로젝트에서는 `touchTarget.minHeight` 48을 기본값으로 사용한다.
- 색상만으로 정답/오답을 구분하지 않는다. 피드백 문구와 시각 강조를 함께 사용한다.
- 버튼 사이에는 오입력을 줄일 수 있는 간격을 둔다. 특히 하단 액션과 피드백 주변의 액션을 너무 붙이지 않는다.
- 본문 텍스트는 동적 글자 크기와 긴 한국어 문장을 고려한다. 텍스트가 부모 영역 밖으로 나가거나 다른 요소를 덮으면 실패로 본다.

## Verification Matrix

UI 변경 PR은 가능한 범위에서 다음 상태를 확인한다.

- 작은 Android 화면에서 키보드 닫힘/열림 상태.
- 일반 Android 화면에서 키보드 닫힘/열림 상태.
- iPhone SE급 작은 iOS 화면에서 키보드 닫힘/열림 상태.
- 일반 iPhone 화면에서 키보드 닫힘/열림 상태.
- 긴 문제 제목, 긴 지문, 긴 해설이 있는 문항.
- 긴 정답 후보 또는 경로/명령어처럼 줄바꿈이 까다로운 텍스트.
- 큰 글자 설정 또는 글자 크기 증가에 가까운 상태.
- 카테고리 선택 시트가 작은 화면에서 잘리지 않고 모든 옵션을 선택할 수 있는 상태.

## Required UI Review Checklist

- Safe Area와 상태바 영역에 콘텐츠가 겹치지 않는다.
- 키보드가 열린 상태에서 입력창과 핵심 액션이 접근 가능하다.
- 작은 화면에서 텍스트, 버튼, 피드백 영역이 겹치지 않는다.
- 터치 가능한 요소가 iOS 44pt, Android 48dp 기준을 만족한다.
- 불필요한 가로 스크롤이 없다.
- 카테고리 선택은 일부 잘린 칩 목록이 아니라 명시적인 선택 UI로 제공된다.
- iOS와 Android 중 한쪽에서만 자연스러운 동작이 없다.

## References

- React Native `KeyboardAvoidingView`: https://reactnative.dev/docs/keyboardavoidingview
- Expo `android.softwareKeyboardLayoutMode`: https://docs.expo.dev/versions/v54.0.0/config/app/#softwarekeyboardlayoutmode
- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines
- Apple UI Design Dos and Don'ts: https://developer.apple.com/design/tips/
- Android touch target guidance: https://support.google.com/accessibility/android/answer/7101858
