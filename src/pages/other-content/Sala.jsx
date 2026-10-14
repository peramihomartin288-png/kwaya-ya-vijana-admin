import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import MediaPicker from '../../components/MediaPicker';
import { listSala, createSala, updateSala, deleteSala } from '../../lib/sala';
import '../../styles/pages/watakatifu.css';

const emptyForm = {
  jina: '', maelezo: '', maneno: '', picha: '',
  media_url: '', media_type: 'audio', tarehe: '', published: false,
};

export default function Sala() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try { setData(await listSala()); } catch (e) { console.error(e); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function set(f, v) { setForm((x) => ({ ...x, [f]: v })); }

  function openNew() { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true); }
  function openEdit(r) { setEditing(r); setForm({ ...emptyForm, ...r }); setError(''); setModalOpen(true); }

  async function handleSave() {
    if (!form.jina) { setError('Jina ni lazima'); return; }
    setSaving(true);
    try {
      if (editing) await updateSala(editing.id, form);
      else await createSala(form);
      setModalOpen(false); await load();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Una uhakika?')) return;
    try { await deleteSala(id); await load(); } catch (e) { alert(e.message); }
  }

  const columns = [
    { key: 'jina', label: 'Jina' },
    { key: 'tarehe', label: 'Tarehe', width: 120, render: (r) => r.tarehe || 'Kila siku' },
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
        <h2>🙏 Sala</h2>
        <Button onClick={openNew} icon="➕">Ongeza Mpya</Button>
      </div>

      <Table columns={columns} data={data} loading={loading} emptyText="Hakuna sala" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Hariri Sala' : 'Ongeza Sala'} size="md"
        footer={<div className="form-actions">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Ghairi</Button>
          <Button onClick={handleSave} loading={saving}>Hifadhi</Button>
        </div>}>
        {error && <div className="login-error">{error}</div>}

        <Input label="Jina" value={form.jina} onChange={(v) => set('jina', v)} required />
        <Input label="Maelezo" type="textarea" rows={2} value={form.maelezo} onChange={(v) => set('maelezo', v)} />
        <Input label="Maneno ya Sala" type="textarea" rows={5} value={form.maneno} onChange={(v) => set('maneno', v)} />
        <Input label="Tarehe (si lazima)" type="date" value={form.tarehe} onChange={(v) => set('tarehe', v)} hint="Acha wazi = inaonekana kila siku" />

        <MediaPicker label="Picha" type="image" value={form.picha} onChange={(v) => set('picha', v)} />

        <Input label="Aina ya Media" type="select" value={form.media_type} onChange={(v) => set('media_type', v)}
          options={[{ value: 'audio', label: 'Audio' }, { value: 'video', label: 'Video' }]} />
        <MediaPicker label="Media" type={form.media_type} value={form.media_url} onChange={(v) => set('media_url', v)} />

        <div className="checkbox-row">
          <input type="checkbox" id="pub" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
          <label htmlFor="pub">Chapisha</label>
        </div>
      </Modal>
    </div>
  );
}
