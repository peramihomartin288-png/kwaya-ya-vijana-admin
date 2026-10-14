import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import MediaPicker from '../../components/MediaPicker';
import { listWimbo, createWimbo, updateWimbo, deleteWimbo } from '../../lib/wimbo';
import '../../styles/pages/watakatifu.css';

const emptyForm = {
  tarehe: '',
  jina: '',
  description: '',
  media_url: '',
  media_type: 'audio',
  published: false,
};

export default function WimboWaSiku() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try { setData(await listWimbo()); } catch (e) { console.error(e); }
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
    if (!form.tarehe || !form.jina) {
      setError('Tarehe na jina ni lazima');
      return;
    }
    setSaving(true);
    try {
      if (editing) await updateWimbo(editing.id, form);
      else await createWimbo(form);
      setModalOpen(false);
      await load();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Una uhakika kufuta?')) return;
    try { await deleteWimbo(id); await load(); }
    catch (e) { alert(e.message); }
  }

  const columns = [
    { key: 'tarehe', label: 'Tarehe', width: 120 },
    { key: 'jina', label: 'Jina' },
    { key: 'media_type', label: 'Aina', width: 90 },
    {
      key: 'published', label: 'Hali', width: 100,
      render: (r) => r.published
        ? <span className="badge badge-green">Imechapishwa</span>
        : <span className="badge badge-gray">Rasimu</span>,
    },
    {
      key: 'actions', label: 'Vitendo', width: 140,
      render: (r) => (
        <div className="row-actions">
          <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>✏️</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>🗑️</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>🎵 Wimbo wa Siku</h2>
        <Button onClick={openNew} icon="➕">Ongeza Mpya</Button>
      </div>

      <Table columns={columns} data={data} loading={loading} emptyText="Hakuna nyimbo" />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Hariri Wimbo' : 'Ongeza Wimbo'}
        size="md"
        footer={
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Ghairi</Button>
            <Button onClick={handleSave} loading={saving}>Hifadhi</Button>
          </div>
        }
      >
        {error && <div className="login-error">{error}</div>}

        <Input label="Tarehe" type="date" value={form.tarehe} onChange={(v) => set('tarehe', v)} required />
        <Input label="Jina la Wimbo" value={form.jina} onChange={(v) => set('jina', v)} required />
        <Input label="Maelezo" type="textarea" rows={3} value={form.description} onChange={(v) => set('description', v)} />

        <Input
          label="Aina ya Media"
          type="select"
          value={form.media_type}
          onChange={(v) => set('media_type', v)}
          options={[
            { value: 'audio', label: 'Audio' },
            { value: 'video', label: 'Video' },
          ]}
        />

        <MediaPicker
          label="Media"
          type={form.media_type}
          value={form.media_url}
          onChange={(v) => set('media_url', v)}
        />

        <div className="checkbox-row">
          <input
            type="checkbox"
            id="pub"
            checked={form.published}
            onChange={(e) => set('published', e.target.checked)}
          />
          <label htmlFor="pub">Chapisha kwa watumiaji</label>
        </div>
      </Modal>
    </div>
  );
}
