/**
 * ApiModel.js
 * ─────────────────────────────────────────────────────────
 * Single file that owns ALL HTTP communication with the
 * Express + MongoDB backend.
 *
 * Rules:
 *   • Every method is async and throws on non-2xx.
 *   • JWT token is read from localStorage (one key: "rs_token").
 *   • No React imports — plain JS, fully testable.
 *   • Controllers call ApiModel methods; views never call fetch directly.
 */

const BASE = import.meta.env.VITE_API_URL + '/api';

/* ── Token helpers ── */
const TOKEN_KEY = 'rs_token';

export const saveToken  = (token) => localStorage.setItem(TOKEN_KEY, token);
export const loadToken  = ()       => localStorage.getItem(TOKEN_KEY);
export const clearToken = ()       => localStorage.removeItem(TOKEN_KEY);

/* ── Core fetch wrapper ── */
const request = async (method, path, body) => {
  const token   = loadToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Parse JSON (even for error responses)
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.message || `HTTP ${res.status}`;
    throw Object.assign(new Error(msg), { status: res.status, data });
  }

  return data;
};

const get    = (path)        => request('GET',    path);
const post   = (path, body)  => request('POST',   path, body);
const put    = (path, body)  => request('PUT',    path, body);
const del    = (path)        => request('DELETE', path);

/* ════════════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════════════ */
export const Auth = {
  async signup(name, email, password) {
    const data = await post('/auth/signup', { name, email, password });
    saveToken(data.token);
    return data.user;
  },

  async login(email, password) {
    const data = await post('/auth/login', { email, password });
    saveToken(data.token);
    return data.user;
  },

  logout() {
    clearToken();
  },

  async getMe() {
    const data = await get('/auth/me');
    return data.user;
  },

  async updateProfile(name) {
    const data = await put('/auth/me', { name });
    return data.user;
  },

  isLoggedIn: () => !!loadToken(),
};

/* ════════════════════════════════════════════════════════
   GROUPS
════════════════════════════════════════════════════════ */
export const Groups = {
  getAll:   ()              => get('/groups'),
  getOne:   (id)            => get(`/groups/${id}`),
  create:   (name)          => post('/groups', { name }),
  join:     (inviteCode)    => post('/groups/join', { inviteCode }),
  update:   (id, name)      => put(`/groups/${id}`, { name }),
  leave:    (id)            => del(`/groups/${id}/leave`),
};

/* ════════════════════════════════════════════════════════
   EXPENSES
════════════════════════════════════════════════════════ */
export const Expenses = {
  /**
   * getAll — fetch expenses for a group with optional filters.
   * @param {string} groupId
   * @param {{ date?, month?, category?, search? }} filters
   */
  getAll(groupId, filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    return get(`/groups/${groupId}/expenses${qs ? '?' + qs : ''}`);
  },

  create: (groupId, form)               => post(`/groups/${groupId}/expenses`, form),
  update: (groupId, expenseId, form)    => put(`/groups/${groupId}/expenses/${expenseId}`, form),
  remove: (groupId, expenseId)          => del(`/groups/${groupId}/expenses/${expenseId}`),
};

/* ════════════════════════════════════════════════════════
   BUDGETS
════════════════════════════════════════════════════════ */
export const Budgets = {
  getAll:  (groupId, month)                 => get(`/groups/${groupId}/budgets?month=${month}`),
  upsert:  (groupId, userId, monthKey, amount) =>
    put(`/groups/${groupId}/budgets`, { userId, monthKey, amount }),
};

/* ════════════════════════════════════════════════════════
   SETTLEMENTS
════════════════════════════════════════════════════════ */
export const Settlements = {
  getAll: (groupId, month) =>
    get(`/groups/${groupId}/settlements?month=${month}`),

  toggle: (groupId, monthKey, txnIndex) =>
    post(`/groups/${groupId}/settlements/toggle`, { monthKey, txnIndex }),
};
