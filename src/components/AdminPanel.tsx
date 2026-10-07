import { useCallback, useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Ban, PhoneOff, Power, Search, ShieldCheck, X } from 'lucide-react';
import { adminAction, type AdminCall, type AdminState } from '@/lib/admin.functions';
import { formatNumber } from '@/lib/phone';
import './phone.css';

const who = (p: { name: string; number: string }) => `${p.name}${p.number ? ' · ' + formatNumber(p.number) : ''}`;

export function AdminPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const call = useServerFn(adminAction);
  const [st, setSt] = useState<AdminState | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [reason, setReason] = useState('');
  const [max, setMax] = useState(60);
  const [now, setNow] = useState(() => Date.now());

  const run = useCallback(async (payload: Record<string, unknown>, silent = false) => {
    if (!silent) setBusy(true);
    try {
      const r = (await call({ data: payload as never })) as AdminState | { isAdmin: false };
      if ('voiceEnabled' in r) { setSt(r); setErr(''); } else setErr('This account is not an admin.');
    } catch (e) {
      if (!silent) setErr(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      if (!silent) setBusy(false);
    }
  }, [call]);
  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    if (!open) return;
    void runRef.current({ action: 'overview' });
    const t = setInterval(() => { setNow(Date.now()); void runRef.current({ action: 'overview' }, true); }, 3000);
    return () => clearInterval(t);
  }, [open]);
  useEffect(() => { if (st) setMax(st.maxMinutes); }, [st?.maxMinutes]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const dur = (c: AdminCall) => {
    if (!c.answered_at) return '—';
    const s = Math.max(0, Math.floor(((c.ended_at ? new Date(c.ended_at).getTime() : now) - new Date(c.answered_at).getTime()) / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  const players = (st?.players ?? []).filter((p) => !q.trim() || `${p.display_name} ${p.handle} ${p.number}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="ph-backdrop ad-panel" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ad-card" role="dialog" aria-label="Admin panel">
        <div className="ad-head"><h2><ShieldCheck size={20} /> Voice control</h2><button aria-label="Close" onClick={onClose}><X size={18} /></button></div>
        {err && <div className="ad-err" role="alert">{err}</div>}
        {!st ? <p className="ad-muted">Loading…</p> : (
          <div className="ad-body">
            <section className="ad-box">
              <div className="ad-row">
                <div><b>Voice calls are {st.voiceEnabled ? 'ON' : 'OFF'}</b><small>{st.voiceEnabled ? 'Players can call each other.' : 'Nobody can place or answer calls.'}</small></div>
                <button className={`ad-btn ${st.voiceEnabled ? 'danger' : 'go'}`} disabled={busy} onClick={() => {
                  if (st.voiceEnabled && !window.confirm('Switch voice calls OFF? This ends every call in progress.')) return;
                  void run({ action: 'set_voice', enabled: !st.voiceEnabled });
                }}><Power size={15} /> Turn {st.voiceEnabled ? 'off' : 'on'}</button>
              </div>
              <div className="ad-row">
                <div><b>Longest call</b><small>Calls end automatically after this many minutes.</small></div>
                <div className="ad-inline"><input type="number" min={1} max={240} value={max} onChange={(e) => setMax(Number(e.target.value))} /><button className="ad-btn" disabled={busy || max < 1 || max > 240 || max === st.maxMinutes} onClick={() => void run({ action: 'set_max', minutes: Math.round(max) })}>Save</button></div>
              </div>
            </section>

            <section className="ad-box">
              <div className="ad-row"><h3>Live calls ({st.live.length})</h3>{st.live.length > 0 && <button className="ad-btn danger" disabled={busy} onClick={() => { if (window.confirm('End every call in progress?')) void run({ action: 'end_all' }); }}>End all</button>}</div>
              {!st.live.length && <p className="ad-muted">No calls right now.</p>}
              {st.live.map((c) => (
                <div className="ad-line" key={c.id}>
                  <div><b>{who(c.caller)}</b><small>→ {who(c.callee)} · {c.status} · {dur(c)}</small></div>
                  <button className="ad-btn danger" aria-label="End call" disabled={busy} onClick={() => void run({ action: 'end_call', call_id: c.id })}><PhoneOff size={14} /> End</button>
                </div>
              ))}
            </section>

            <section className="ad-box">
              <h3>Players</h3>
              <div className="ad-inline wide"><Search size={15} /><input placeholder="Search name, username or number" value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <div className="ad-inline wide"><Ban size={15} /><input placeholder="Reason for blocking (optional)" maxLength={120} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
              {!players.length && <p className="ad-muted">No players found.</p>}
              {players.map((p) => (
                <div className="ad-line" key={p.user_id}>
                  <div><b>{p.display_name} <span className="ad-tag">@{p.handle}</span>{p.blocked && <span className="ad-tag red">voice blocked</span>}</b><small>{formatNumber(p.number)}{p.blocked && p.reason ? ` · ${p.reason}` : ''}</small></div>
                  {p.blocked
                    ? <button className="ad-btn go" disabled={busy} onClick={() => void run({ action: 'unblock', user_id: p.user_id })}>Restore</button>
                    : <button className="ad-btn danger" disabled={busy} onClick={() => void run({ action: 'block', user_id: p.user_id, reason })}><Ban size={14} /> Block</button>}
                </div>
              ))}
            </section>

            <section className="ad-box">
              <h3>Recent calls</h3>
              {!st.recent.length && <p className="ad-muted">No calls yet.</p>}
              {st.recent.map((c) => (
                <div className="ad-line" key={c.id}>
                  <div><b>{who(c.caller)}</b><small>→ {who(c.callee)}</small></div>
                  <small className="ad-right">{c.status}<br />{dur(c)} · {new Date(c.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
              ))}
            </section>
            <p className="ad-muted">Calls go directly between players, so admins can see who called whom and for how long, but cannot listen in.</p>
          </div>
        )}
      </div>
    </div>
  );
}
