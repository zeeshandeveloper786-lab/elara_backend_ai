import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const DEFAULT_TIMEOUT_MS = 30_000;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function shouldRetry(error: any) {
  const status = error?.response?.status;
  if (typeof status === 'number') return RETRYABLE_STATUS.has(status);
  // Network / timeout / DNS
  return (
    Boolean(error?.code) ||
    Boolean(error?.message?.toLowerCase?.().includes('timeout'))
  );
}

async function requestWithRetry<T = any>(
  client: AxiosInstance,
  config: AxiosRequestConfig,
  retries = 2,
) {
  let lastErr: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await client.request<T>(config);
    } catch (err: any) {
      lastErr = err;
      if (attempt === retries || !shouldRetry(err)) break;
      const backoff = 400 * Math.pow(2, attempt);
      await sleep(backoff);
    }
  }
  throw lastErr;
}

export const httpClient = axios.create({
  timeout: DEFAULT_TIMEOUT_MS,
  maxRedirects: 3,
  headers: {
    'User-Agent': 'Elara-Orchestration/1.0',
  },
});

export async function httpGet<T = any>(
  url: string,
  config: AxiosRequestConfig = {},
  retries = 1,
): Promise<AxiosResponse<T>> {
  return requestWithRetry<T>(
    httpClient,
    { ...config, method: 'GET', url },
    retries,
  );
}

export async function httpPost<T = any>(
  url: string,
  data: any,
  config: AxiosRequestConfig = {},
  retries = 1,
): Promise<AxiosResponse<T>> {
  return requestWithRetry<T>(
    httpClient,
    { ...config, method: 'POST', url, data },
    retries,
  );
}
