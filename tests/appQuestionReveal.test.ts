import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync("App.tsx", "utf8");

test("question prompt does not reveal the answer by rendering the question title before grading", () => {
  assert.doesNotMatch(appSource, /styles\.questionTitle\}>\{currentQuestion\.title\}/);
});
