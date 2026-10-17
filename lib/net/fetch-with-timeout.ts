/**
 * Global External Fetch Helper (DGS V8.12.7B)
 * - Explicit AbortController timeout covering both headers and body consumption
 * - Limited transient retry (never infinite)
 * - Explicit User-Agent
 * - Structured error & duration tracking
 */

export type FetchWithTimeoutOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  userAgent?: string;
  headers?: Record<string, string>;
  method?: string;
  body?: string;
  redirect?: RequestRedirect;
};

export type FetchWithTimeoutResult = {
  ok: boolean;
  url: string;
  finalUrl?: string;
  httpStatus?: number;
  statusText?: string;
  text: string;
  headers: Record<string, string>;
  durationMs: number;
  attempts: number;
  status: "success" | "timeout" | "http_error" | "network_error";
  errorCode?: string;
  errorMessage?: string;
};

const DEFAULT_USER_AGENT = "DGS-CronMonitor/8.12.7 (+https://www.dgeniussolutions.com)";

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<FetchWithTimeoutResult> {
  const timeoutMs = Math.min(Math.max(options.timeoutMs ?? 12000, 1000), 25000);
  const maxRetries = Math.min(Math.max(options.maxRetries ?? 1, 0), 2);
  const retryDelayMs = options.retryDelayMs ?? 400;
  const userAgent = options.userAgent || DEFAULT_USER_AGENT;
  const startedAt = Date.now();

  let attempts = 0;
  let lastStatus: FetchWithTimeoutResult["status"] = "network_error";
  let lastHttpStatus: number | undefined;
  let lastStatusText: string | undefined;
  let lastErrorCode = "FETCH_FAILED";
  let lastErrorMessage = "External fetch failed";

  while (attempts <= maxRetries) {
    attempts += 1;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort(new Error(`Timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        method: options.method || "GET",
        headers: {
          "User-Agent": userAgent,
          Accept: "application/json, application/rss+xml, application/xml, text/xml, text/html, */*",
          ...(options.headers || {}),
        },
        body: options.body,
        redirect: options.redirect || "follow",
        signal: controller.signal,
      });

      lastHttpStatus = response.status;
      lastStatusText = response.statusText;

      // Read body inside the active AbortController window so a stalled body stream cannot hang
      const text = await response.text();
      clearTimeout(timer);

      const durationMs = Date.now() - startedAt;
      const headersObj: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        headersObj[key.toLowerCase()] = val;
      });

      if (!response.ok) {
        lastStatus = "http_error";
        lastErrorCode = `HTTP_${response.status}`;
        lastErrorMessage = `HTTP ${response.status}: ${response.statusText || "Error"}`;

        // Retry only on 502/503/504/429 if retries remain
        if ([429, 502, 503, 504].includes(response.status) && attempts <= maxRetries) {
          await new Promise((r) => setTimeout(r, retryDelayMs * attempts));
          continue;
        }

        return {
          ok: false,
          url,
          finalUrl: response.url || url,
          httpStatus: response.status,
          statusText: response.statusText,
          text,
          headers: headersObj,
          durationMs,
          attempts,
          status: "http_error",
          errorCode: lastErrorCode,
          errorMessage: lastErrorMessage,
        };
      }

      return {
        ok: true,
        url,
        finalUrl: response.url || url,
        httpStatus: response.status,
        statusText: response.statusText,
        text,
        headers: headersObj,
        durationMs,
        attempts,
        status: "success",
      };
    } catch (err: any) {
      clearTimeout(timer);
      const msg = String(err?.message || err || "Unknown fetch error");
      const name = String(err?.name || "");
      const isTimeout =
        name === "AbortError" ||
        name === "TimeoutError" ||
        /timeout|aborted/i.test(msg);

      lastStatus = isTimeout ? "timeout" : "network_error";
      lastErrorCode = isTimeout ? "ETIMEDOUT" : String(err?.code || "ENETWORK");
      lastErrorMessage = isTimeout
        ? `Request timed out after ${timeoutMs}ms (${url})`
        : `${msg} (${url})`;

      if (attempts <= maxRetries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * attempts));
        continue;
      }
    }
  }

  return {
    ok: false,
    url,
    httpStatus: lastHttpStatus,
    statusText: lastStatusText,
    text: "",
    headers: {},
    durationMs: Date.now() - startedAt,
    attempts,
    status: lastStatus,
    errorCode: lastErrorCode,
    errorMessage: lastErrorMessage,
  };
}
