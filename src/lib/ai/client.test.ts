import assert from "node:assert/strict";
import { test } from "node:test";
import Anthropic from "@anthropic-ai/sdk";
import { largeModelOptions, outcomeOf, withParseRetry } from "./client.ts";

test("largeModelOptions: Haiku gets no effort or fallbacks, larger models get both", () => {
  assert.deepEqual(largeModelOptions("claude-haiku-4-5", "high"), { request: {}, output: {} });
  assert.deepEqual(largeModelOptions("claude-opus-5-5", "medium"), {
    request: { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" },
    output: { effort: "medium" },
  });
});

test("REQ-AI-01 outcomeOf: refusal, empty output and parsed output", () => {
  const cases = [
    [{ stop_reason: "refusal", stop_details: { category: "medical" }, parsed_output: null }, { status: "refused", category: "medical" }],
    [{ stop_reason: "refusal", stop_details: null, parsed_output: null }, { status: "refused", category: null }],
    [{ stop_reason: "end_turn", stop_details: null, parsed_output: null }, { status: "empty" }],
    [{ stop_reason: "end_turn", stop_details: null, parsed_output: { ok: true } }, { status: "ok", data: { ok: true } }],
  ] as const;
  for (const [res, expected] of cases) assert.deepEqual(outcomeOf(res), expected);
});

test("REQ-AI-01 withParseRetry retries a parse error once, never an API error", async () => {
  let calls = 0;
  const flaky = async () => {
    calls += 1;
    if (calls === 1) throw new Anthropic.AnthropicError("bad enum");
    return "ok";
  };
  assert.equal(await withParseRetry(flaky), "ok");
  assert.equal(calls, 2);

  let apiCalls = 0;
  const failing = async () => {
    apiCalls += 1;
    throw new Anthropic.APIError(500, undefined, "boom", undefined);
  };
  await assert.rejects(withParseRetry(failing), Anthropic.APIError);
  assert.equal(apiCalls, 1);
});
