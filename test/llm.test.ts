import { describe, expect, it, vi } from "vitest";
import { complete } from "../src/llm.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const base = {
  apiKey: "sk-test",
  baseUrl: "https://relay.example",
  model: "claude-sonnet-5",
  prompt: "hi",
};

describe("complete", () => {
  it("拼接 text 块并去除首尾空白", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ content: [{ type: "text", text: "  feat: x  " }] }),
    );
    await expect(complete({ ...base, fetchImpl })).resolves.toBe("feat: x");
  });

  it("请求打到 /v1/messages 并带 x-api-key", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ content: [{ type: "text", text: "ok" }] }));
    await complete({ ...base, fetchImpl });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://relay.example/v1/messages");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("sk-test");
  });

  it("baseUrl 带尾斜杠时不产生双斜杠", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ content: [{ type: "text", text: "ok" }] }));
    await complete({ ...base, baseUrl: "https://relay.example/", fetchImpl });
    const [url] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://relay.example/v1/messages");
  });

  it("baseUrl 带路径前缀时保留路径", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ content: [{ type: "text", text: "ok" }] }));
    await complete({ ...base, baseUrl: "https://relay.example/api", fetchImpl });
    const [url] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://relay.example/api/v1/messages");
  });

  it("非 2xx 抛出含状态码的错误", async () => {
    const fetchImpl = vi.fn(async () => new Response("bad key", { status: 401 }));
    await expect(complete({ ...base, fetchImpl })).rejects.toThrow(/401/);
  });

  it("content 为空时抛错", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ content: [] }));
    await expect(complete({ ...base, fetchImpl })).rejects.toThrow(/空内容/);
  });
});
