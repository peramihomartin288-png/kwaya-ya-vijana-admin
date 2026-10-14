import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import MediaPicker from '../../components/MediaPicker';
import Loader from '../../components/Loader';
import { getIntro, saveIntro } from '../../lib/settings';
import '../../styles/pages/watakatifu.css';

const emptyForm = {
  logo: '', jina: '', background_music: '',
  rangi_msingi: '#000000', rangi_maandishi: '#ffffff',
  muda_wa_kusubiri: 3, published: true,
};

export default function IntroPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getIntro();
        if (data) setForm(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  function set(f, v) { setForm((x) => ({ ...x, [f]: v })); }

  async function handleSave() {
    setSaving(true); setMsg('');
    try {
      const saved = await saveIntro(form);
      setForm(saved);
      setMsg('Imehifadhiwa ✅');
    } catch (e) { setMsg('Kosa: ' + e.message); }
    setSaving(false);
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h2>🎨 Intro Page</h2>
        <Button onClick={handleSave} loading={saving}>Hifadhi</Button>
      </div>

      {msg && <div className="trim-info">{msg}</div>}

      <div className="form-section">
        <div className="form-section-title">Maudhui</div>
        <Input label="Jina (chini ya logo)" value={form.jina} onChange={(v) => set('jina', v)} placeholder="KMCA" />
        <MediaPicker label="Logo" type="image" value={form.logo} onChange={(v) => set('logo', v)} />
        <MediaPicker label="Background Music" type="audio" value={form.background_music} onChange={(v) => set('background_music', v)} />
      </div>

      <div className="form-section">
        <div className="form-section-title">Muonekano</div>
        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Rangi ya Msingi</label>
            <input type="color" value={form.rangi_msingi} onChange={(e) => set('rangi_msingi', e.target.value)} style={{ height: 44, borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent' }} />
          </div>
          <div className="input-group">
            <label className="input-label">Rangi ya Maandishi</label>
            <input type="color" value={form.rangi_maandishi} onChange={(e) => set('rangi_maandishi', e.target.value)} style={{ height: 44, borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent' }} />
          </div>
        </div>

        <Input
          label="Muda wa Kusubiri (sekunde)"
          type="number"
          value={form.muda_wa_kusubiri}
          onChange={(v) => set('muda_wa_kusubiri', parseInt(v) || 3)}
        />
      </div>

      {/* Preview */}
      <div className="form-section">
        <div className="form-section-title">Onyesho</div>
        <div style={{
          background: form.rangi_msingi,
          color: form.rangi_maandishi,
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}>
          {form.logo ? (
            <img src={form.logo} alt="logo" style={{ width: 80, height: 80, objectFit: 'contain' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>
              K
            </div>
          )}
          <div style={{ fontSize: 22, fontWeight: 700 }}>{form.jina || 'KMCA'}</div>
          <div className="loader-spinner" style={{ width: 24, height: 24, borderColor: 'rgba(255,255,255,0.2)', borderTopColor: form.rangi_maandishi }}></div>
        </div>
      </div>
    </div>
  );
}
