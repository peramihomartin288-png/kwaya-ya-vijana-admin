import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import {
  listLiturgical,
  createLiturgical,
  updateLiturgical,
  deleteLiturgical,
  RANGI,
} from '../lib/liturgical';
import '../styles/pages/watakatifu.css';

const emptyForm = {
  tarehe_kuanza: '',
  tarehe_kumaliza: '',
  rangi: 'kijani',
  jina: '',
  maelezo: '',
};

export default function LiturgicalColors() {
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
      setData(await listLiturgical());
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
      tarehe_kuanza: row.tarehe_kuanza || '',
      tarehe_kumaliza: row.tarehe_kumaliza || '',
      rangi: row.rangi || 'kijani',
      jina: row.jina || '',
      maelezo: row.maelezo || '',
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.tarehe_kuanza || !form.tarehe_kumaliza || !form.rangi) {
      setError('Tarehe na rangi ni lazima');
      return;
    }
    if (form.tarehe_kuanza > form.tarehe_kumaliza) {
      setError('Tarehe ya kuanza lazima iwe kabla ya kumaliza');
      return;
    }
    setSaving(true);
    try {
      if (editing) await updateLiturgical(editing.id, form);
      else await createLiturgical(form);
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
      await deleteLiturgical(id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  function getColor(value) {
    return RANGI.find((r) => r.value === value)?.color || '#666';
  }

  function getLabel(value) {
    return RANGI.find((r) => r.value === value)?.label || value;
  }

  function getStatus(row) {
    const today = new Date().toISOString().split('T')[0];
    if (row.tarehe_kumaliza < today) return { label: 'Imeisha', color: '#666' };
    if (row.tarehe_kuanza > today) return { label: 'Inakuja', color: '#f59e0b' };
    return { label: 'Inaendelea', color: '#22c55e' };
  }

  const columns = [
    {
      key: 'rangi', label: 'Rangi', width: 130,
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: getColor(r.rangi),
              border: '2px solid var(--color-border)',
            }}
          ></div>
          <span style={{ fontSize: '0.8rem' }}>{getLabel(r.rangi)}</span>
        </div>
      ),
    },
    {
      key: 'tarehe_kuanza', label: 'Kuanza', width: 110,
      render: (r) => new Date(r.tarehe_kuanza).toLocaleDateString(),
    },
    {
      key: 'tarehe_kumaliza', label: 'Kumaliza', width: 110,
      render: (r) => new Date(r.tarehe_kumaliza).toLocaleDateString(),
    },
    { key: 'jina', label: 'Jina' },
    {
      key: 'status', label: 'Hali', width: 110,
      render: (r) => {
        const s = getStatus(r);
        return (
          <span
            className="badge"
            style={{ background: `${s.color}22`, color: s.color }}
          >
            {s.label}
          </span>
        );
      },
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
        <h2>🎨 Rangi za Misa</h2>
        <Button onClick={openNew} icon="➕">Ongeza Kipindi</Button>
      </div>

      <div className="section" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#22c55e',
              flexShrink: 0,
            }}
          ></div>
          <div>
            <strong>Default: 🟢 Kijani</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Siku zote ambazo haziko kwenye kipindi maalum zitakuwa kijani
            </p>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={data}
        loading={loading}
        emptyText="Hakuna vipindi maalum"
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Hariri Kipindi' : 'Ongeza Kipindi'}
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
          label="Tarehe ya Kuanza"
          type="date"
          value={form.tarehe_kuanza}
          onChange={(v) => set('tarehe_kuanza', v)}
          required
        />

        <Input
          label="Tarehe ya Kumaliza"
          type="date"
          value={form.tarehe_kumaliza}
          onChange={(v) => set('tarehe_kumaliza', v)}
          required
        />

        <div className="input-group">
          <label className="input-label">Rangi *</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {RANGI.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => set('rangi', r.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  background: form.rangi === r.value ? `${r.color}22` : 'transparent',
                  border: `2px solid ${form.rangi === r.value ? r.color : 'var(--color-border)'}`,
                  borderRadius: 999,
                  cursor: 'pointer',
                  color: 'var(--color-text)',
                  fontSize: '0.85rem',
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: r.color,
                  }}
                ></div>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Jina (si lazima)"
          value={form.jina}
          onChange={(v) => set('jina', v)}
          placeholder="Mfano: Kwaresima, Krismasi"
        />

        <Input
          label="Maelezo (si lazima)"
          type="textarea"
          rows={3}
          value={form.maelezo}
          onChange={(v) => set('maelezo', v)}
        />
      </Modal>
    </div>
  );
}
