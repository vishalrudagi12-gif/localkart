const API = '/api';

function storedToken() {
  try {
    const saved = JSON.parse(localStorage.getItem('lb_auth'));
    return saved?.token || null;
  } catch {
    return null;
  }
}

export async function api(path, { method = 'GET', body, token, formData } = {}) {
  const headers = {};
  const auth = token || storedToken();
  if (auth) {
    headers.Authorization = `Bearer ${auth}`;
  }
  let payload;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: payload,
  });
  if (res.status === 204) {
    return null;
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
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
