import { useState } from 'react';
import Button from './Button';
import '../styles/pwa/permission-slide.css';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function getVisitorId() {
  let id = localStorage.getItem('visitor_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('visitor_id', id); }
  return id;
}

async function track(event, value) {
  const visitor_id = await getVisitorId();
  await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-visit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ visitor_id, event, value }),
  });
}

export default function PermissionSlide({ onDone }) {
  // Angalia hali halisi ya browser
  const notifGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';
  const pwaInstalled = window.matchMedia('(display-mode: standalone)').matches;

  const [step, setStep] = useState(notifGranted ? 2 : 1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function allowNotifications() {
    setError('');
    setLoading(true);

    if (!('Notification' in window)) {
      setError('Browser yako haiunga mkono notifications');
      setLoading(false);
      return;
    }

    try {
      const perm = await Notification.requestPermission();

      if (perm === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
        });
        const json = sub.toJSON();
        const visitor_id = await getVisitorId();

        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscribe-push`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
            visitor_id,
          }),
        });
        await track('notifications', true);

        setLoading(false);
        setStep(2);
        return;
      }

      if (perm === 'denied') {
        setError('Ulikataa. Nenda browser settings kuruhusu.');
      }
    } catch (e) {
      setError('Kosa: ' + e.message);
    }

    setLoading(false);
  }

  async function installPWA() {
    window.dispatchEvent(new Event('trigger-install'));
    await track('pwa');
    // Angalia kama amesakinisha
    setTimeout(() => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        onDone?.();
      } else {
        onDone?.(); // funga hata kama hakusakinisha (anaweza kurudi)
      }
    }, 500);
  }

  function skip() {
    if (step === 1) setStep(2);
    else onDone?.();
  }

  return (
    <div className="permission-slide-overlay">
      <div className="permission-slide">
        {step === 1 && (
          <div className="permission-slide-content">
            <div className="permission-slide-icon">🔔</div>
            <h2>Ruhusu Notifications</h2>
            <p>Pata taarifa za haraka kuhusu daily cards, sala maalumu, na matukio mapya.</p>

            {error && <div className="login-error" style={{ fontSize: '0.75rem' }}>{error}</div>}

            <Button onClick={allowNotifications} fullWidth loading={loading}>
              Ruhusu Notifications
            </Button>

            <button className="permission-skip" onClick={skip}>Baadaye</button>
          </div>
        )}

        {step === 2 && (
          <div className="permission-slide-content">
            <div className="permission-slide-icon">📱</div>
            <h2>Sakinisha App</h2>
            <p>Itumike kama app ya kawaida kwenye simu yako.</p>

            {pwaInstalled ? (
              <div style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: 12 }}>
                ✅ Imeshasakinishwa
              </div>
            ) : null}

            <Button onClick={installPWA} fullWidth>Sakinisha</Button>
            <button className="permission-skip" onClick={skip}>Baadaye</button>
          </div>
        )}
      </div>
    </div>
  );
}
