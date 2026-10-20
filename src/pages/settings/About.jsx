import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import MediaPicker from '../../components/MediaPicker';
import Loader from '../../components/Loader';
import { getAbout, saveAbout } from '../../lib/settings';
import '../../styles/pages/watakatifu.css';

const emptyForm = {
  kichwa: '', maelezo: '', picha: '', video_url: '', background_music: '', published: true,
};

export default function About() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getAbout();
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
      const saved = await saveAbout(form);
      setForm(saved);
      setMsg('Imehifadhiwa ✅');
    } catch (e) { setMsg('Kosa: ' + e.message); }
    setSaving(false);
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h2>ℹ️ About</h2>
        <Button onClick={handleSave} loading={saving}>Hifadhi</Button>
      </div>

      {msg && <div className="trim-info">{msg}</div>}

      <div className="form-section">
        <Input label="Kichwa" value={form.kichwa} onChange={(v) => set('kichwa', v)} />
        <Input label="Maelezo" type="textarea" rows={6} value={form.maelezo} onChange={(v) => set('maelezo', v)} />
        <MediaPicker label="Picha" type="image" value={form.picha} onChange={(v) => set('picha', v)} />
        <MediaPicker label="Video" type="video" value={form.video_url} onChange={(v) => set('video_url', v)} />
      </div>
    </div>
  );
}
