import { useState, useEffect, useMemo } from 'react';
import useAppState          from './controllers/useAppState';
import makeAuthController   from './controllers/AuthController';
import makeGroupController  from './controllers/GroupController';
import makeExpenseController from './controllers/ExpenseController';
import { makeBudgetController, makeSettlementController } from './controllers/BudgetAndSettlementController';
import AuthView      from './views/AuthView';
import HomeView      from './views/HomeView';
import DashboardView from './views/DashboardView';
import DomainModel   from './model/DomainModel';

export default function App() {
  const { state, patch, setTheme } = useAppState();
  const [view,      setView]      = useState('auth');
  const [activeGid, setActiveGid] = useState(null);
  const [group,     setGroup]     = useState(null);

  /* Sync theme to <html> */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  /* Route based on auth state */
  useEffect(() => {
    if (!state.loading) setView(state.user ? 'home' : 'auth');
  }, [state.loading, state.user]);

  /* Controllers (stable refs) */
  const authCtrl   = useMemo(() => makeAuthController(patch), [patch]);
  const groupCtrl  = useMemo(() => makeGroupController(state, patch), [state, patch]);
  const expCtrl    = useMemo(() => activeGid ? makeExpenseController(state, patch, activeGid) : null, [state, patch, activeGid]);
  const budgetCtrl = useMemo(() => activeGid ? makeBudgetController(state, patch, activeGid) : null, [state, patch, activeGid]);
  const settleCtrl = useMemo(() => activeGid ? makeSettlementController(state, patch, activeGid) : null, [state, patch, activeGid]);

  const members = group?.members || [];
  const allExps = expCtrl?.forGroup() || [];

  const openGroup = async (gid) => {
    setActiveGid(gid);
    // Find group from state (already loaded by HomeView)
    const g = state.groups.find(x => x._id === gid);
    setGroup(g || null);
    setView('dashboard');
  };

  const toggleTheme = () => setTheme(state.theme === 'dark' ? 'light' : 'dark');

  /* Loading splash */
  if (state.loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, background: 'var(--accent)', borderRadius: 16, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>₹</div>
        <p style={{ color: 'var(--text2)' }}>Loading…</p>
      </div>
    </div>
  );

  if (view === 'auth' || !state.user)
    return <AuthView authCtrl={authCtrl} theme={state.theme} onToggleTheme={toggleTheme} />;

  if (view === 'home')
    return <HomeView user={state.user} groupCtrl={groupCtrl} authCtrl={authCtrl} theme={state.theme} onToggleTheme={toggleTheme} onOpenGroup={openGroup} />;

  if (view === 'dashboard' && group && expCtrl)
    return <DashboardView group={group} members={members} me={state.user} expCtrl={expCtrl} settleCtrl={settleCtrl} groupCtrl={groupCtrl} budgetCtrl={budgetCtrl} allExps={allExps} onBack={() => setView('home')} theme={state.theme} onToggleTheme={toggleTheme} />;

  return null;
}
