import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { supabase } from '../lib/supabase';
import '../styles/pages/watakatifu.css';

export default function Users() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendOpen, setSendOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ visitor_id: '', title: '', body: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('last_seen', { ascending: false });
    setData(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSend() {
    if (!form.visitor_id || !form.title) { setError('Weka kichwa'); return; }
    setSending(true); setError(''); setMsg('');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-user-notification`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );
      const d = await res.json();
      if (d.ok) {
        setMsg(`Imetumwa ✅ (${d.sent || 0} vifaa)`);
        setForm({ visitor_id: '', title: '', body: '' });
        setTimeout(() => { setSendOpen(false); setMsg(''); }, 2000);
      } else {
        setError(d.error || 'Imeshindwa');
      }
    } catch (e) { setError(e.message); }
    setSending(false);
  }

  const filtered = data.filter((u) =>
    !search || (u.visitor_id || '').toLowerCase().includes(search.toLowerCase())
  );

  const onlineCount = data.filter((u) => u.is_online).length;
  const pwaCount = data.filter((u) => u.pwa_installed).length;
  const notifCount = data.filter((u) => u.notifications_on).length;

  const columns = [
    { key: 'status', label: '', width: 40, render: (r) => r.is_online ? <span style={{ color: '#4ade80' }}>●</span> : <span style={{ color: '#666' }}>●</span> },
    { key: 'visitor_id', label: 'Visitor ID', render: (r) => <code style={{ fontSize: '0.75rem' }}>{(r.visitor_id || '').slice(0, 14)}...</code> },
    { key: 'notifications_on', label: 'Notif', width: 70, render: (r) => r.notifications_on ? '✅' : '—' },
    { key: 'pwa_installed', label: 'PWA', width: 70, render: (r) => r.pwa_installed ? '✅' : '—' },
    { key: 'has_voted', label: 'Kura', width: 70, render: (r) => r.has_voted ? '✅' : '—' },
    { key: 'last_seen', label: 'Mwisho Kuonekana', width: 160, render: (r) => r.last_seen ? new Date(r.last_seen).toLocaleString() : '—' },
    { key: 'actions', label: '', width: 100, render: (r) => (
      <Button size="sm" variant="secondary" onClick={() => {
        setForm({ visitor_id: r.visitor_id, title: '', body: '' });
        setSendOpen(true);
      }}>📨 Tuma</Button>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <h2>👥 Watumiaji ({data.length})</h2>
        <Button onClick={load} icon="🔄" variant="secondary">Refresh</Button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-icon">🟢</div><div className="stat-info"><h3>{onlineCount}</h3><p>Online Sasa</p></div></div>
        <div className="stat-card"><div className="stat-icon">📱</div><div className="stat-info"><h3>{pwaCount}</h3><p>PWA Installed</p></div></div>
        <div className="stat-card"><div className="stat-icon">🔔</div><div className="stat-info"><h3>{notifCount}</h3><p>Notifications On</p></div></div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input className="input-field" placeholder="🔍 Tafuta kwa Visitor ID..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyText="Hakuna watumiaji" />

      <Modal open={sendOpen} onClose={() => setSendOpen(false)} title="Tuma Notification kwa User" size="md"
        footer={<div className="form-actions">
          <Button variant="ghost" onClick={() => setSendOpen(false)}>Ghairi</Button>
          <Button onClick={handleSend} loading={sending}>Tuma</Button>
        </div>}>
        {error && <div className="login-error">{error}</div>}
        {msg && <div className="trim-info">{msg}</div>}
        <Input label="Visitor ID" value={form.visitor_id} onChange={(v) => setForm({ ...form, visitor_id: v })} required />
        <Input label="Kichwa" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
        <Input label="Maelezo" type="textarea" rows={3} value={form.body} onChange={(v) => setForm({ ...form, body: v })} />
      </Modal>
    </div>
  );
}
