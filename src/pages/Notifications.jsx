import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { supabase } from '../lib/supabase';
import '../styles/pages/watakatifu.css';

const typeLabels = {
  new_user: 'User Mpya',
  new_content: 'Post Mpya',
  new_daily_card: 'Daily Card',
  daily_card_missing: 'Daily Card Inakosekana',
  reminder: 'Reminder',
  live_start: 'Live',
  general: 'Ujumbe',
};

const typeColors = {
  new_user: '#4ade80',
  new_content: '#9333ea',
  new_daily_card: '#60a5fa',
  daily_card_missing: '#f59e0b',
  reminder: '#fbbf24',
  live_start: '#ef4444',
  general: '#a0a0b0',
};

export default function Notifications() {
  const [tab, setTab] = useState('activity');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [sendOpen, setSendOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ visitor_id: '', title: '', body: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function loadActivities() {
    const { data } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setActivities(data || []);
  }

  async function loadUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('last_seen', { ascending: false })
      .limit(100);
    setUsers(data || []);
  }

  async function load() {
    setLoading(true);
    await Promise.all([loadActivities(), loadUsers()]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const unreadCount = activities.filter((a) => !a.read).length;

  useEffect(() => {
    if ('setAppBadge' in navigator) {
      if (unreadCount > 0) navigator.setAppBadge(unreadCount).catch(() => {});
      else navigator.clearAppBadge().catch(() => {});
    }
  }, [unreadCount]);

  async function markRead(id) {
    await supabase.from('admin_notifications').update({ read: true }).eq('id', id);
    await loadActivities();
  }

  async function markAllRead() {
    await supabase.from('admin_notifications').update({ read: true }).eq('read', false);
    await loadActivities();
  }

  async function deleteActivity(id) {
    if (!confirm('Futa notification?')) return;
    await supabase.from('admin_notifications').delete().eq('id', id);
    await loadActivities();
  }

  async function handleSend() {
    if (!form.visitor_id || !form.title) {
      setError('Chagua user na weka kichwa');
      return;
    }
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
      const data = await res.json();
      if (data.ok) {
        setMsg(`Imetumwa (${data.sent || 0} vifaa)`);
        setForm({ visitor_id: '', title: '', body: '' });
        setTimeout(() => { setSendOpen(false); setMsg(''); }, 2000);
      } else {
        setError(data.error || 'Imeshindwa');
      }
    } catch (e) {
      setError(e.message);
    }
    setSending(false);
  }

  const activityColumns = [
    {
      key: 'read', label: '', width: 40,
      render: (r) => r.read ? '✅' : <span style={{ color: '#fbbf24' }}>●</span>,
    },
    {
      key: 'type', label: 'Aina', width: 160,
      render: (r) => (
        <span style={{
          fontSize: '0.7rem',
          padding: '2px 8px',
          borderRadius: 999,
          background: `${typeColors[r.type] || '#666'}22`,
          color: typeColors[r.type] || '#a0a0b0',
          whiteSpace: 'nowrap',
        }}>
          {typeLabels[r.type] || r.type || 'Ujumbe'}
        </span>
      ),
    },
    { key: 'title', label: 'Kichwa' },
    { key: 'body', label: 'Maelezo', render: (r) => (r.body || '').slice(0, 50) },
    {
      key: 'created_at', label: 'Muda', width: 160,
      render: (r) => new Date(r.created_at).toLocaleString(),
    },
    {
      key: 'actions', label: 'Vitendo', width: 130,
      render: (r) => (
        <div className="row-actions">
          {!r.read && <Button size="sm" variant="ghost" onClick={() => markRead(r.id)}>👁️</Button>}
          <Button size="sm" variant="danger" onClick={() => deleteActivity(r.id)}>🗑️</Button>
        </div>
      ),
    },
  ];

  const userColumns = [
    {
      key: 'status', label: '', width: 40,
      render: (r) => r.is_online
        ? <span style={{ color: '#4ade80' }}>●</span>
        : <span style={{ color: '#666' }}>●</span>,
    },
    {
      key: 'visitor_id', label: 'Visitor ID',
      render: (r) => <code style={{ fontSize: '0.75rem' }}>{(r.visitor_id || '').slice(0, 12)}...</code>,
    },
    {
      key: 'notifications_on', label: 'Notif', width: 70,
      render: (r) => r.notifications_on ? '✅' : '—',
    },
    {
      key: 'pwa_installed', label: 'PWA', width: 70,
      render: (r) => r.pwa_installed ? '✅' : '—',
    },
    {
      key: 'last_seen', label: 'Mwisho Kuonekana', width: 160,
      render: (r) => r.last_seen ? new Date(r.last_seen).toLocaleString() : '—',
    },
    {
      key: 'actions', label: '', width: 100,
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => {
          setForm({ visitor_id: r.visitor_id, title: '', body: '' });
          setSendOpen(true);
        }}>📨 Tuma</Button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>🔔 Notifications {unreadCount > 0 && <span className="badge badge-green">{unreadCount}</span>}</h2>
        <div className="page-actions">
          {unreadCount > 0 && (
            <Button variant="ghost" onClick={markAllRead} icon="✅">Soma Zote</Button>
          )}
          <Button onClick={() => setSendOpen(true)} icon="📨">Tuma kwa User</Button>
        </div>
      </div>

      <div className="media-tabs" style={{ marginBottom: 16 }}>
        <button
          className={`media-tab ${tab === 'activity' ? 'active' : ''}`}
          onClick={() => setTab('activity')}
        >
          📊 Activity ({unreadCount})
        </button>
        <button
          className={`media-tab ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          👥 Watumiaji ({users.length})
        </button>
      </div>

      {tab === 'activity' && (
        <Table columns={activityColumns} data={activities} loading={loading} emptyText="Hakuna activity" />
      )}

      {tab === 'users' && (
        <Table columns={userColumns} data={users} loading={loading} emptyText="Hakuna watumiaji" />
      )}

      <Modal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        title="Tuma Notification kwa User"
        size="md"
        footer={
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setSendOpen(false)}>Ghairi</Button>
            <Button onClick={handleSend} loading={sending}>Tuma</Button>
          </div>
        }
      >
        {error && <div className="login-error">{error}</div>}
        {msg && <div className="trim-info">{msg}</div>}

        <Input
          label="Visitor ID"
          value={form.visitor_id}
          onChange={(v) => setForm({ ...form, visitor_id: v })}
          placeholder="Chagua user kutoka tab ya Watumiaji"
          required
        />
        <Input
          label="Kichwa"
          value={form.title}
          onChange={(v) => setForm({ ...form, title: v })}
          required
        />
        <Input
          label="Maelezo"
          type="textarea"
          rows={3}
          value={form.body}
          onChange={(v) => setForm({ ...form, body: v })}
        />
      </Modal>
    </div>
  );
}
