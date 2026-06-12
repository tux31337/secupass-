import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync("App.tsx", "utf8");

function styleBlock(styleName: string): string {
  const match = appSource.match(new RegExp(`${styleName}:\\s*\\{[\\s\\S]*?\\n  \\},`));
  assert.ok(match, `${styleName} style exists`);
  return match[0];
}

test("category selection uses an explicit modal selector instead of a clipped horizontal scroller", () => {
  assert.match(appSource, /Modal/);
  assert.match(appSource, /categorySelectorButton/);
  assert.match(appSource, /categorySelectorSheet/);
  assert.match(appSource, /categoryOptions/);
  assert.doesNotMatch(appSource, /<ScrollView[\s\S]*?\bhorizontal\b[\s\S]*?styles\.filters/);
});

test("category selector shows the current scope and keeps all options tappable", () => {
  assert.match(appSource, /selectedCategoryLabel/);
  assert.match(appSource, /selectedCategoryCount/);
  assert.match(appSource, /categorySelectorInfo/);
  assert.match(appSource, /categorySelectorButtonText/);
  assert.match(appSource, /accessibilityLabel="학습 범위 변경"/);
  assert.match(appSource, /accessibilityRole="button"/);
  assert.match(appSource, /accessibilityRole="menuitem"/);
  assert.match(appSource, /selectCategory\(option\.value\)/);
});

test("category selector keeps scope text on the left and the change button on the right", () => {
  const rowStyle = styleBlock("categorySelectorRow");
  const infoStyle = styleBlock("categorySelectorInfo");
  const buttonStyle = styleBlock("categorySelectorButton");
  const selectedLabelStyle = styleBlock("selectedCategoryLabel");

  assert.match(appSource, /categorySelectorRow/);
  assert.match(appSource, /categorySelectorInfo/);
  assert.match(appSource, /categorySelectorButton/);
  assert.match(appSource, /styles\.categorySelectorRow/);
  assert.match(appSource, /styles\.categorySelectorInfo/);
  assert.match(appSource, /styles\.categorySelectorButton/);
  assert.match(rowStyle, /alignItems:\s*"center"/);
  assert.match(rowStyle, /justifyContent:\s*"space-between"/);
  assert.match(infoStyle, /flex:\s*1/);
  assert.match(infoStyle, /minWidth:\s*0/);
  assert.match(buttonStyle, /flexShrink:\s*0/);
  assert.match(buttonStyle, /minHeight:\s*touchTarget\.minHeight/);
  assert.match(buttonStyle, /borderRadius:\s*radius\.sm/);
  assert.match(selectedLabelStyle, /flexShrink:\s*1/);
  assert.match(selectedLabelStyle, /minWidth:\s*0/);
});
