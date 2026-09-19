import assert from "node:assert/strict";
import test from "node:test";
import { safeContentPath, safeMediaPath, validateAssetPath, validateMediaBytes, validateSlug, validateUrl } from "../lib/cms/validation";

test("accepts safe slugs and rejects traversal", () => {
  assert.equal(validateSlug("contract-scanner-2").ok, true);
  assert.equal(validateSlug("../secrets").ok, false);
  assert.equal(validateSlug("Hello World").ok, false);
  assert.equal(safeContentPath("projects", "contract-scanner-2"), "content/projects/contract-scanner-2.mdx");
  assert.throws(() => safeContentPath("projects", "../secrets"));
});

test("allows only safe content URLs", () => {
  assert.equal(validateUrl("https://example.com").ok, true);
  assert.equal(validateUrl("/contact").ok, true);
  assert.equal(validateUrl("javascript:alert(1)").ok, false);
  assert.equal(validateUrl("data:text/html,hello").ok, false);
  assert.equal(validateUrl("//evil.example").ok, false);
});

test("restricts local media paths", () => {
  assert.equal(validateAssetPath("/images/projects/cover.jpg").ok, true);
  assert.equal(validateAssetPath("https://example.com/cover.jpg").ok, false);
  assert.equal(validateAssetPath("/images/../secret").ok, false);
  assert.equal(safeMediaPath("My Portrait.webp"), "public/images/cms/my-portrait.webp");
  assert.throws(() => safeMediaPath("../../secret.txt"));
});

test("validates image signatures and dangerous SVG", () => {
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1]);
  assert.equal(validateMediaBytes(png, "image/png").ok, true);
  assert.equal(validateMediaBytes(Buffer.from('<svg viewBox="0 0 10 10"><script>alert(1)</script></svg>'), "image/svg+xml").ok, false);
  assert.equal(validateMediaBytes(Buffer.from("not an image"), "image/png").ok, false);
});
