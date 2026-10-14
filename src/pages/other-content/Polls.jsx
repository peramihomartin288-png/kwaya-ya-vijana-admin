import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import MediaPicker from '../../components/MediaPicker';
import { listPolls, createPoll, updatePoll, deletePoll, getVotes } from '../../lib/polls';
import '../../styles/pages/watakatifu.css';

const emptyForm = {
  swali: '', maelezo: '', picha: '', options: ['', ''], published: false,
};

export default function Polls() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [votes, setVotes] = useState(null);

  async function load() {
    setLoading(true);
    try { setData(await listPolls()); } catch (e) { console.error(e); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function set(f, v) { setForm((x) => ({ ...x, [f]: v })); }

  function setOption(i, v) {
    const opts = [...form.options];
    opts[i] = v;
    setForm((x) => ({ ...x, options: opts }));
  }

  function addOption() { setForm((x) => ({ ...x, options: [...x.options, ''] })); }
  function removeOption(i) {
    const opts = form.options.filter((_, idx) => idx !== i);
    if (opts.length < 2) opts.push('');
    setForm((x) => ({ ...x, options: opts }));
  }

  function openNew() { setEditing(null); setForm(emptyForm); setError(''); setModalOpen(true); }
  function openEdit(r) { setEditing(r); setForm({ ...emptyForm, ...r, options: r.options || ['', ''] }); setError(''); setModalOpen(true); }

  async function handleSave() {
    const opts = form.options.filter(Boolean);
    if (!form.swali || opts.length < 2) { setError('Swali na chaguo 2 ni lazima'); return; }
    setSaving(true);
    try {
      const payload = { ...form, options: opts };
      if (editing) await updatePoll(editing.id, payload);
      else await createPoll(payload);
      setModalOpen(false); await load();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Una uhakika?')) return;
    try { await deletePoll(id); await load(); } catch (e) { alert(e.message); }
  }

  async function showVotes(poll) {
    const v = await getVotes(poll.id);
    setVotes({ poll, votes: v });
  }

  const columns = [
    { key: 'swali', label: 'Swali' },
    { key: 'options', label: 'Chaguo', width: 200, render: (r) => (r.options || []).length },
    { key: 'published', label: 'Hali', width: 100, render: (r) => r.published ? <span className="badge badge-green">Imechapishwa</span> : <span className="badge badge-gray">Rasimu</span> },
    { key: 'actions', label: 'Vitendo', width: 200, render: (r) => (
      <div className="row-actions">
        <Button size="sm" variant="ghost" onClick={() => showVotes(r)}>📊</Button>
        <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>✏️</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>🗑️</Button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <h2>📊 Polls</h2>
        <Button onClick={openNew} icon="➕">Ongeza Mpya</Button>
      </div>

      <Table columns={columns} data={data} loading={loading} emptyText="Hakuna polls" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Hariri Poll' : 'Ongeza Poll'} size="md"
        footer={<div className="form-actions">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Ghairi</Button>
          <Button onClick={handleSave} loading={saving}>Hifadhi</Button>
        </div>}>
        {error && <div className="login-error">{error}</div>}

        <Input label="Swali" value={form.swali} onChange={(v) => set('swali', v)} required />
        <Input label="Maelezo" type="textarea" rows={2} value={form.maelezo} onChange={(v) => set('maelezo', v)} />
        <MediaPicker label="Picha (si lazima)" type="image" value={form.picha} onChange={(v) => set('picha', v)} />

        <div className="form-section">
          <div className="form-section-title">Chaguo</div>
          {form.options.map((o, i) => (
            <div key={i} className="multi-image-row">
              <Input label={`Chaguo ${String.fromCharCode(65 + i)}`} value={o} onChange={(v) => setOption(i, v)} />
              {form.options.length > 2 && (
                <Button size="sm" variant="danger" onClick={() => removeOption(i)} type="button">🗑️</Button>
              )}
            </div>
          ))}
          <Button variant="secondary" onClick={addOption} type="button" icon="➕" fullWidth>Ongeza Chaguo</Button>
        </div>

        <div className="checkbox-row">
          <input type="checkbox" id="pub" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
          <label htmlFor="pub">Chapisha</label>
        </div>
      </Modal>

      {votes && (
        <Modal open={!!votes} onClose={() => setVotes(null)} title={`Matokeo: ${votes.poll.swali}`} size="md">
          {votes.poll.options.map((opt, i) => {
            const count = votes.votes.filter((v) => v.option_index === i).length;
            const percent = votes.votes.length ? (count / votes.votes.length * 100) : 0;
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                  <span>{opt}</span>
                  <span>{count} ({percent.toFixed(0)}%)</span>
                </div>
                <div className="monitor-bar">
                  <div className="monitor-bar-fill" style={{ width: `${percent}%` }}></div>
                </div>
              </div>
            );
          })}
          <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Jumla: {votes.votes.length} kura
          </p>
        </Modal>
      )}
    </div>
  );
}
