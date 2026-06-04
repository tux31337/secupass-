import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const categorySelectorSource = readFileSync("src/components/CategorySelector.tsx", "utf8");
const studyScreenSource = readFileSync("src/screens/StudyScreen.tsx", "utf8");

test("category selection uses an explicit modal selector instead of a clipped horizontal scroller", () => {
  assert.match(categorySelectorSource, /Modal/);
  assert.match(categorySelectorSource, /categorySelectorTrigger/);
  assert.match(categorySelectorSource, /categorySelectorSheet/);
  assert.match(categorySelectorSource, /categoryOptions/);
  assert.doesNotMatch(categorySelectorSource, /<ScrollView[\s\S]*?\bhorizontal\b[\s\S]*?styles\.filters/);
});

test("category selector shows the current scope and keeps all options tappable", () => {
  assert.match(studyScreenSource, /selectedCategoryLabel/);
  assert.match(studyScreenSource, /selectedCategoryCount/);
  assert.match(categorySelectorSource, /accessibilityRole="button"/);
  assert.match(categorySelectorSource, /accessibilityRole="menuitem"/);
  assert.match(categorySelectorSource, /onSelect\(option\)/);
});
