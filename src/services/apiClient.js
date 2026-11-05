/**
 * APPLEN SOLUTIONS - Central REST API Client
 * Seamlessly interfaces with JSON Server (when running) and handles network failures gracefully.
 */

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof window !== 'undefined' ? '' : 'http://localhost:3001');

const REQUEST_TIMEOUT_MS = 2000;

export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers
      },
      signal: controller.signal
    };

    if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const res = await fetch(url, options);
    clearTimeout(timeoutId);

    if (res.status === 404) {
      const error = new Error(`Resource at ${endpoint} was not found (404)`);
      error.status = 404;
      throw error;
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      const error = new Error(`API error ${res.status}: ${errorText || res.statusText}`);
      error.status = res.status;
      throw error;
    }

    if (res.status === 204) {
      return null;
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch (err) {
    clearTimeout(timeoutId);

    // If it's a known HTTP 404 or other server status error, rethrow so callers can handle it
    if (err.status) {
      throw err;
    }

    // Network disconnection, JSON Server stopped, timeout, or CORS error
    const isNetworkError =
      err.name === 'AbortError' ||
      err.name === 'TypeError' ||
      err.message?.includes('fetch') ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError');

    const networkErr = new Error(
      isNetworkError
        ? `Network unreachable: JSON Server is not responding at ${API_BASE_URL}`
        : err.message
    );
    networkErr.isNetworkError = true;
    networkErr.originalError = err;
    throw networkErr;
  }
}
