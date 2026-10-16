import { useState, useEffect } from 'react';
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
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('visitor_id', id);
  }
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
    body: JSON.stringify({ visitor_id, event, value, is_admin: true }),
  });
}

export default function PermissionSlide({ onDone }) {
  const pwaInstalled = window.matchMedia('(display-mode: standalone)').matches;
  const notifGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';

  // Hatua 1 = Install, Hatua 2 = Notifications
  const [step, setStep] = useState(pwaInstalled ? 2 : 1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Kama zote zimekamilika, funga
  useEffect(() => {
    if (pwaInstalled && notifGranted) {
      onDone?.();
    }
  }, [pwaInstalled, notifGranted, onDone]);

  async function installPWA() {
    window.dispatchEvent(new Event('trigger-install'));
    try {
      await track('pwa');
    } catch {}

    // Subiri kidogo kwa install dialog, kisha nenda step 2
    setTimeout(() => setStep(2), 2000);
  }

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
        // Fanya subscription (background)
        setTimeout(async () => {
          try {
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
          } catch (e) {
            console.error('Push subscription error:', e);
          }
        }, 100);

        setLoading(false);
        onDone?.();
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

  // "Baadaye" — HAINA kuweka flag (inarudi tena)
  function skipPWA() {
    setStep(2);
  }

  function skipNotif() {
    onDone?.();
  }

  return (
    <div className="permission-slide-overlay">
      <div className="permission-slide">
        {/* Step 1 — Install PWA */}
        {step === 1 && (
          <div className="permission-slide-content">
            <div className="permission-slide-icon">📱</div>
            <h2>Sakinisha App</h2>
            <p>Itumike kama app ya kawaida kwenye simu yako — bila browser.</p>

            {pwaInstalled && (
              <div style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: 12 }}>
                ✅ Imeshasakinishwa
              </div>
            )}

            <Button onClick={installPWA} fullWidth>Sakinisha</Button>
            <button className="permission-skip" onClick={skipPWA}>Baadaye</button>
          </div>
        )}

        {/* Step 2 — Notifications */}
        {step === 2 && (
          <div className="permission-slide-content">
            <div className="permission-slide-icon">🔔</div>
            <h2>Ruhusu Notifications</h2>
            <p>Pata taarifa za haraka kuhusu daily cards, sala maalumu, na matukio mapya.</p>

            {error && <div className="login-error" style={{ fontSize: '0.75rem' }}>{error}</div>}

            {notifGranted && (
              <div style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: 12 }}>
                ✅ Imesharuhusiwa
              </div>
            )}

            <Button onClick={allowNotifications} fullWidth loading={loading}>
              Ruhusu Notifications
            </Button>

            <button className="permission-skip" onClick={skipNotif}>Baadaye</button>
          </div>
        )}
      </div>
    </div>
  );
}
