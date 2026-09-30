import { describe, expect, it } from "vitest";
import { MAX_DIFF_CHARS, buildPrompt, truncateDiff } from "../src/prompt.js";

describe("truncateDiff", () => {
  it("未超限时原样返回", () => {
    expect(truncateDiff("a\nb")).toBe("a\nb");
  });

  it("刚好等于上限时不截断", () => {
    const diff = "y".repeat(MAX_DIFF_CHARS);
    expect(truncateDiff(diff)).toBe(diff);
  });

  it("超限时截断并标注原始长度", () => {
    const diff = "x".repeat(MAX_DIFF_CHARS + 50);
    const out = truncateDiff(diff);
    expect(out.startsWith("x".repeat(MAX_DIFF_CHARS))).toBe(true);
    expect(out).toContain(`共 ${diff.length} 字符`);
    expect(out.length).toBeLessThan(diff.length);
  });
});

describe("buildPrompt", () => {
  it("包含 diff 内容与 conventional commit 要求", () => {
    const prompt = buildPrompt("diff --git a/x b/x");
    expect(prompt).toContain("diff --git a/x b/x");
    expect(prompt).toContain("conventional");
  });
});
