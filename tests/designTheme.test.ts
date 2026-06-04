import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

test("design theme exposes Atelier-inspired light and dark semantic tokens", async () => {
  assert.equal(existsSync("src/design/theme.ts"), true);

  const { colors, getThemeColors, radius, spacing, themeColors, touchTarget } = (await import(
    "../src/design/theme.ts"
  )) as typeof import("../src/design/theme.ts");

  assert.equal(colors, themeColors.light);
  assert.equal(colors.primary, "#18181B");
  assert.equal(colors.primaryPressed, "#27272A");
  assert.equal(colors.primarySoft, "#E4E4E7");
  assert.equal(colors.surface, "#FFFFFF");
  assert.equal(colors.background, "#FFFFFF");
  assert.equal(colors.textPrimary, "#171717");
  assert.equal(colors.textSecondary, "#52525B");
  assert.equal(colors.border, "#E4E4E7");
  assert.equal(themeColors.dark.background, "#131316");
  assert.equal(themeColors.dark.surface, "#1B1B1E");
  assert.equal(themeColors.dark.primary, "#E4E1E5");
  assert.equal(themeColors.dark.primaryPressed, "#C7C6CA");
  assert.equal(themeColors.dark.primarySoft, "#303033");
  assert.equal(themeColors.dark.textSecondary, "#C7C6CA");
  assert.equal(themeColors.dark.border, "rgba(255, 255, 255, 0.1)");
  assert.equal(getThemeColors("light"), themeColors.light);
  assert.equal(getThemeColors("dark"), themeColors.dark);
  assert.equal(getThemeColors(null), themeColors.light);
  assert.equal(getThemeColors(undefined), themeColors.light);
  assert.ok(spacing.md >= 12);
  assert.ok(radius.md <= 8);
  assert.equal(touchTarget.minHeight, 48);
});
