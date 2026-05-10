import assert from "node:assert/strict";
import test from "node:test";

import { gradeShortAnswer } from "../src/domain/grading.ts";
import type { ShortQuestion } from "../src/types.ts";

const question: ShortQuestion = {
  id: "web-001",
  category: "web_security",
  difficulty: "basic",
  title: "SQL injection term",
  prompt: "사용자 입력으로 SQL 구문을 조작하는 공격 기법은?",
  referenceAnswer: "SQL Injection",
  acceptableAnswers: [
    {
      value: "SQL Injection",
      caseSensitive: false,
      aliases: ["SQLi"],
    },
    {
      value: "/etc/passwd",
      caseSensitive: true,
    },
  ],
  explanation: "SQL Injection은 입력값으로 쿼리 구조를 바꾸는 공격이다.",
  sourceType: "rewritten",
};

test("case-insensitive answers ignore case and repeated whitespace", () => {
  const result = gradeShortAnswer(question, "  sql   injection  ");

  assert.equal(result.status, "correct");
  assert.equal(result.isCorrect, true);
  assert.equal(result.matchedAnswer, "SQL Injection");
});

test("aliases use the answer key case-sensitivity policy", () => {
  const result = gradeShortAnswer(question, "sqli");

  assert.equal(result.status, "correct");
  assert.equal(result.isCorrect, true);
  assert.equal(result.matchedAnswer, "SQLi");
});

test("case-sensitive answers allow whitespace normalization but require exact case", () => {
  const correct = gradeShortAnswer(question, "  /etc/passwd  ");
  const wrongCase = gradeShortAnswer(question, "/ETC/PASSWD");

  assert.equal(correct.status, "correct");
  assert.equal(correct.isCorrect, true);
  assert.equal(wrongCase.status, "case_mismatch");
  assert.equal(wrongCase.isCorrect, false);
  assert.equal(wrongCase.expectedAnswer, "/etc/passwd");
});

test("blank submissions are incorrect with an empty-answer status", () => {
  const result = gradeShortAnswer(question, "   ");

  assert.equal(result.status, "empty");
  assert.equal(result.isCorrect, false);
});

test("unmatched submissions are incorrect", () => {
  const result = gradeShortAnswer(question, "cross site scripting");

  assert.equal(result.status, "incorrect");
  assert.equal(result.isCorrect, false);
});
