import assert from "node:assert/strict";
import { test } from "node:test";
import { cn } from "./cn.ts";

test("cn joins truthy parts only", () => {
  const cases: Array<[Parameters<typeof cn>, string]> = [
    [[], ""],
    [["a"], "a"],
    [["a", false, null, undefined, "", "b"], "a b"],
    [["a", true && "b"], "a b"],
  ];
  for (const [parts, expected] of cases) assert.equal(cn(...parts), expected);
});
