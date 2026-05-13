import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

test("design theme exposes Kurly-inspired semantic tokens", async () => {
  assert.equal(existsSync("src/design/theme.ts"), true);

  const { colors, radius, spacing, touchTarget } = (await import("../src/design/theme.ts")) as typeof import("../src/design/theme.ts");

  assert.equal(colors.primary, "#5F0080");
  assert.equal(colors.primaryPressed, "#4B0067");
  assert.equal(colors.primarySoft, "#F7EFFA");
  assert.equal(colors.surface, "#FFFFFF");
  assert.equal(colors.background, "#FAF8FB");
  assert.equal(colors.textPrimary, "#1F1B24");
  assert.equal(colors.textSecondary, "#6B6272");
  assert.equal(colors.border, "#E5DDEB");
  assert.ok(spacing.md >= 12);
  assert.ok(radius.md <= 8);
  assert.equal(touchTarget.minHeight, 48);
});
