import { useEffect, useState } from 'react';
import Button from './Button';
import '../styles/pwa/install-prompt.css';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
    function handler(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    }
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setShow(false);
    setDeferredPrompt(null);
  }

  if (installed || !show) return null;

  return (
    <div className="pwa-banner">
      <span>📱 Sakinisha KMCA Admin kwenye kifaa chako</span>
      <div className="pwa-banner-actions">
        <Button size="sm" variant="ghost" onClick={() => setShow(false)}>Baadaye</Button>
        <Button size="sm" onClick={handleInstall}>Sakinisha</Button>
      </div>
    </div>
  );
}
