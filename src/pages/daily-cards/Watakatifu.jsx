import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import MediaPicker from '../../components/MediaPicker';
import { listWatakatifu, createWatakatifu, updateWatakatifu, deleteWatakatifu } from '../../lib/watakatifu';
import { thumbUrl } from '../../lib/cloudinary';
import '../../styles/pages/watakatifu.css';

const emptyForm = {
  tarehe: '',
  jina: '',
  picha: '',
  history: '',
  miujiza: '',
  sala: '',
  published: false,
};

export default function Watakatifu() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setData(await listWatakatifu());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      tarehe: row.tarehe || '',
      jina: row.jina || '',
      picha: row.picha || '',
      history: row.history || '',
      miujiza: row.miujiza || '',
      sala: row.sala || '',
      published: row.published || false,
    });
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
      if (editing) {
        await updateWatakatifu(editing.id, form);
      } else {
        await createWatakatifu(form);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Una uhakika kufuta?')) return;
    try {
      await deleteWatakatifu(id);
      await load();
    } catch (e) {
      alert('Imeshindwa: ' + e.message);
    }
  }

  const columns = [
    { key: 'tarehe', label: 'Tarehe', width: 120 },
    { key: 'jina', label: 'Jina' },
    {
      key: 'picha', label: 'Picha', width: 80,
      render: (r) => r.picha
        ? <img
            src={thumbUrl(r.picha, 80)}
            alt=""
            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
          />
        : '—',
    },
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
        <h2>✝️ Watakatifu</h2>
        <Button onClick={openNew} icon="➕">Ongeza Mpya</Button>
      </div>

      <Table columns={columns} data={data} loading={loading} emptyText="Hakuna watakatifu" />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Hariri Mtakatifu' : 'Ongeza Mtakatifu'}
        size="md"
        footer={
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Ghairi</Button>
            <Button onClick={handleSave} loading={saving}>Hifadhi</Button>
          </div>
        }
      >
        {error && <div className="login-error">{error}</div>}

        <Input
          label="Tarehe"
          type="date"
          value={form.tarehe}
          onChange={(v) => set('tarehe', v)}
          required
        />

        <Input
          label="Jina la Mtakatifu"
          value={form.jina}
          onChange={(v) => set('jina', v)}
          placeholder="Mfano: Mtakatifu Martin"
          required
        />

        <MediaPicker
          label="Picha"
          type="image"
          value={form.picha}
          onChange={(v) => set('picha', v)}
        />

        <Input
          label="Historia"
          type="textarea"
          rows={4}
          value={form.history}
          onChange={(v) => set('history', v)}
        />

        <Input
          label="Miujiza (si lazima)"
          type="textarea"
          rows={3}
          value={form.miujiza}
          onChange={(v) => set('miujiza', v)}
        />

        <Input
          label="Sala"
          type="textarea"
          rows={3}
          value={form.sala}
          onChange={(v) => set('sala', v)}
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
