import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import MediaPicker from '../../components/MediaPicker';
import { listMatukio, createMatukio, updateMatukio, deleteMatukio } from '../../lib/matukio';
import { thumbUrl } from '../../lib/cloudinary';
import '../../styles/pages/watakatifu.css';

const emptyForm = {
  jina: '', maelezo: '', picha: '', background_music: '',
  background_music_trim: null,
  video_url: '', mahali: '', tarehe_kuanza: '', tarehe_kumaliza: '', published: false,
};

export default function Matukio() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try { setData(await listMatukio()); } catch (e) { console.error(e); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function set(f, v) { setForm((x) => ({ ...x, [f]: v })); }
  function openNew() { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true); }
  function openEdit(r) { setEditing(r); setForm({ ...emptyForm, ...r }); setError(''); setModalOpen(true); }

  async function handleSave() {
    if (!form.jina || !form.tarehe_kuanza) { setError('Jina na tarehe ni lazima'); return; }
    setSaving(true);
    try {
      if (editing) await updateMatukio(editing.id, form);
      else await createMatukio(form);
      setModalOpen(false); await load();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Una uhakika?')) return;
    try { await deleteMatukio(id); await load(); } catch (e) { alert(e.message); }
  }

  const columns = [
    { key: 'picha', label: '', width: 60, render: (r) => r.picha
      ? <img src={thumbUrl(r.picha, 80)} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
      : '—' },
    { key: 'jina', label: 'Jina' },
    { key: 'tarehe_kuanza', label: 'Tarehe', width: 160, render: (r) => r.tarehe_kuanza ? new Date(r.tarehe_kuanza).toLocaleString() : '—' },
    { key: 'mahali', label: 'Mahali', width: 140 },
    { key: 'published', label: 'Hali', width: 100, render: (r) => r.published ? <span className="badge badge-green">Imechapishwa</span> : <span className="badge badge-gray">Rasimu</span> },
    { key: 'actions', label: 'Vitendo', width: 140, render: (r) => (
      <div className="row-actions">
        <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>✏️</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>🗑️</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <h2>📅 Matukio</h2>
        <Button onClick={openNew} icon="➕">Ongeza Mpya</Button>
      </div>

      <Table columns={columns} data={data} loading={loading} emptyText="Hakuna matukio" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Hariri Tukio' : 'Ongeza Tukio'} size="md"
        footer={<div className="form-actions">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Ghairi</Button>
          <Button onClick={handleSave} loading={saving}>Hifadhi</Button>
        </div>}>
        {error && <div className="login-error">{error}</div>}

        <Input label="Jina" value={form.jina} onChange={(v) => set('jina', v)} required />
        <Input label="Maelezo" type="textarea" rows={3} value={form.maelezo} onChange={(v) => set('maelezo', v)} />
        <Input label="Mahali" value={form.mahali} onChange={(v) => set('mahali', v)} />
        <Input label="Tarehe ya Kuanza" type="datetime-local" value={form.tarehe_kuanza} onChange={(v) => set('tarehe_kuanza', v)} required />
        <Input label="Tarehe ya Kumaliza" type="datetime-local" value={form.tarehe_kumaliza} onChange={(v) => set('tarehe_kumaliza', v)} />

        <MediaPicker label="Picha" type="image" value={form.picha} onChange={(v) => set('picha', v)} />
        <MediaPicker label="Video" type="video" value={form.video_url} onChange={(v) => set('video_url', v)} />

        <MediaPicker
          type="audio"
          value={form.background_music}
          trim={form.background_music_trim}
          onChange={(url, trimData) => {
            set('background_music', url);
            if (trimData) set('background_music_trim', trimData);
          }}
        />

        <div className="checkbox-row">
          <input type="checkbox" id="pub" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
          <label htmlFor="pub">Chapisha</label>
        </div>
      </Modal>
    </div>
  );
}
