import { useEffect, useState } from 'react';
import Button from './Button';
import { supabase } from '../lib/supabase';
import '../styles/pwa/permission.css';

export default function PermissionPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [notifAllowed, setNotifAllowed] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  useEffect(() => {
    // Angalia kama tayari amesakinisha
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPwaInstalled(true);
    }

    // Angalia ruhusa ya notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotifAllowed(true);
    }

    // Sikiliza beforeinstallprompt
    function handler(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener('beforeinstallprompt', handler);

    // Onyesha baada ya sekunde 2
    const timer = setTimeout(() => setShow(true), 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  async function allowNotifications() {
    if (!('Notification' in window)) {
      alert('Browser yako haiunga mkono notifications');
      return;
    }

    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setNotifAllowed(true);
      await registerPush();
    }
  }

  async function registerPush() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
      });

      const json = sub.toJSON();
      const visitor_id = localStorage.getItem('visitor_id') || crypto.randomUUID();
      localStorage.setItem('visitor_id', visitor_id);

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

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-visit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitor_id, event: 'notifications', value: true }),
      });
    } catch (e) {
      console.error('Push registration failed:', e);
    }
  }

  async function installPWA() {
    if (!deferredPrompt) {
      alert('Kwa simu: Menu → "Add to Home Screen"');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setPwaInstalled(true);
      const visitor_id = localStorage.getItem('visitor_id') || crypto.randomUUID();
      localStorage.setItem('visitor_id', visitor_id);
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-visit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitor_id, event: 'pwa' }),
      });
    }
    setDeferredPrompt(null);
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }

  const needsNotif = !notifAllowed;
  const needsPWA = !pwaInstalled;

  if (!show || (!needsNotif && !needsPWA)) return null;

  return (
    <div className="permission-overlay">
      <div className="permission-modal">
        <h3>Karibu KMCA Admin 👋</h3>
        <p className="permission-desc">Tafadhali ruhusu vitu hivi ili upate taarifa:</p>

        <div className="permission-item">
          <div className="permission-icon">🔔</div>
          <div className="permission-info">
            <strong>Notifications</strong>
            <span>Pata taarifa za haraka</span>
          </div>
          {notifAllowed ? (
            <span className="permission-check">✅</span>
          ) : (
            <Button size="sm" onClick={allowNotifications}>Ruhusu</Button>
          )}
        </div>

        <div className="permission-item">
          <div className="permission-icon">📱</div>
          <div className="permission-info">
            <strong>Sakinisha App</strong>
            <span>Itumike kama app ya kawaida</span>
          </div>
          {pwaInstalled ? (
            <span className="permission-check">✅</span>
          ) : (
            <Button size="sm" variant="secondary" onClick={installPWA}>Sakinisha</Button>
          )}
        </div>

        <div className="permission-actions">
          <Button variant="ghost" size="sm" onClick={() => setShow(false)}>
            Baadaye
          </Button>
        </div>
      </div>
    </div>
  );
}
