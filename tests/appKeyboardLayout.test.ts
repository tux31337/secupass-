import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import ts from "typescript";

const appSource = readFileSync("App.tsx", "utf8");
const sourceFile = ts.createSourceFile("App.tsx", appSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function findJsxOpeningElements(name: string): ts.JsxOpeningLikeElement[] {
  const matches: ts.JsxOpeningLikeElement[] = [];

  function visit(node: ts.Node) {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(sourceFile) === name) {
      matches.push(node);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return matches;
}

function getJsxAttribute(element: ts.JsxOpeningLikeElement, attributeName: string): ts.JsxAttribute | undefined {
  return element.attributes.properties.find(
    (property): property is ts.JsxAttribute =>
      ts.isJsxAttribute(property) && property.name.getText(sourceFile) === attributeName,
  );
}

function attributeText(element: ts.JsxOpeningLikeElement, attributeName: string): string | undefined {
  return getJsxAttribute(element, attributeName)?.initializer?.getText(sourceFile);
}

function hasJsxAncestorWithStyle(node: ts.Node, tagName: string, styleText: string): boolean {
  let current: ts.Node | undefined = node.parent;

  while (current) {
    if (ts.isJsxElement(current)) {
      const openingElement = current.openingElement;
      if (
        openingElement.tagName.getText(sourceFile) === tagName &&
        attributeText(openingElement, "style") === styleText
      ) {
        return true;
      }
    }

    current = current.parent;
  }

  return false;
}

test("question screen explicitly avoids the iOS and Android software keyboard", () => {
  assert.match(appSource, /KeyboardAvoidingView/);
  assert.match(appSource, /Platform\.select/);
  assert.match(appSource, /ios:\s*"padding" as const/);
  assert.match(appSource, /android:\s*"height" as const/);

  const keyboardAvoidingViews = findJsxOpeningElements("KeyboardAvoidingView");
  assert.equal(keyboardAvoidingViews.length, 1);
  assert.match(attributeText(keyboardAvoidingViews[0], "behavior") ?? "", /keyboardAvoidingBehavior/);
  assert.equal(attributeText(keyboardAvoidingViews[0], "style"), "{styles.keyboardAvoiding}");
});

test("root layout reserves safe-area space before rendering the header", () => {
  assert.match(appSource, /SafeAreaProvider/);
  assert.match(appSource, /useSafeAreaInsets/);
  assert.match(appSource, /const insets = useSafeAreaInsets\(\)/);
  assert.match(appSource, /paddingTop:\s*insets\.top/);
  assert.match(appSource, /backgroundColor=\{colors\.background\}/);
  assert.match(appSource, /translucent=\{false\}/);
});

test("question screen scrolls while the keyboard is open and keeps actions tappable", () => {
  const scrollViews = findJsxOpeningElements("ScrollView");
  const verticalScrollView = scrollViews.find(
    (element) => attributeText(element, "keyboardShouldPersistTaps") === '"handled"',
  );

  assert.ok(verticalScrollView);
  assert.equal(attributeText(verticalScrollView, "style"), "{styles.contentScroller}");
  assert.equal(attributeText(verticalScrollView, "contentContainerStyle"), "{styles.screen}");
});

test("answer input is docked outside the scrolling question content", () => {
  const textInputs = findJsxOpeningElements("TextInput");
  assert.equal(textInputs.length, 1);
  assert.equal(hasJsxAncestorWithStyle(textInputs[0], "View", "{[styles.answerDock, answerDockStyle]}"), true);

  const verticalScrollView = findJsxOpeningElements("ScrollView").find(
    (element) => attributeText(element, "style") === "{styles.contentScroller}",
  );

  assert.ok(verticalScrollView);
  assert.equal(textInputs[0].pos > verticalScrollView.pos && textInputs[0].end < verticalScrollView.end, false);
});

test("answer dock reserves measured bottom safe-area space", () => {
  assert.match(appSource, /const bottomSafeAreaInset = Math\.max\(insets\.bottom, spacing\.sm\)/);
  assert.match(appSource, /const answerDockStyle = \{\s*paddingBottom:\s*bottomSafeAreaInset \+ spacing\.md,\s*\}/s);
  assert.match(appSource, /style=\{\[styles\.answerDock, answerDockStyle\]\}/);
  assert.doesNotMatch(appSource, /androidNavigationBarInset/);
  assert.doesNotMatch(appSource, /paddingBottom:\s*Platform\.OS === "android"/);
});

test("category selector sheet reserves measured bottom safe-area space", () => {
  assert.match(appSource, /const categorySelectorSheetStyle = \{\s*paddingBottom:\s*bottomSafeAreaInset \+ spacing\.lg,\s*\}/s);
  assert.match(appSource, /style=\{\[styles\.categorySelectorSheet, categorySelectorSheetStyle\]\}/);
});

test("answer action keeps a stable height instead of flexing toward the bottom edge", () => {
  assert.match(appSource, /alignSelf:\s*"stretch"/);
  assert.doesNotMatch(appSource, /actionButton:\s*\{[^}]*flex:\s*1/s);
});

test("answer dock shows one state-based full-width action instead of side-by-side buttons", () => {
  assert.match(appSource, /const answerActionLabel = result \? "다음" : "채점"/);
  assert.match(appSource, /const answerActionHandler = result \? moveNext : submitAnswer/);
  assert.match(appSource, /onPress=\{answerActionHandler\}/);
  assert.match(appSource, /\{answerActionLabel\}/);
  assert.doesNotMatch(appSource, /styles\.secondaryButton/);
  assert.doesNotMatch(appSource, /secondaryButtonText/);
});

test("editing the answer after grading returns the dock action to grading mode", () => {
  assert.match(appSource, /function updateAnswer\(nextAnswer: string\)/);
  assert.match(appSource, /setAnswer\(nextAnswer\)/);
  assert.match(appSource, /setResult\(null\)/);
  assert.match(appSource, /onChangeText=\{updateAnswer\}/);
});

test("learning screen uses compact spacing so the question stays prominent", () => {
  assert.match(appSource, /compactScreenGap/);
  assert.match(appSource, /compactQuestionPadding/);
  assert.match(appSource, /gap:\s*compactScreenGap/);
  assert.match(appSource, /padding:\s*compactQuestionPadding/);
});

test("question panel does not render category or difficulty metadata tags", () => {
  assert.doesNotMatch(appSource, /styles\.metaRow/);
  assert.doesNotMatch(appSource, /styles\.metaText/);
  assert.doesNotMatch(appSource, /CATEGORY_LABELS\[currentQuestion\.category\]/);
  assert.doesNotMatch(appSource, /DIFFICULTY_LABELS\[currentQuestion\.difficulty\]/);
});
