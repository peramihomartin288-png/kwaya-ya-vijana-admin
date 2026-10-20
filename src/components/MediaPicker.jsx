import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { uploadToCloudinary, thumbUrl, videoUrl, audioUrl } from '../lib/cloudinary';
import { uploadToUploadcare } from '../lib/uploadcare';
import Button from './Button';
import AudioTrimmer from './AudioTrimmer';
import '../styles/components/media-picker.css';

// Tambua kama ni YouTube
function isYouTube(url) {
  return url?.includes('youtube.com') || url?.includes('youtu.be');
}

// Pata YouTube ID
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

export default function MediaPicker({
  label, value, onChange, type = 'image', accept, trim,
}) {
  const [mode, setMode] = useState('url');
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showTrim, setShowTrim] = useState(false);
  const [trimData, setTrimData] = useState(trim || null);
  const fileRef = useRef(null);

  const acceptDefault =
    type === 'image' ? 'image/*' :
    type === 'video' ? 'video/*' :
    'audio/*';

  async function handleFile(e) {
    let file = e.target.files?.[0];
    if (!file) return;

    const limit =
      type === 'image' ? 5 * 1024 * 1024 :
      type === 'video' ? 50 * 1024 * 1024 :
      10 * 1024 * 1024;

    if (file.size > limit) {
      setError(`Faili ni kubwa mno. Limit: ${limit / 1024 / 1024} MB`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      if (type === 'image' && file.size > 500 * 1024) {
        file = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
      }

      let url;
      const sizeMB = file.size / (1024 * 1024);
      const useUploadcare = type === 'audio' || (type === 'video' && sizeMB > 100);
      
      if (useUploadcare) {
        url = await uploadToUploadcare(file);
      } else {
        url = await uploadToCloudinary(file, type);
      }
      onChange?.(url);
      setUrlInput(url);
    } catch (err) {
      setError('Imeshindwa kupakia: ' + err.message);
    }
    setUploading(false);
  }

  function handleUrl() {
    if (urlInput.trim()) onChange?.(urlInput.trim());
  }

  function handleClear() {
    onChange?.('');
    setUrlInput('');
    setTrimData(null);
  }

  function handleTrim(data) {
    setTrimData(data);
    onChange?.(value, data);
  }

  function renderPreview() {
    if (!value) return null;

    // Kama ni YouTube
    if (isYouTube(value)) {
      const id = getYouTubeId(value);
      if (id) {
        return (
          <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
            <iframe
              src={`https://www.youtube.com/embed/${id}`}
              title="YouTube Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        );
      }
    }

    // Kama ni Image
    if (type === 'image') {
      return <img src={thumbUrl(value, 400)} alt="Preview" />;
    }

    // Kama ni Video (Cloudinary au nyingine)
    if (type === 'video') {
      return <video src={videoUrl(value)} controls />;
    }

    // Kama ni Audio
    if (type === 'audio') {
      return (
        <div style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 8 }}>
          <audio src={value} controls preload="metadata" style={{ width: '100%' }} />
        </div>
      );
    }

    return null;
  }

  return (
    <div className="media-picker">
      {label && <label className="input-label">{label}</label>}

      <div className="media-tabs">
        <button
          className={`media-tab ${mode === 'url' ? 'active' : ''}`}
          onClick={() => setMode('url')}
          type="button"
        >
          🔗 Weka URL
        </button>
        <button
          className={`media-tab ${mode === 'file' ? 'active' : ''}`}
          onClick={() => setMode('file')}
          type="button"
        >
          📁 Chagua Faili
        </button>
      </div>

      {mode === 'url' && (
        <div className="media-url-row">
          <input
            className="input-field"
            type="text"
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <Button onClick={handleUrl} size="sm">Weka</Button>
        </div>
      )}

      {mode === 'file' && (
        <div className="media-file-row">
          <input
            type="file"
            accept={accept || acceptDefault}
            ref={fileRef}
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            loading={uploading}
            variant="secondary"
            size="sm"
            style={{ width: '100%' }}
          >
            {uploading ? 'Inapakia...' : '📁 Chagua Faili'}
          </Button>
        </div>
      )}

      {error && <span className="input-error-msg">{error}</span>}

      {value && (
        <div className="media-preview">
          {renderPreview()}

          <div className="media-preview-actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {type === 'audio' && (
              <button
                className="media-trim-btn"
                onClick={() => setShowTrim(!showTrim)}
                type="button"
                style={{ flex: 1, padding: 8, background: 'var(--color-primary)', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer' }}
              >
                ✂️ Trim
              </button>
            )}
            <button className="media-clear" onClick={handleClear} type="button" style={{ padding: '8px 16px', background: 'var(--color-danger)', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
              ✕ Ondoa
            </button>
          </div>
        </div>
      )}

      {trimData && (
        <div className="trim-info">
          ✅ Trim: {trimData.start?.toFixed(1)}s → {trimData.end?.toFixed(1)}s
        </div>
      )}

      {showTrim && value && type === 'audio' && (
        <AudioTrimmer
          url={value}
          initialStart={trimData?.start || 0}
          initialEnd={trimData?.end || 0}
          onTrim={handleTrim}
          onClose={() => setShowTrim(false)}
        />
      )}
    </div>
  );
}
