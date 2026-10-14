import { useEffect, useState } from 'react';
import '../styles/pwa/offline.css';

export default function OfflineIndicator() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;

  return (
    <div className="offline-banner">
      ⚠️ Huna mtandao — unaona data ya cache
    </div>
  );
}
