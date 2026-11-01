// src/core/services/portalApi.ts
// Every call from the portal to the API goes through here. It holds the 15-minute pass (token) in memory only,
// never in browser storage, and sends it with each admin call. When the pass runs out (401), it asks the server for a
// fresh one once (the long session lives in an HttpOnly cookie the page cannot read) and repeats the call.
// If that fails too, the person is signed out and sees the sign-in screen.

// Live: the API's own address. Development (npm run dev): the page's own address, which vite.config.ts forwards.
export const API_BASE = import.meta.env.DEV ? '' : 'https://api.thrifts.co.ke';

let token: string | null = null;
let refreshing: Promise<boolean> | null = null;
let onSignedOut: (() => void) | null = null;

export class ApiError extends Error {
  status: number;
  details: string[];
  constructor(status: number, message: string, details: string[] = []) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function setToken(value: string | null) {
  token = value;
}

export function hasToken(): boolean {
  return !!token;
}

// The session hook registers what happens when the session cannot be renewed
export function whenSignedOut(handler: () => void) {
  onSignedOut = handler;
}

// The server answers errors as { error } or { errors: [...] }: turn either into one readable message
async function readError(res: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  const b = (body && typeof body === 'object' ? body : {}) as { error?: unknown; errors?: unknown };
  const details = Array.isArray(b.errors) ? b.errors.map(String) : [];
  const message = typeof b.error === 'string' ? b.error : details[0] ?? `Something went wrong (${res.status}).`;
  return new ApiError(res.status, message, details);
}

// Calls a /admin-session route (sign-in, refresh, sign-out). These carry the cookie, never the token.
export async function sessionCall<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
  } catch {
    throw new ApiError(0, 'No connection to the server. Check your internet and try again.');
  }
  if (!res.ok) throw await readError(res);
  return (await res.json()) as T;
}

// A fresh pass from the cookie session. Several calls failing at once share one refresh.
export function refreshToken(): Promise<boolean> {
  if (!refreshing) {
    refreshing = sessionCall<{ token: string }>('/admin-session/refresh')
      .then((r) => {
        token = r.token;
        return true;
      })
      .catch(() => {
        token = null;
        return false;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Calls an /admin route with the pass. Retries once after a refresh when the pass has run out.
export async function adminCall<T>(method: Method, path: string, body?: unknown, retried = false): Promise<T> {
  if (!token && !retried) {
    if (!(await refreshToken())) {
      onSignedOut?.();
      throw new ApiError(401, 'Your session has ended. Sign in again.');
    }
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No connection to the server. Check your internet and try again.');
  }
  if (res.status === 401 && !retried) {
    if (await refreshToken()) return adminCall<T>(method, path, body, true);
    onSignedOut?.();
    throw new ApiError(401, 'Your session has ended. Sign in again.');
  }
  if (!res.ok) throw await readError(res);
  return (await res.json()) as T;
}
