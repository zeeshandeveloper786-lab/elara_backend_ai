"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpClient = void 0;
exports.httpGet = httpGet;
exports.httpPost = httpPost;
const axios_1 = __importDefault(require("axios"));
const DEFAULT_TIMEOUT_MS = 30_000;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function shouldRetry(error) {
    const status = error?.response?.status;
    if (typeof status === 'number')
        return RETRYABLE_STATUS.has(status);
    return (Boolean(error?.code) ||
        Boolean(error?.message?.toLowerCase?.().includes('timeout')));
}
async function requestWithRetry(client, config, retries = 2) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await client.request(config);
        }
        catch (err) {
            lastErr = err;
            if (attempt === retries || !shouldRetry(err))
                break;
            const backoff = 400 * Math.pow(2, attempt);
            await sleep(backoff);
        }
    }
    throw lastErr;
}
exports.httpClient = axios_1.default.create({
    timeout: DEFAULT_TIMEOUT_MS,
    maxRedirects: 3,
    headers: {
        'User-Agent': 'Elara-Orchestration/1.0',
    },
});
async function httpGet(url, config = {}, retries = 1) {
    return requestWithRetry(exports.httpClient, { ...config, method: 'GET', url }, retries);
}
async function httpPost(url, data, config = {}, retries = 1) {
    return requestWithRetry(exports.httpClient, { ...config, method: 'POST', url, data }, retries);
}
//# sourceMappingURL=http-client.js.map