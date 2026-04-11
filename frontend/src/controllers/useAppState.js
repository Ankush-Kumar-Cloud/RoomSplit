/**
 * useAppState.js
 * ─────────────────────────────────────────────────────────
 * Central React hook — single source of truth for the app.
 * On mount: if a JWT token exists in localStorage, fetch the
 * current user from /api/auth/me so the session is restored.
 *
 * State shape:
 *   user       — User object | null
 *   groups     — Group[]
 *   expenses   — { [groupId]: Expense[] }
 *   budgets    — { [groupId]: Budget[] }
 *   settlements— { [groupId-monthKey]: Settlement[] }
 *   theme      — 'light' | 'dark'
 *   loading    — boolean (initial auth check)
 */

import { useState, useEffect, useCallback } from 'react';
import { Auth } from '../model/ApiModel';

const THEME_KEY = 'rs_theme';

const INITIAL = {
  user:        null,
  groups:      [],
  expenses:    {},   // keyed by groupId
  budgets:     {},   // keyed by groupId
  settlements: {},   // keyed by `${groupId}-${monthKey}`
  theme:       localStorage.getItem(THEME_KEY) || 'light',
  loading:     true,
};

export default function useAppState() {
  const [state, setState] = useState(INITIAL);

  /* ── Shallow-merge helper ── */
  const patch = useCallback((slice) => {
    setState(prev => ({ ...prev, ...slice }));
  }, []);

  /* ── Theme persistence ── */
  const setTheme = useCallback((theme) => {
    localStorage.setItem(THEME_KEY, theme);
    patch({ theme });
  }, [patch]);

  /* ── Restore session on mount ── */
  useEffect(() => {
    (async () => {
      if (!Auth.isLoggedIn()) {
        patch({ loading: false });
        return;
      }
      try {
        const user = await Auth.getMe();
        patch({ user, loading: false });
      } catch {
        // Token expired or invalid — clear it
        Auth.logout();
        patch({ loading: false });
      }
    })();
  }, []);

  return { state, patch, setTheme };
}
