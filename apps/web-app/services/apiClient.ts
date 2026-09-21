import { ApiError } from "@/types/booking";

export type AuthTokenProvider = () => string | null | undefined;

export interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, options?: RequestOptions): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

/**
 * Single place to inject an auth token header and to map HTTP status codes to
 * ApiError codes (409 → SLOT_CONFLICT with conflicts from the body, 410 →
 * HOLD_EXPIRED, 401 → UNAUTHORIZED, network failure → NETWORK).
 */
export function createApiClient(baseUrl: string, getToken?: AuthTokenProvider): ApiClient {
  const request = async <T>(
    method: "GET" | "POST" | "DELETE",
    path: string,
    options?: RequestOptions
  ): Promise<T> => {
    let token: string | null | undefined;
    try {
      token = getToken?.();
    } catch {
      token = undefined;
    }
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...options?.headers,
    };
    if (options?.body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    let res: Response;
    try {
      res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
    } catch {
      throw ApiError.network();
    }

    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      // Non-JSON body (e.g. proxies/HTML error pages) → treat as unknown error.
    }

    if (!res.ok) throw ApiError.fromPayload(res.status, payload);
    return payload as T;
  };

  return {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, options?: RequestOptions) => request<T>("POST", path, options),
    delete: <T>(path: string) => request<T>("DELETE", path),
  };
}