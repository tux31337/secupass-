import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import ts from "typescript";

const screenScaffoldSource = readFileSync("src/components/ScreenScaffold.tsx", "utf8");
const answerDockSource = readFileSync("src/components/AnswerDock.tsx", "utf8");
const sourceFile = ts.createSourceFile(
  "ScreenScaffold.tsx",
  screenScaffoldSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const answerDockSourceFile = ts.createSourceFile(
  "AnswerDock.tsx",
  answerDockSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);

function findJsxOpeningElements(name: string, file: ts.SourceFile = sourceFile): ts.JsxOpeningLikeElement[] {
  const matches: ts.JsxOpeningLikeElement[] = [];

  function visit(node: ts.Node) {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.tagName.getText(file) === name) {
      matches.push(node);
    }

    ts.forEachChild(node, visit);
  }

  visit(file);
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
  assert.match(screenScaffoldSource, /KeyboardAvoidingView/);
  assert.match(screenScaffoldSource, /Platform\.select/);

  const keyboardAvoidingViews = findJsxOpeningElements("KeyboardAvoidingView");
  assert.equal(keyboardAvoidingViews.length, 1);
  assert.match(attributeText(keyboardAvoidingViews[0], "behavior") ?? "", /keyboardAvoidingBehavior/);
  assert.equal(attributeText(keyboardAvoidingViews[0], "style"), "{styles.keyboardAvoiding}");
});

test("root layout reserves Android status bar space before rendering the header", () => {
  assert.match(screenScaffoldSource, /StatusBar\.currentHeight/);
  assert.match(screenScaffoldSource, /paddingTop:\s*Platform\.OS === "android" \? androidStatusBarInset : 0/);
  assert.match(screenScaffoldSource, /backgroundColor=\{colors\.background\}/);
  assert.match(screenScaffoldSource, /translucent=\{false\}/);
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
  const textInputs = findJsxOpeningElements("TextInput", answerDockSourceFile);
  assert.equal(textInputs.length, 1);
  assert.match(answerDockSource, /style=\{styles\.answerDock\}/);

  const verticalScrollView = findJsxOpeningElements("ScrollView").find(
    (element) => attributeText(element, "style") === "{styles.contentScroller}",
  );

  assert.ok(verticalScrollView);
  assert.ok(screenScaffoldSource.indexOf("{answerDock}") > verticalScrollView.end);
});

test("answer dock reserves bottom system navigation space on Android", () => {
  assert.match(answerDockSource, /const androidNavigationBarInset = spacing\.xxl/);
  assert.match(
    answerDockSource,
    /paddingBottom:\s*Platform\.OS === "android"\s*\?\s*spacing\.lg \+ androidNavigationBarInset\s*:\s*spacing\.lg/,
  );
});
