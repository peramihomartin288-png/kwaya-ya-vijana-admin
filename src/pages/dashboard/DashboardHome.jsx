import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SkeletonStat } from '../../components/Skeleton';
import PermissionSlide from '../../components/PermissionSlide';
import { supabase } from '../../lib/supabase';
import { getSupabaseUsage, getCloudinaryUsage } from '../../lib/monitors';
import '../../styles/pages/dashboard.css';

const quickActions = [
  { to: '/daily-cards/watakatifu', label: 'Mtakatifu', icon: '✝️' },
  { to: '/daily-cards/masomo', label: 'Masomo', icon: '📖' },
  { to: '/daily-cards/wimbo', label: 'Wimbo', icon: '🎵' },
  { to: '/daily-cards/tafakari', label: 'Tafakari', icon: '💭' },
  { to: '/content/single-image', label: 'Post Mpya', icon: '📝' },
  { to: '/fake-live', label: 'Fake Live', icon: '📺' },
];

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(2)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

function Monitor({ title, icon, used, limit, color }) {
  const pct = limit ? Math.min((used / limit) * 100, 100).toFixed(2) : 0;
  return (
    <div className="monitor-card" style={{ marginBottom: 12, padding: 16, background: 'var(--color-card)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{icon} {title}</h4>
        <span style={{ color: color || 'var(--color-primary)', fontWeight: 'bold' }}>{pct}%</span>
      </div>
      <div style={{ background: 'var(--color-border)', height: 8, borderRadius: 4 }}>
        <div style={{ background: color || 'var(--color-primary)', height: '100%', borderRadius: 4, width: `${pct}%` }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        <span>{formatBytes(used)} / {formatBytes(limit)}</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ visits: 0, pwa: 0, posts: 0, online: 0 });
  const [supa, setSupa] = useState(null);
  const [cloud, setCloud] = useState(null);
  const [uploadcare, setUploadcare] = useState(null);
  const [showPermission, setShowPermission] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // 1. Stats za haraka
        const { count: c1 } = await supabase.from('visits').select('*', { count: 'exact', head: true });
        const { count: c2 } = await supabase.from('pwa_installs').select('*', { count: 'exact', head: true });
        const { count: c3 } = await supabase.from('content').select('*', { count: 'exact', head: true });
        setStats({ visits: c1 || 0, pwa: c2 || 0, posts: c3 || 0 });

        // 2. Vuta data za monitors
        const supaData = await getSupabaseUsage();
        setSupa(supaData);

        const cloudData = await getCloudinaryUsage();
        setCloud(cloudData);

        const ucRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-uploadcare-usage`, {
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }
        });
        if (ucRes.ok) setUploadcare(await ucRes.json());

      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
    
    // Permission slide (kama ilivyokuwa awali)
    const timer = setTimeout(() => {
      const notifGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';
      if (!notifGranted) setShowPermission(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}><SkeletonStat /><SkeletonStat /><SkeletonStat /></div>;
  }

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      {/* 1. Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {quickActions.map((a) => (
          <Link key={a.to} to={a.to} style={{ background: 'var(--color-card)', padding: 16, borderRadius: 'var(--radius-md)', textAlign: 'center', textDecoration: 'none', color: 'var(--color-text)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{a.label}</div>
          </Link>
        ))}
      </div>

      {/* 2. Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'var(--color-card)', padding: 16, borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Watembeleaji</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.visits}</div>
        </div>
        <div style={{ background: 'var(--color-card)', padding: 16, borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>PWA Installs</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.pwa}</div>
        </div>
      </div>

      {/* 3. UPLOADCARE MONITORS (Juu kabisa) */}
      {uploadcare && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>🎵 Uploadcare (Audio & Large Files)</h3>
          <Monitor title="Storage (Accounts 5)" icon="💾" used={uploadcare.storage_used} limit={uploadcare.storage_limit} color="#10b981" />
          <Monitor title="Bandwidth (Mwezi huu)" icon="🌐" used={uploadcare.bandwidth_used} limit={uploadcare.bandwidth_limit} color="#f59e0b" />
        </div>
      )}

      {/* 4. Cloudinary Monitors */}
      {cloud && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>☁️ Cloudinary Storage</h3>
          <Monitor title="Storage" icon="💾" used={cloud.storage_used} limit={cloud.storage_limit} color="#3b82f6" />
          <Monitor title="Bandwidth" icon="🌐" used={cloud.bandwidth_used} limit={cloud.bandwidth_limit} color="#8b5cf6" />
          <Monitor title="Transformations" icon="🔄" used={cloud.transformations_used} limit={cloud.transformations_limit} color="#ec4899" />
        </div>
      )}

      {/* 5. Supabase Monitors */}
      {supa && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>🗄️ Supabase</h3>
          <Monitor title="Database Size" icon="💾" used={supa.db_size} limit={supa.db_limit} color="#10b981" />
          <Monitor title="Storage" icon="📦" used={supa.storage_used} limit={supa.storage_limit} color="#f59e0b" />
        </div>
      )}

      {showPermission && <PermissionSlide onDone={() => setShowPermission(false)} />}
    </div>
  );
}
