import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { run, stagedDiff } from "../src/index.js";

function scratchDir(): string {
  return mkdtempSync(join(tmpdir(), "cc-commit-test-"));
}

describe("stagedDiff", () => {
  it("非 git 目录下给出可读错误，而不是 git 的 usage 转储", () => {
    const dir = scratchDir();
    try {
      expect(() => stagedDiff(dir)).toThrow(/git 仓库/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("run", () => {
  it("在非 git 目录里返回 1，而不是抛出未捕获异常", async () => {
    const dir = scratchDir();
    const previous = process.cwd();
    process.chdir(dir);
    try {
      await expect(run([])).resolves.toBe(1);
    } finally {
      process.chdir(previous);
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
