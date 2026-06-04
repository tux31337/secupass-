import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const componentFiles = [
  "src/components/AnswerDock.tsx",
  "src/components/CategorySelector.tsx",
  "src/components/FeedbackPanel.tsx",
  "src/components/QuestionCard.tsx",
  "src/components/ScreenScaffold.tsx",
  "src/components/StudyHeader.tsx",
  "src/screens/StudyScreen.tsx",
];

test("study UI is split into screen and reusable component files", () => {
  for (const file of componentFiles) {
    assert.equal(existsSync(file), true, `${file} should exist`);
  }

  const appSource = readFileSync("App.tsx", "utf8");
  assert.match(appSource, /import \{ StudyScreen \} from "\.\/src\/screens\/StudyScreen\.tsx"/);
  assert.match(appSource, /<StudyScreen colors=\{colors\} isDarkMode=\{isDarkMode\} \/>/);
});

test("study screen composes extracted components instead of owning all UI markup", () => {
  const studyScreenSource = readFileSync("src/screens/StudyScreen.tsx", "utf8");

  for (const component of [
    "AnswerDock",
    "CategorySelector",
    "FeedbackPanel",
    "QuestionCard",
    "ScreenScaffold",
    "StudyHeader",
  ]) {
    assert.match(studyScreenSource, new RegExp(`<${component}\\b`));
  }
});

test("hard-coded colors are isolated to the design theme", () => {
  const filesToCheck = [
    "App.tsx",
    "src/components/AnswerDock.tsx",
    "src/components/CategorySelector.tsx",
    "src/components/FeedbackPanel.tsx",
    "src/components/QuestionCard.tsx",
    "src/components/ScreenScaffold.tsx",
    "src/components/StudyHeader.tsx",
    "src/screens/StudyScreen.tsx",
  ];

  for (const file of filesToCheck) {
    const source = readFileSync(join(file), "utf8");
    assert.doesNotMatch(source, /#[0-9A-Fa-f]{3,8}|rgba\(/, `${file} should use theme colors only`);
  }
});
