import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Table from '../components/Table';
import Loader from '../components/Loader';
import { supabase } from '../lib/supabase';
import '../styles/pages/watakatifu.css';

const TABS = [
  { key: 'comments', label: '💬 Comments', icon: '💬' },
  { key: 'shares', label: '📤 Shares', icon: '📤' },
  { key: 'visits', label: '👥 Visits', icon: '👥' },
  { key: 'live_viewers', label: '🔴 Live Viewers', icon: '🔴' },
  { key: 'polls', label: '📊 Poll Results', icon: '📊' },
];

export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState('comments');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      let query;
      switch (activeTab) {
        case 'comments':
          query = supabase.from('comments').select('*').order('created_at', { ascending: false });
          break;
        case 'shares':
          query = supabase.from('shares').select('*').order('created_at', { ascending: false });
          break;
        case 'visits':
          query = supabase.from('visits').select('*').order('created_at', { ascending: false });
          break;
        case 'live_viewers':
          query = supabase.from('live_viewers').select('*').order('last_seen', { ascending: false });
          break;
        case 'polls':
          query = supabase.from('poll_votes').select('*').order('created_at', { ascending: false });
          break;
        default:
          setData([]);
      }
      const { data: fresh } = await query;
      setData(fresh || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function handleDelete(id) {
    if (!confirm('Futa rekodi hii?')) return;
    try {
      await supabase.from(activeTab).delete().eq('id', id);
      await loadData();
    } catch (e) { alert(e.message); }
  }

  function getColumns() {
    switch (activeTab) {
      case 'comments':
        return [
          { key: 'jina', label: 'Jina' },
          { key: 'maoni', label: 'Maoni' },
          { key: 'created_at', label: 'Muda', width: 150, render: (r) => new Date(r.created_at).toLocaleString() },
          { key: 'actions', label: '', width: 80, render: (r) => <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>🗑️</Button> },
        ];
      case 'shares':
        return [
          { key: 'content_table', label: 'Aina' },
          { key: 'visitor_id', label: 'Visitor', width: 120, render: (r) => (r.visitor_id || '').slice(0, 8) + '...' },
          { key: 'platform', label: 'Jukwaa' },
          { key: 'created_at', label: 'Muda', width: 150, render: (r) => new Date(r.created_at).toLocaleString() },
          { key: 'actions', label: '', width: 80, render: (r) => <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>🗑️</Button> },
        ];
      case 'visits':
        return [
          { key: 'visitor_id', label: 'Visitor', width: 120, render: (r) => (r.visitor_id || '').slice(0, 8) + '...' },
          { key: 'date', label: 'Tarehe' },
          { key: 'created_at', label: 'Muda', width: 150, render: (r) => new Date(r.created_at).toLocaleString() },
          { key: 'actions', label: '', width: 80, render: (r) => <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>🗑️</Button> },
        ];
      case 'live_viewers':
        return [
          { key: 'live_id', label: 'Live ID', width: 120, render: (r) => (r.live_id || '').slice(0, 8) + '...' },
          { key: 'visitor_id', label: 'Visitor', width: 120, render: (r) => (r.visitor_id || '').slice(0, 8) + '...' },
          { key: 'last_seen', label: 'Mwisho Kuonekana', width: 150, render: (r) => new Date(r.last_seen).toLocaleString() },
        ];
      case 'polls':
        return [
          { key: 'poll_id', label: 'Poll ID', width: 120, render: (r) => (r.poll_id || '').slice(0, 8) + '...' },
          { key: 'option_index', label: 'Chaguo' },
          { key: 'visitor_id', label: 'Visitor', width: 120, render: (r) => (r.visitor_id || '').slice(0, 8) + '...' },
          { key: 'created_at', label: 'Muda', width: 150, render: (r) => new Date(r.created_at).toLocaleString() },
        ];
      default:
        return [];
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>🛠️ Msimamizi</h2>
        <Button onClick={loadData} icon="🔄">Refresh</Button>
      </div>

      <div className="media-tabs" style={{ marginBottom: 16 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`media-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <Table columns={getColumns()} data={data} loading={false} emptyText="Hakuna rekodi" />
      )}
    </div>
  );
}
