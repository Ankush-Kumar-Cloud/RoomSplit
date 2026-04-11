import { createPortal } from 'react-dom';
import { PAL, catOf }   from '../../constants';

export function Btn({ c = 'p', sm, xs, full, style: s, children, ...rest }) {
  const cls = ['btn', `btn-${c}`, sm ? 'btn-sm' : '', xs ? 'btn-xs' : '', full ? 'btn-full' : ''].filter(Boolean).join(' ');
  return <button className={cls} style={s} {...rest}>{children}</button>;
}

export function Modal({ title, onClose, children, wide }) {
  const portal = document.getElementById('modal-portal');
  if (!portal) return null;
  return createPortal(
    <div className="modal-overlay" onClick={e => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className={['modal-box', wide ? 'modal-box-wide' : ''].join(' ')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text2)', lineHeight: 1, padding: 4 }}>×</button>
        </div>
        {children}
      </div>
    </div>,
    portal
  );
}

export function Avatar({ name, col, size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: col.av, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

export function Chip({ cat }) {
  const c = catOf(cat);
  return <span className="chip" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}><span style={{ fontSize: 10 }}>{c.icon}</span>{c.label}</span>;
}

export function FieldWrap({ label, children }) {
  return <div className="field">{label && <label>{label}</label>}{children}</div>;
}

export function Input({ label, ...props }) {
  return <div className="field">{label && <label>{label}</label>}<input className="finput" {...props} /></div>;
}

export function Select({ label, options, ...props }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <select className="finput" {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Toggle({ checked, onChange }) {
  return <label className="toggle"><input type="checkbox" checked={checked} onChange={onChange} /><span className="toggle-slider" /></label>;
}

export function ProgressBar({ value, max = 100, color, label, showPct }) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  const barColor = color || (pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warn)' : 'var(--accent)');
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
          {showPct && <span style={{ fontSize: 12, fontWeight: 600, color: barColor }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="prog"><div className="prog-fill" style={{ width: `${pct}%`, background: barColor }} /></div>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>{title}</p>
      {body   && <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>{body}</p>}
      {action && action}
    </div>
  );
}

export function MonthNav({ offset, setOffset, label }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <button onClick={() => setOffset(o => o - 1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '3px 10px', fontSize: 15, color: 'var(--text)', cursor: 'pointer' }}>‹</button>
      <span style={{ fontSize: 12, color: 'var(--text2)', minWidth: 88, textAlign: 'center' }}>{label}</span>
      <button onClick={() => setOffset(o => Math.min(o + 1, 0))} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '3px 10px', fontSize: 15, color: 'var(--text)', cursor: 'pointer' }}>›</button>
    </div>
  );
}

export function Divider() { return <div className="divider" />; }

export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/** Colour palette helper — returns PAL entry for a member by index in members array */
export const colOf = (members, uid) => {
  const idx = members.findIndex(m => (m._id || m.id) === (uid?._id || uid));
  return PAL[Math.max(idx, 0) % PAL.length];
};
