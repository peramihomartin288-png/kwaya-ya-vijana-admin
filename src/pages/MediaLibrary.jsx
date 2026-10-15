import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { listMedia, saveMedia, deleteMedia } from '../lib/media';
import { uploadToCloudinary, thumbUrl, fullUrl, videoUrl, audioUrl } from '../lib/cloudinary';
import '../styles/pages/media-library.css';

export default function MediaLibrary() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  async function load() {
    setLoading(true);
    try { setData(await listMedia()); } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(files) {
    setUploading(true);
    try {
      for (const file of files) {
        const isVideo = file.type.startsWith('video');
        const isAudio = file.type.startsWith('audio');
        const type = isVideo ? 'video' : isAudio ? 'audio' : 'image';
        const url = await uploadToCloudinary(file, type);
        await saveMedia({ url, type });
      }
      await load();
    } catch (e) { alert('Kosa: ' + e.message); }
    setUploading(false);
  }

  async function handleDelete(item) {
    if (!confirm('Futa kutoka maktaba?')) return;
    try { await deleteMedia(item.id); await load(); }
    catch (e) { alert(e.message); }
  }

  function copyUrl(url) {
    navigator.clipboard.writeText(url);
    alert('URL imenakiliwa ✅');
  }

  const filtered = data.filter((m) => {
    if (filter !== 'all' && m.type !== filter) return false;
    if (search && !m.url.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h2>📁 Media Library</h2>
        <label className="btn btn-primary btn-md" style={{ cursor: 'pointer' }}>
          {uploading ? '⏳ Inapakia...' : '➕ Pakia Media'}
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload([...e.target.files])}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="media-toolbar">
        <div className="media-filters">
          {['all', 'image', 'video', 'audio'].map((f) => (
            <button
              key={f}
              className={`media-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '📦 Zote' : f === 'image' ? '🖼️ Picha' : f === 'video' ? '🎬 Video' : '🎵 Audio'}
            </button>
          ))}
        </div>
        <input
          className="input-field"
          placeholder="🔍 Tafuta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="table-empty">
          {data.length === 0 ? 'Hakuna media. Pakia kwanza.' : 'Hakuna matokeo'}
        </div>
      ) : (
        <div className="media-grid">
          {filtered.map((m) => (
            <div key={m.id} className="media-item">
              <div className="media-item-preview" onClick={() => setPreview(m)}>
                {m.type === 'image' && <img src={thumbUrl(m.url, 300)} alt="" loading="lazy" />}
                {m.type === 'video' && <video src={videoUrl(m.url)} muted />}
                {m.type === 'audio' && <div className="media-audio-icon">🎵</div>}
              </div>
              <div className="media-item-info">
                <span className="media-item-type">
                  {m.type === 'image' ? '🖼️' : m.type === 'video' ? '🎬' : '🎵'} {m.type}
                </span>
                <div className="media-item-actions">
                  <button onClick={() => copyUrl(m.url)} title="Nakili URL">📋</button>
                  <button onClick={() => handleDelete(m)} title="Futa">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="media-preview-overlay" onClick={() => setPreview(null)}>
          <div className="media-preview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="media-preview-close" onClick={() => setPreview(null)}>✕</button>
            {preview.type === 'image' && <img src={fullUrl(preview.url, 1080)} alt="" />}
            {preview.type === 'video' && <video src={videoUrl(preview.url)} controls autoPlay />}
            {preview.type === 'audio' && <audio src={audioUrl(preview.url)} controls autoPlay />}
            <div className="media-preview-url">
              <code>{preview.url}</code>
              <Button size="sm" onClick={() => copyUrl(preview.url)}>📋 Nakili</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
