/**
 * useAppState
 * ─────────────────────────────────────────────────────────
 * Central React hook that owns the entire application state.
 * All state reads go through here; all writes go through
 * the `patch` function, which updates React state AND
 * persists to StorageModel in one call.
 *
 * State shape:
 *   users    — { [id]: User }
 *   groups   — { [id]: Group }
 *   expenses — { [id]: Expense }
 *   paid     — { [settlementKey]: boolean }
 *   budgets  — { [gid-uid-monthKey]: number }
 *   session  — userId | null
 *   theme    — 'light' | 'dark'
 */

import { useState, useEffect, useCallback } from 'react';
import StorageModel from '../model/StorageModel';

const KEYS = ['users', 'groups', 'expenses', 'paid', 'budgets', 'session', 'theme'];

const INITIAL_STATE = {
  users:    {},
  groups:   {},
  expenses: {},
  paid:     {},
  budgets:  {},
  session:  null,
  theme:    'light',
};

export default function useAppState() {
  const [loaded, setLoaded] = useState(false);
  const [state, _setState]  = useState(INITIAL_STATE);

  // Load persisted state on mount
  useEffect(() => {
    const persisted = StorageModel.getMany(KEYS);
    _setState(prev => {
      const merged = { ...prev };
      KEYS.forEach(k => { if (persisted[k] != null) merged[k] = persisted[k]; });
      return merged;
    });
    setLoaded(true);
  }, []);

  /**
   * patch(slice)
   * Merge a partial state slice, re-render, and persist each
   * changed key to StorageModel.
   */
  const patch = useCallback((slice) => {
    _setState(prev => {
      const next = { ...prev, ...slice };
      StorageModel.setMany(slice);
      return next;
    });
  }, []);

  return { loaded, state, patch };
}
