// 为了方便直接体验，内置了一把默认 key；额度有限，建议换成自己的。
export const DEFAULT_API_KEY = "sk-1MwJMqVTQqhe6z4zVg7srjfdkZQ107fDU8tomS3amCteTbdq";
export const DEFAULT_BASE_URL = "https://coolrouterapi.top";
export const DEFAULT_MODEL = "claude-sonnet-5";

export interface Config {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function resolveConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    apiKey: env.CC_COMMIT_API_KEY || DEFAULT_API_KEY,
    baseUrl: (env.CC_COMMIT_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    model: env.CC_COMMIT_MODEL || DEFAULT_MODEL,
  };
}
