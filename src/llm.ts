export interface ChatOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  prompt: string;
  maxTokens?: number;
  fetchImpl?: typeof fetch;
}

interface ContentBlock {
  type: string;
  text?: string;
}

export async function complete(opts: ChatOptions): Promise<string> {
  const { apiKey, baseUrl, model, prompt, maxTokens = 512, fetchImpl = fetch } = opts;

  const url = `${baseUrl.replace(/\/+$/, "")}/v1/messages`;
  let res: Response;
  try {
    res = await fetchImpl(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    // undici 只会给出 "fetch failed"，不带地址也不带原因，对排查毫无帮助
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`请求 ${url} 失败：${reason}`);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`接口返回 ${res.status}：${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as { content?: ContentBlock[] };
  const text = (data.content ?? [])
    .filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error("模型返回了空内容");
  return text;
}
