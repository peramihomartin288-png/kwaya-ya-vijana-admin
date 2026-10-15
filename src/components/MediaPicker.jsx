import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { uploadToCloudinary, thumbUrl, videoUrl, audioUrl } from '../lib/cloudinary';
import Button from './Button';
import AudioTrimmer from './AudioTrimmer';
import '../styles/components/media-picker.css';

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

    // Limit
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
      // Compress picha kama ni kubwa
      if (type === 'image' && file.size > 500 * 1024) {
        file = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
      }

      const url = await uploadToCloudinary(file, type);
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
          >
            {uploading ? 'Inapakia...' : '📁 Chagua Faili'}
          </Button>
        </div>
      )}

      {error && <span className="input-error-msg">{error}</span>}

      {value && (
        <div className="media-preview">
          {type === 'image' && <img src={thumbUrl(value, 400)} alt="Preview" />}
          {type === 'video' && <video src={videoUrl(value)} controls />}
          {type === 'audio' && <audio src={audioUrl(value)} controls />}

          <div className="media-preview-actions">
            {type === 'audio' && (
              <button
                className="media-trim-btn"
                onClick={() => setShowTrim(!showTrim)}
                type="button"
              >
                ✂️ Trim
              </button>
            )}
            <button className="media-clear" onClick={handleClear} type="button">
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
