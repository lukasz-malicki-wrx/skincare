import assert from "node:assert/strict";
import { test } from "node:test";
import { stageStatus } from "./stage-status.ts";

test("stageStatus: earlier steps are done, the running one current, later ones pending", () => {
  const cases: Array<[number, number, string]> = [
    [0, 2, "done"],
    [1, 2, "done"],
    [2, 2, "current"],
    [3, 2, "pending"],
  ];
  for (const [index, stage, expected] of cases) assert.equal(stageStatus(index, stage), expected);
});
