import assert from "node:assert/strict";
import test from "node:test";

import { questionBank, validateQuestionBank } from "../src/data/questions.ts";
import type { ShortQuestion } from "../src/types.ts";

const validQuestion: ShortQuestion = {
  id: "network-001",
  category: "network_security",
  difficulty: "basic",
  title: "VPN",
  prompt: "공중망에서 암호화된 사설 통신 경로를 제공하는 기술은?",
  referenceAnswer: "VPN",
  acceptableAnswers: [
    {
      value: "VPN",
      caseSensitive: false,
      aliases: ["Virtual Private Network"],
    },
  ],
  explanation: "VPN은 공중망 위에 암호화된 사설 터널을 만든다.",
  sourceType: "rewritten",
};

test("valid rewritten short-answer questions pass validation", () => {
  const result = validateQuestionBank([validQuestion]);

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("bundled question bank passes v1 launch validation", () => {
  const result = validateQuestionBank(questionBank, { v1LaunchOnly: true });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("duplicate question ids fail validation", () => {
  const result = validateQuestionBank([validQuestion, { ...validQuestion }]);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /duplicate id: network-001/);
});

test("every answer key must explicitly declare caseSensitive", () => {
  const invalid = {
    ...validQuestion,
    id: "network-002",
    acceptableAnswers: [{ value: "VPN" }],
  } as unknown as ShortQuestion;

  const result = validateQuestionBank([invalid]);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /caseSensitive/);
});

test("questions must have at least one acceptable answer", () => {
  const invalid = {
    ...validQuestion,
    id: "network-003",
    acceptableAnswers: [],
  };

  const result = validateQuestionBank([invalid]);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /at least one acceptable answer/);
});

test("original content source types require licenseRef", () => {
  const invalid = {
    ...validQuestion,
    id: "network-004",
    sourceType: "official_original",
  } as ShortQuestion;

  const result = validateQuestionBank([invalid]);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /licenseRef/);
});

test("v1 launch validation only allows rewritten content", () => {
  const licensed = {
    ...validQuestion,
    id: "network-005",
    sourceType: "licensed_original",
    licenseRef: "contract-2026-001",
  } as ShortQuestion;

  const result = validateQuestionBank([licensed], { v1LaunchOnly: true });

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /rewritten/);
});
