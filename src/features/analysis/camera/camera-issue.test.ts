import assert from "node:assert/strict";
import { test } from "node:test";
import { cameraIssueOf } from "./camera-issue.ts";

test("cameraIssueOf maps getUserMedia errors to a message key", () => {
  const cases: Array<[unknown, string]> = [
    [new DOMException("no", "NotAllowedError"), "cameraDenied"],
    [new DOMException("no", "NotFoundError"), "cameraMissing"],
    [new DOMException("no", "NotSupportedError"), "cameraUnsupported"],
    [new DOMException("no", "NotReadableError"), "cameraFailed"],
    [new Error("boom"), "cameraFailed"],
  ];
  for (const [err, expected] of cases) assert.equal(cameraIssueOf(err), expected);
});
