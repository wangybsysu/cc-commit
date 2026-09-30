export const MAX_DIFF_CHARS = 12000;

export function truncateDiff(diff: string, limit: number = MAX_DIFF_CHARS): string {
  if (diff.length <= limit) return diff;
  return `${diff.slice(0, limit)}\n... [diff 已截断，共 ${diff.length} 字符]`;
}

export function buildPrompt(diff: string): string {
  return [
    "根据下面的 git diff 写一条提交信息。",
    "要求：首行为 conventional commits 风格（feat/fix/docs/refactor/chore/test），不超过 72 字符；",
    "如有必要，空一行后写正文，说明改了什么、为什么改。",
    "只输出提交信息本身，不要任何解释或代码块围栏。",
    "",
    "```diff",
    truncateDiff(diff),
    "```",
  ].join("\n");
}
