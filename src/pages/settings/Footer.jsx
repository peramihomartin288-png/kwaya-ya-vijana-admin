import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Loader from '../../components/Loader';
import { getFooter, saveFooter } from '../../lib/settings';
import '../../styles/pages/watakatifu.css';

const emptyForm = {
  jina: '', maelezo: '', simu: '', email: '', mahali: '',
  facebook: '', instagram: '', youtube: '', tiktok: '', whatsapp: '',
};

export default function Footer() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getFooter();
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
      const saved = await saveFooter(form);
      setForm(saved);
      setMsg('Imehifadhiwa ✅');
    } catch (e) { setMsg('Kosa: ' + e.message); }
    setSaving(false);
  }

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h2>🔗 Footer</h2>
        <Button onClick={handleSave} loading={saving}>Hifadhi</Button>
      </div>

      {msg && <div className="trim-info">{msg}</div>}

      <div className="form-section">
        <div className="form-section-title">Taarifa za Msingi</div>
        <Input label="Jina la Kwaya" value={form.jina} onChange={(v) => set('jina', v)} />
        <Input label="Maelezo" type="textarea" rows={2} value={form.maelezo} onChange={(v) => set('maelezo', v)} />
        <div className="form-row">
          <Input label="Simu" value={form.simu} onChange={(v) => set('simu', v)} />
          <Input label="Email" value={form.email} onChange={(v) => set('email', v)} />
        </div>
        <Input label="Mahali" value={form.mahali} onChange={(v) => set('mahali', v)} />
      </div>

      <div className="form-section">
        <div className="form-section-title">Mitandao ya Kijamii</div>
        <div className="form-row">
          <Input label="Facebook" value={form.facebook} onChange={(v) => set('facebook', v)} />
          <Input label="Instagram" value={form.instagram} onChange={(v) => set('instagram', v)} />
        </div>
        <div className="form-row">
          <Input label="YouTube" value={form.youtube} onChange={(v) => set('youtube', v)} />
          <Input label="TikTok" value={form.tiktok} onChange={(v) => set('tiktok', v)} />
        </div>
        <Input label="WhatsApp" value={form.whatsapp} onChange={(v) => set('whatsapp', v)} />
      </div>
    </div>
  );
}
