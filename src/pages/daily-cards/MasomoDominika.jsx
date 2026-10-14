import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import MediaPicker from '../../components/MediaPicker';
import { listMasomo, createMasomo, updateMasomo, deleteMasomo } from '../../lib/masomo';
import '../../styles/pages/masomo.css';

const emptyForm = {
  tarehe: '',
  dominika: '',
  juma: '',
  description: '',
  somo_1_kitabu: '',
  somo_1_maneno: '',
  wimbo_katikati_kitabu: '',
  wimbo_katikati_maneno: '',
  somo_2_kitabu: '',
  somo_2_maneno: '',
  shangilio_kitabu: '',
  shangilio_maneno: '',
  injili_kitabu: '',
  injili_maneno: '',
  picha: '',
  published: false,
};

export default function MasomoDominika() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const isSunday = form.tarehe && new Date(form.tarehe).getDay() === 0;

  async function load() {
    setLoading(true);
    try { setData(await listMasomo()); } catch (e) { console.error(e); }
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
    if (!form.tarehe || !form.dominika || !form.juma) {
      setError('Tarehe, dominika na juma ni lazima');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!isSunday) payload.picha = null;
      if (editing) await updateMasomo(editing.id, payload);
      else await createMasomo(payload);
      setModalOpen(false);
      await load();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Una uhakika kufuta?')) return;
    try { await deleteMasomo(id); await load(); }
    catch (e) { alert(e.message); }
  }

  const columns = [
    { key: 'tarehe', label: 'Tarehe', width: 120 },
    { key: 'dominika', label: 'Dominika' },
    { key: 'juma', label: 'Juma', width: 120 },
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
        <h2>📖 Masomo ya Dominika</h2>
        <Button onClick={openNew} icon="➕">Ongeza Mpya</Button>
      </div>

      <Table columns={columns} data={data} loading={loading} emptyText="Hakuna masomo" />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Hariri Masomo' : 'Ongeza Masomo'}
        size="lg"
        footer={
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Ghairi</Button>
            <Button onClick={handleSave} loading={saving}>Hifadhi</Button>
          </div>
        }
      >
        {error && <div className="login-error">{error}</div>}

        {/* Taarifa za msingi */}
        <div className="form-section">
          <div className="form-section-title">Taarifa za Msingi</div>
          <Input
            label="Tarehe"
            type="date"
            value={form.tarehe}
            onChange={(v) => set('tarehe', v)}
            required
          />
          <div className="form-row">
            <Input
              label="Dominika"
              value={form.dominika}
              onChange={(v) => set('dominika', v)}
              placeholder="Dominika ya 21 ya mwaka A"
              required
            />
            <Input
              label="Juma"
              value={form.juma}
              onChange={(v) => set('juma', v)}
              placeholder="Juma la 4"
              required
            />
          </div>
          <Input
            label="Maelezo (si lazima)"
            type="textarea"
            rows={2}
            value={form.description}
            onChange={(v) => set('description', v)}
          />

          {isSunday && (
            <MediaPicker
              label="Picha (Jumapili, si lazima)"
              type="image"
              value={form.picha}
              onChange={(v) => set('picha', v)}
            />
          )}
        </div>

        {/* Somo la 1 */}
        <div className="form-section">
          <div className="form-section-title">Somo la 1</div>
          <Input label="Kitabu" value={form.somo_1_kitabu} onChange={(v) => set('somo_1_kitabu', v)} />
          <Input label="Maneno" type="textarea" rows={3} value={form.somo_1_maneno} onChange={(v) => set('somo_1_maneno', v)} />
        </div>

        {/* Wimbo wa katikati */}
        <div className="form-section">
          <div className="form-section-title">Wimbo wa Katikati</div>
          <Input label="Kitabu" value={form.wimbo_katikati_kitabu} onChange={(v) => set('wimbo_katikati_kitabu', v)} />
          <Input label="Maneno" type="textarea" rows={3} value={form.wimbo_katikati_maneno} onChange={(v) => set('wimbo_katikati_maneno', v)} />
        </div>

        {/* Somo la 2 (optional) */}
        <div className="form-section">
          <div className="form-section-title">Somo la 2 (si lazima)</div>
          <Input label="Kitabu" value={form.somo_2_kitabu} onChange={(v) => set('somo_2_kitabu', v)} />
          <Input label="Maneno" type="textarea" rows={3} value={form.somo_2_maneno} onChange={(v) => set('somo_2_maneno', v)} />
        </div>

        {/* Shangilio */}
        <div className="form-section">
          <div className="form-section-title">Shangilio</div>
          <Input label="Kitabu" value={form.shangilio_kitabu} onChange={(v) => set('shangilio_kitabu', v)} />
          <Input label="Maneno" type="textarea" rows={3} value={form.shangilio_maneno} onChange={(v) => set('shangilio_maneno', v)} />
        </div>

        {/* Injili */}
        <div className="form-section">
          <div className="form-section-title">Injili</div>
          <Input label="Kitabu" value={form.injili_kitabu} onChange={(v) => set('injili_kitabu', v)} />
          <Input label="Maneno" type="textarea" rows={3} value={form.injili_maneno} onChange={(v) => set('injili_maneno', v)} />
        </div>

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
