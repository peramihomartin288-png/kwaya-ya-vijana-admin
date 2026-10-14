import { useEffect, useState } from 'react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import Table from './Table';
import MediaPicker from './MediaPicker';
import { listContent, createContent, updateContent, deleteContent } from '../lib/content';
import '../styles/pages/watakatifu.css';

export default function ContentForm({ type, title, icon, mediaCount = 1, withMusic = false }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ head: '', description: '', media: {}, published: false });
  const [error, setError] = useState('');

  const isVideo = type === 'video';
  const isMulti = mediaCount > 1;

  async function load() {
    setLoading(true);
    try { setData(await listContent(type)); } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [type]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setMedia(field, value) {
    setForm((f) => ({ ...f, media: { ...f.media, [field]: value } }));
  }

  function setMediaUrl(index, value) {
    const urls = [...(form.media.urls || [])];
    urls[index] = value;
    setForm((f) => ({ ...f, media: { ...f.media, urls } }));
  }

  function addImage() {
    const urls = [...(form.media.urls || [''])];
    urls.push('');
    setForm((f) => ({ ...f, media: { ...f.media, urls } }));
  }

  function removeImage(index) {
    const urls = [...(form.media.urls || [])];
    urls.splice(index, 1);
    if (urls.length === 0) urls.push('');
    setForm((f) => ({ ...f, media: { ...f.media, urls } }));
  }

  function makeEmptyForm() {
    const base = { head: '', description: '', media: {}, published: false };
    if (isMulti) base.media.urls = [''];
    else base.media.url = '';
    if (withMusic) base.media.music = '';
    return base;
  }

  function openNew() {
    setEditing(null);
    setForm(makeEmptyForm());
    setError('');
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      head: row.head || '',
      description: row.description || '',
      media: row.media || { urls: [''] },
      published: row.published || false,
    });
    setError('');
    setModalOpen(true);
  }

  function validate() {
    if (!form.head.trim()) return 'Kichwa ni lazima';
    if (isMulti) {
      const urls = form.media.urls || [];
      if (urls.filter(Boolean).length === 0) return 'Weka angalau picha moja';
    } else {
      if (!form.media.url) return `${isVideo ? 'Video' : 'Picha'} ni lazima`;
    }
    if (withMusic && !form.media.music) return 'Background music ni lazima';
    return '';
  }

  async function handleSave() {
    const v = validate();
    if (v) { setError(v); return; }

    setSaving(true);
    try {
      const cleanMedia = { ...form.media };
      if (isMulti && cleanMedia.urls) {
        cleanMedia.urls = cleanMedia.urls.filter(Boolean);
      }

      const payload = {
        head: form.head,
        description: form.description,
        content_type: type,
        media: cleanMedia,
        published: form.published,
      };
      if (editing) await updateContent(editing.id, payload);
      else await createContent(payload);
      setModalOpen(false);
      await load();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm('Una uhakika kufuta?')) return;
    try { await deleteContent(id); await load(); }
    catch (e) { alert(e.message); }
  }

  function renderThumb(row) {
    if (isMulti) {
      const url = row.media?.urls?.[0];
      return url
        ? <img src={url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
        : '—';
    }
    if (isVideo) return '🎬';
    const url = row.media?.url;
    return url
      ? <img src={url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
      : '—';
  }

  const columns = [
    { key: 'thumb', label: '', width: 60, render: renderThumb },
    { key: 'head', label: 'Kichwa' },
    {
      key: 'description', label: 'Maelezo',
      render: (r) => (r.description || '').slice(0, 40) + ((r.description || '').length > 40 ? '...' : ''),
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
        <h2>{icon} {title}</h2>
        <Button onClick={openNew} icon="➕">Ongeza Mpya</Button>
      </div>

      <Table columns={columns} data={data} loading={loading} emptyText={`Hakuna ${title.toLowerCase()}`} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Hariri ${title}` : `Ongeza ${title}`}
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

        {/* Picha Moja */}
        {!isMulti && !isVideo && (
          <MediaPicker
            label="Picha"
            type="image"
            value={form.media.url || ''}
            onChange={(v) => setMedia('url', v)}
          />
        )}

        {/* Picha Nyingi (Unlimited) */}
        {isMulti && (
          <div>
            <div className="form-section-title" style={{ marginTop: 8 }}>Picha</div>
            {(form.media.urls || ['']).map((url, i) => (
              <div key={i} className="multi-image-row">
                <MediaPicker
                  label={`Picha ${i + 1}`}
                  type="image"
                  value={url || ''}
                  onChange={(v) => setMediaUrl(i, v)}
                />
                {(form.media.urls || []).length > 1 && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => removeImage(i)}
                    type="button"
                  >
                    🗑️ Ondoa
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="secondary"
              onClick={addImage}
              type="button"
              icon="➕"
              fullWidth
            >
              Ongeza Picha
            </Button>
          </div>
        )}

        {/* Video */}
        {isVideo && (
          <MediaPicker
            label="Video"
            type="video"
            value={form.media.url || ''}
            onChange={(v) => setMedia('url', v)}
          />
        )}

        {/* Background Music */}
        {withMusic && (
          <MediaPicker
            label="Background Music"
            type="audio"
            value={form.media.music || ''}
            onChange={(v) => setMedia('music', v)}
          />
        )}

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
