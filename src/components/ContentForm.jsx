import { useEffect, useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import MediaPicker from './MediaPicker';
import { supabase } from '../lib/supabase';

export default function ContentForm({ title, icon, table, contentType, onClose, onSave, editing }) {
  const [form, setForm] = useState({
    head: '',
    description: '',
    media: { url: '', type: 'image', images: [] },
    published: false,
    meta: {},
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      setForm({
        head: editing.head || '',
        description: editing.description || '',
        media: editing.media || { url: '', type: 'image', images: [] },
        published: editing.published || false,
        meta: editing.meta || {},
      });
    }
  }, [editing]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setMedia(key, value) {
    setForm((f) => ({ ...f, media: { ...f.media, [key]: value } }));
  }

  function setMeta(key, value) {
    setForm((f) => ({ ...f, meta: { ...f.meta, [key]: value } }));
  }

  function addImage() {
    setForm((f) => ({ ...f, media: { ...f.media, images: [...(f.media.images || []), ''] } }));
  }

  function updateImage(index, value) {
    setForm((f) => {
      const images = [...f.media.images];
      images[index] = value;
      return { ...f, media: { ...f.media, images } };
    });
  }

  function removeImage(index) {
    setForm((f) => {
      const images = [...f.media.images];
      images.splice(index, 1);
      return { ...f, media: { ...f.media, images } };
    });
  }

  async function handleSave() {
    if (!form.head) return setError('Kichwa ni lazima');
    setSaving(true);
    setError('');
    try {
      const payload = {
        head: form.head,
        description: form.description,
        media: form.media,
        published: form.published,
        content_type: contentType,
        meta: form.meta,
      };

      if (editing?.id) {
        const { error } = await supabase.from(table).update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert([payload]);
        if (error) throw error;
      }
      onSave?.();
      onClose?.();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  const isVideo = form.media.type === 'video';

  return (
    <Modal onClose={onClose} title={`${icon} ${editing ? 'Hariri' : 'Ongeza'} ${title}`}>
      <div className="form-group">
        <label className="input-label">Kichwa</label>
        <Input value={form.head} onChange={(e) => set('head', e.target.value)} placeholder="Kichwa cha habari..." />
      </div>

      <div className="form-group">
        <label className="input-label">Maelezo</label>
        <textarea className="input-field" rows="4" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Maelezo..." />
      </div>

      <div className="form-group">
        <label className="input-label">Picha</label>
        <MediaPicker label="Picha" type="image" value={form.media.url || ''} onChange={(v) => setMedia('url', v)} />
      </div>

      {form.media.images && form.media.images.length > 0 && (
        <div className="form-group">
          <label className="input-label">Picha Nyingine</label>
          {form.media.images.map((img, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <MediaPicker type="image" value={img} onChange={(v) => updateImage(i, v)} />
              <Button variant="danger" onClick={() => removeImage(i)}>🗑️</Button>
            </div>
          ))}
          <Button variant="secondary" onClick={addImage} type="button" icon="➕" fullWidth>Ongeza Picha</Button>
        </div>
      )}

      {isVideo && (
        <MediaPicker label="Video" type="video" value={form.media.url || ''} onChange={(v) => setMedia('url', v)} />
      )}

      <div className="checkbox-row">
        <input type="checkbox" id="pub" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
        <label htmlFor="pub">Chapisha kwa watumiaji</label>
      </div>

      {error && <p className="input-error-msg">{error}</p>}

      <div className="modal-actions">
        <Button variant="secondary" onClick={onClose}>Ghairi</Button>
        <Button onClick={handleSave} loading={saving}>Hifadhi</Button>
      </div>
    </Modal>
  );
}
