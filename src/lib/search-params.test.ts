import assert from "node:assert/strict";
import { test } from "node:test";
import { pickOption, withSearchParam } from "./search-params.ts";

test("withSearchParam sets non-default values and drops the default", () => {
  const cases: Array<[string, string, string]> = [
    ["", "diet", "?tab=diet"],
    ["tab=diet", "care", ""],
    ["period=evening", "diet", "?period=evening&tab=diet"],
    ["tab=diet&period=evening", "care", "?period=evening"],
  ];
  for (const [search, value, expected] of cases) assert.equal(withSearchParam(search, "tab", value, "care"), expected);
});

test("pickOption accepts only known values", () => {
  const tabs = ["care", "diet"] as const;
  assert.equal(pickOption("diet", tabs, "care"), "diet");
  assert.equal(pickOption("admin", tabs, "care"), "care");
  assert.equal(pickOption(null, tabs, "care"), "care");
});
