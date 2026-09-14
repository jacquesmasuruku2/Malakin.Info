export function getClientAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  const token = window.localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const authHeaders = getClientAuthHeaders();
  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return fetch(input, {
    ...init,
    credentials: 'include',
    headers,
  });
}
