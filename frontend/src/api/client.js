const API = '/api';

export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export function toAuthUser(payload) {
  return {
    token: payload.token,
    user: {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      emailVerified: payload.emailVerified,
    },
  };
}
