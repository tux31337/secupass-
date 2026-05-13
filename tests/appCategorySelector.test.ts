import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync("App.tsx", "utf8");

test("category selection uses an explicit modal selector instead of a clipped horizontal scroller", () => {
  assert.match(appSource, /Modal/);
  assert.match(appSource, /categorySelectorTrigger/);
  assert.match(appSource, /categorySelectorSheet/);
  assert.match(appSource, /categoryOptions/);
  assert.doesNotMatch(appSource, /<ScrollView[\s\S]*?\bhorizontal\b[\s\S]*?styles\.filters/);
});

test("category selector shows the current scope and keeps all options tappable", () => {
  assert.match(appSource, /selectedCategoryLabel/);
  assert.match(appSource, /selectedCategoryCount/);
  assert.match(appSource, /accessibilityRole="button"/);
  assert.match(appSource, /accessibilityRole="menuitem"/);
  assert.match(appSource, /selectCategory\(option\.value\)/);
});
