#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { Command } from "commander";

import { resolveConfig } from "./config.js";
import { complete } from "./llm.js";
import { buildPrompt } from "./prompt.js";

export function stagedDiff(cwd?: string): string {
  try {
    return execFileSync("git", ["diff", "--cached"], {
      encoding: "utf8",
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    // 不接住的话，git 会退回 --no-index 模式并把上百行 usage 打出来，
    // 外面再叠一层 Node 的未捕获异常 —— 对一个普通的使用失误来说太吵了
    throw new Error("当前目录不是 git 仓库（或未安装 git），请在仓库里运行。");
  }
}

export async function run(argv: string[]): Promise<number> {
  const program = new Command();
  program
    .name("cc-commit")
    .description("用 LLM 根据已暂存的改动生成提交信息")
    .option("--apply", "生成后直接执行 git commit")
    .option("--model <name>", "覆盖模型名");
  program.parse(argv, { from: "user" });
  const opts = program.opts<{ apply?: boolean; model?: string }>();

  const config = resolveConfig();
  try {
    const diff = stagedDiff();
    if (!diff.trim()) {
      console.error("没有已暂存的改动（先 git add）。");
      return 1;
    }

    const message = await complete({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: opts.model ?? config.model,
      prompt: buildPrompt(diff),
    });
    console.log(message);
    if (opts.apply) {
      execFileSync("git", ["commit", "-m", message], { stdio: "inherit" });
    }
    return 0;
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    return 1;
  }
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  run(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
