import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { listLive, createLive, updateLive, deleteLive } from '../lib/live';
import '../styles/pages/watakatifu.css';

const emptyForm = {
  head: '',
  description: '',
  url: '',
  active: true,
  published: false,
};

export default function Live() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try { setData(await listLive()); } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({ ...emptyForm, ...row });
    setError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.head || !form.url) {
      setError('Kichwa na URL ni lazima');
      return;
    }
    setSaving(true);
    try {
      if (editing) await updateLive(editing.id, form);
      else await createLive(form);
      setModalOpen(false);
      await load();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Una uhakika kufuta?')) return;
    try { await deleteLive(id); await load(); }
    catch (e) { alert(e.message); }
  }

  async function toggleActive(row) {
    try { await updateLive(row.id, { active: !row.active }); await load(); }
    catch (e) { alert(e.message); }
  }

  const columns = [
    { key: 'head', label: 'Kichwa' },
    {
      key: 'url', label: 'URL',
      render: (r) => <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
        {(r.url || '').slice(0, 40)}...
      </span>,
    },
    {
      key: 'active', label: 'Live', width: 90,
      render: (r) => r.active
        ? <span className="badge badge-green">Inaendelea</span>
        : <span className="badge badge-gray">Imesimama</span>,
    },
    {
      key: 'published', label: 'Hali', width: 100,
      render: (r) => r.published
        ? <span className="badge badge-green">Imechapishwa</span>
        : <span className="badge badge-gray">Rasimu</span>,
    },
    {
      key: 'actions', label: 'Vitendo', width: 180,
      render: (r) => (
        <div className="row-actions">
          <Button size="sm" variant={r.active ? 'danger' : 'secondary'} onClick={() => toggleActive(r)}>
            {r.active ? '⏹️' : '▶️'}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>✏️</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>🗑️</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>🔴 Live</h2>
        <Button onClick={openNew} icon="➕">Ongeza Live</Button>
      </div>

      <Table columns={columns} data={data} loading={loading} emptyText="Hakuna live" />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Hariri Live' : 'Ongeza Live'}
        size="md"
        footer={
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Ghairi</Button>
            <Button onClick={handleSave} loading={saving}>Hifadhi</Button>
          </div>
        }
      >
        {error && <div className="login-error">{error}</div>}

        <Input label="Kichwa" value={form.head} onChange={(v) => set('head', v)} required />
        <Input label="Maelezo" type="textarea" rows={3} value={form.description} onChange={(v) => set('description', v)} />
        <Input label="URL ya Live (YouTube, n.k)" value={form.url} onChange={(v) => set('url', v)} placeholder="https://youtube.com/..." required />

        <div className="checkbox-row">
          <input type="checkbox" id="active" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
          <label htmlFor="active">Live inaendelea</label>
        </div>

        <div className="checkbox-row">
          <input type="checkbox" id="pub" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
          <label htmlFor="pub">Chapisha kwa watumiaji</label>
        </div>
      </Modal>
    </div>
  );
}
