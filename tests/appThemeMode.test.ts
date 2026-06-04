import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync("App.tsx", "utf8");
const screenScaffoldSource = readFileSync("src/components/ScreenScaffold.tsx", "utf8");

test("app selects Atelier theme colors from the native color scheme", () => {
  assert.match(appSource, /useColorScheme/);
  assert.match(appSource, /getThemeColors\(colorScheme\)/);
  assert.match(appSource, /const isDarkMode = colorScheme === "dark"/);
  assert.match(appSource, /<StudyScreen colors=\{colors\} isDarkMode=\{isDarkMode\} \/>/);
  assert.match(screenScaffoldSource, /barStyle=\{isDarkMode \? "light-content" : "dark-content"\}/);
});
