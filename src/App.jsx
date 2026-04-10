/**
 * App.jsx — Root Component
 * ─────────────────────────────────────────────────────────
 * Wires the three MVC layers together:
 *   Model      → useAppState (via StorageModel + DomainModel)
 *   Controllers→ makeAuthController, makeGroupController, etc.
 *   Views      → AuthView, HomeView, DashboardView
 *
 * This file owns:
 *   • Application-level routing (view state)
 *   • Theme synchronisation to <html data-theme>
 *   • Controller instantiation (useMemo — stable refs)
 *   • Derived data: members list, allExps for active group
 */

import { useState, useEffect, useMemo } from 'react';

// Model
import useAppState        from './controllers/useAppState';

// Controllers
import makeAuthController       from './controllers/AuthController';
import makeGroupController      from './controllers/GroupController';
import makeExpenseController    from './controllers/ExpenseController';
import { makeBudgetController, makeSettlementController } from './controllers/BudgetAndSettlementController';

// Views
import AuthView      from './views/AuthView';
import HomeView      from './views/HomeView';
import DashboardView from './views/DashboardView';

export default function App() {
  const { loaded, state, patch } = useAppState();

  // view: 'auth' | 'home' | 'dashboard'
  const [view,   setView]   = useState('auth');
  const [activeGid, setActiveGid] = useState(null);

  /* ── Theme: keep <html data-theme> in sync ── */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme || 'light');
  }, [state.theme]);

  const toggleTheme = () =>
    patch({ theme: state.theme === 'dark' ? 'light' : 'dark' });

  /* ── Derive current user from session ── */
  const me = state.session ? state.users[state.session] : null;

  /* ── Redirect to correct view once storage has loaded ── */
  useEffect(() => {
    if (loaded) setView(me ? 'home' : 'auth');
  }, [loaded, me]);

  /* ── Instantiate controllers (stable across renders) ── */
  const authCtrl    = useMemo(() => makeAuthController(state, patch),    [state, patch]);
  const groupCtrl   = useMemo(() => me ? makeGroupController(state, patch, me.id) : null,  [state, patch, me]);
  const expCtrl     = useMemo(() => me && activeGid ? makeExpenseController(state, patch, me.id, activeGid) : null, [state, patch, me, activeGid]);
  const budgetCtrl  = useMemo(() => makeBudgetController(state, patch),  [state, patch]);
  const settleCtrl  = useMemo(() => makeSettlementController(state, patch), [state, patch]);

  /* ── Derived: members + expenses for the active group ── */
  const members = useMemo(() => {
    if (!activeGid) return [];
    return (state.groups[activeGid]?.members || [])
      .map(id => state.users[id])
      .filter(Boolean);
  }, [state, activeGid]);

  const allExps = useMemo(() => {
    if (!activeGid) return [];
    return Object.values(state.expenses)
      .filter(e => e.groupId === activeGid)
      .sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [state.expenses, activeGid]);

  /* ── Navigation helpers ── */
  const openGroup = (gid) => { setActiveGid(gid); setView('dashboard'); };
  const goHome    = ()    => setView('home');

  /* ── Loading splash ── */
  if (!loaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, background: 'var(--accent)', borderRadius: 16, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>₹</div>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Loading RoomSplit…</p>
        </div>
      </div>
    );
  }

  /* ── Auth screen ── */
  if (view === 'auth' || !me) {
    return (
      <AuthView
        auth={authCtrl}
        theme={state.theme || 'light'}
        onToggleTheme={toggleTheme}
      />
    );
  }

  /* ── Home screen ── */
  if (view === 'home') {
    return (
      <HomeView
        user={me}
        groupCtrl={groupCtrl}
        auth={authCtrl}
        theme={state.theme || 'light'}
        onToggleTheme={toggleTheme}
        onOpenGroup={openGroup}
      />
    );
  }

  /* ── Dashboard ── */
  if (view === 'dashboard' && activeGid && state.groups[activeGid]) {
    return (
      <DashboardView
        group={state.groups[activeGid]}
        members={members}
        me={me}
        expCtrl={expCtrl}
        settleCtrl={settleCtrl}
        groupCtrl={groupCtrl}
        budgetCtrl={budgetCtrl}
        allExps={allExps}
        onBack={goHome}
        theme={state.theme || 'light'}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return null;
}
