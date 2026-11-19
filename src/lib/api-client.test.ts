import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError, isAbortError, postJson, requestErrorMessage } from "./api-client.ts";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function respond(status: number, body: string) {
  globalThis.fetch = async () => new Response(body, { status, headers: { "Content-Type": "application/json" } });
}

test("postJson returns the body of a successful response", async () => {
  respond(200, JSON.stringify({ plan: [1] }));
  assert.deepEqual(await postJson("/api/x", {}), { plan: [1] });
});

test("postJson throws ApiError with the server message or the status", async () => {
  const cases: Array<[number, string, number, string | null]> = [
    [400, JSON.stringify({ error: "Bad photo" }), 400, "Bad photo"],
    [200, JSON.stringify({ error: "Refused" }), 200, "Refused"],
    [502, "<html>gateway</html>", 502, null],
  ];
  for (const [status, body, expectedStatus, expectedMessage] of cases) {
    respond(status, body);
    await assert.rejects(postJson("/api/x", {}), (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, expectedStatus);
      assert.equal(err.serverMessage, expectedMessage);
      return true;
    });
  }
});

test("REQ-ERR-02 requestErrorMessage prefers the server message, then the status, then the network text", () => {
  const messages = { network: "Network error", request: "Error {status}" };
  assert.equal(requestErrorMessage(new ApiError(400, "Bad photo"), messages), "Bad photo");
  assert.equal(requestErrorMessage(new ApiError(502, null), messages), "Error 502");
  assert.equal(requestErrorMessage(new TypeError("Failed to fetch"), messages), "Network error");
});

test("isAbortError recognises only aborts", () => {
  assert.equal(isAbortError(new DOMException("aborted", "AbortError")), true);
  assert.equal(isAbortError(new Error("x")), false);
});
