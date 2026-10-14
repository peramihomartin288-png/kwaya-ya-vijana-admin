import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import MediaPicker from '../components/MediaPicker';
import { listFakeLive, createFakeLive, updateFakeLive, deleteFakeLive } from '../lib/fake-live';
import '../styles/pages/watakatifu.css';

const emptyForm = {
  head: '',
  description: '',
  url: '',
  duration_seconds: 0,
  schedule_type: 'daily',
  play_times: [''],
  timezone: 'Africa/Dar_es_Salaam',
  start_date: '',
  end_date: '',
  published: false,
};

export default function FakeLive() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try { setData(await listFakeLive()); } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  function setPlayTime(i, value) {
    const times = [...form.play_times];
    times[i] = value;
    setForm((f) => ({ ...f, play_times: times }));
  }

  function addPlayTime() {
    setForm((f) => ({ ...f, play_times: [...f.play_times, ''] }));
  }

  function removePlayTime(i) {
    const times = form.play_times.filter((_, idx) => idx !== i);
    if (times.length === 0) times.push('');
    setForm((f) => ({ ...f, play_times: times }));
  }

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({ ...emptyForm, ...row, play_times: row.play_times || [''] });
    setError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.head || !form.url) { setError('Kichwa na video ni lazima'); return; }
    const times = form.play_times.filter(Boolean);
    if (times.length === 0) { setError('Weka angalau muda mmoja'); return; }

    setSaving(true);
    try {
      const payload = { ...form, play_times: times };
      if (editing) await updateFakeLive(editing.id, payload);
      else await createFakeLive(payload);
      setModalOpen(false);
      await load();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Una uhakika kufuta?')) return;
    try { await deleteFakeLive(id); await load(); }
    catch (e) { alert(e.message); }
  }

  const columns = [
    { key: 'head', label: 'Kichwa' },
    { key: 'play_times', label: 'Nyakati', render: (r) => (r.play_times || []).join(', ') || '—' },
    { key: 'duration_seconds', label: 'Urefu', width: 90, render: (r) => r.duration_seconds ? `${Math.floor(r.duration_seconds / 60)}m` : '—' },
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
        <h2>📺 Fake Live (Sala Maalumu)</h2>
        <Button onClick={openNew} icon="➕">Ongeza Mpya</Button>
      </div>

      <Table columns={columns} data={data} loading={loading} emptyText="Hakuna fake live" />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Hariri Fake Live' : 'Ongeza Fake Live'}
        size="md"
        footer={
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Ghairi</Button>
            <Button onClick={handleSave} loading={saving}>Hifadhi</Button>
          </div>
        }
      >
        {error && <div className="login-error">{error}</div>}

        <Input label="Kichwa" value={form.head} onChange={(v) => set('head', v)} placeholder="Rozari ya Huruma ya Mungu" required />
        <Input label="Maelezo" type="textarea" rows={3} value={form.description} onChange={(v) => set('description', v)} />

        <MediaPicker
          label="Video"
          type="video"
          value={form.url}
          onChange={(v) => set('url', v)}
        />

        <div className="form-section">
          <div className="form-section-title">Nyakati za Kucheza</div>
          {form.play_times.map((t, i) => (
            <div key={i} className="multi-image-row">
              <Input label={`Muda ${i + 1}`} type="time" value={t} onChange={(v) => setPlayTime(i, v)} />
              {form.play_times.length > 1 && (
                <Button size="sm" variant="danger" onClick={() => removePlayTime(i)} type="button">🗑️</Button>
              )}
            </div>
          ))}
          <Button variant="secondary" onClick={addPlayTime} type="button" icon="➕" fullWidth>Ongeza Muda</Button>
        </div>

        <Input
          label="Urefu wa video (sekunde) — si lazima"
          type="number"
          value={form.duration_seconds}
          onChange={(v) => set('duration_seconds', parseInt(v) || 0)}
          hint="Inaweza kujazwa automatic kutoka video"
        />

        <Input label="Tarehe ya Kuanza" type="date" value={form.start_date} onChange={(v) => set('start_date', v)} />
        <Input label="Tarehe ya Kumaliza (si lazima)" type="date" value={form.end_date} onChange={(v) => set('end_date', v)} />

        <div className="checkbox-row">
          <input type="checkbox" id="pub" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
          <label htmlFor="pub">Chapisha kwa watumiaji</label>
        </div>
      </Modal>
    </div>
  );
}
