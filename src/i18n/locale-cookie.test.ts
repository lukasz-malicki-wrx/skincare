import assert from "node:assert/strict";
import { test } from "node:test";
import { localeFromCookieHeader } from "./locale-cookie.ts";

test("REQ-I18N-01 localeFromCookieHeader keeps English unless the cookie is pl or en", () => {
  assert.equal(localeFromCookieHeader(null), "en");
  assert.equal(localeFromCookieHeader(""), "en");
  assert.equal(localeFromCookieHeader("locale=pl"), "pl");
  assert.equal(localeFromCookieHeader("foo=1; locale=en"), "en");
  assert.equal(localeFromCookieHeader("locale=de"), "en");
  assert.equal(localeFromCookieHeader("locale=please"), "en");
});
