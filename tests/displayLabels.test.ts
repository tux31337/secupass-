import assert from "node:assert/strict";
import test from "node:test";

import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "../src/types.ts";

test("category and difficulty labels are readable Korean UI text", () => {
  assert.deepEqual(CATEGORY_LABELS, {
    web_security: "웹 보안",
    system_security: "시스템 보안",
    network_security: "네트워크 보안",
    cryptography: "암호",
    application_security: "애플리케이션 보안",
    management_security: "관리 보안",
  });

  assert.deepEqual(DIFFICULTY_LABELS, {
    basic: "기초",
    intermediate: "중급",
    advanced: "고급",
  });
});
