import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

type ExpoAppConfig = {
  expo?: {
    android?: {
      softwareKeyboardLayoutMode?: string;
    };
  };
};

const appConfig = JSON.parse(readFileSync("app.json", "utf8")) as ExpoAppConfig;

test("Android uses resize mode so the answer controls are not covered by the keyboard", () => {
  assert.equal(appConfig.expo?.android?.softwareKeyboardLayoutMode, "resize");
});
