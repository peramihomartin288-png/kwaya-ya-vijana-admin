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

function Monitor({ title, icon, used, limit, color, format }) {
  const pct = limit ? Math.min((used / limit) * 100, 100).toFixed(2) : 0;
  const fmt = format || formatBytes;
  return (
    <div className="monitor-card">
      <div className="monitor-header">
        <h4>{icon} {title}</h4>
        <span className="monitor-badge" style={{ color }}>{pct}%</span>
      </div>
      <div className="monitor-bar">
        <div className="monitor-bar-fill" style={{ width: `${pct}%`, background: color ? `linear-gradient(90deg, ${color}, ${color}cc)` : undefined }}></div>
      </div>
      <div className="monitor-values">
        <span>{fmt(used)} / {fmt(limit)}</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ visits: 0, pwa: 0, posts: 0 });
  const [recent, setRecent] = useState([]);
  const [supa, setSupa] = useState(null);
  const [cloud, setCloud] = useState(null);
  const [uploadcare, setUploadcare] = useState(null);
  const [showPermission, setShowPermission] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { count: c1 } = await supabase.from('visits').select('*', { count: 'exact', head: true });
        const { count: c2 } = await supabase.from('pwa_installs').select('*', { count: 'exact', head: true });
        const { count: c3 } = await supabase.from('content').select('*', { count: 'exact', head: true });
        setStats({ visits: c1 || 0, pwa: c2 || 0, posts: c3 || 0 });

        const { data: recentPosts } = await supabase.from('content').select('id, head, content_type').order('created_at', { ascending: false }).limit(5);
        setRecent(recentPosts || []);

        const supaData = await getSupabaseUsage();
        setSupa(supaData);

        const cloudData = await getCloudinaryUsage();
        setCloud(cloudData);

        try {
          const ucRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-uploadcare-usage`, {
            headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` }
          });
          if (ucRes.ok) setUploadcare(await ucRes.json());
        } catch (err) {
          console.error("Uploadcare fetch error:", err);
        }

      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();

    const timer = setTimeout(() => {
      const notifGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';
      if (!notifGranted) setShowPermission(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className="stats-grid">
        {loading ? <><SkeletonStat /><SkeletonStat /><SkeletonStat /></> : (
          <>
            <div className="stat-card"><span className="stat-icon">👥</span><span className="stat-value">{stats.visits}</span><span className="stat-label">Watembeleaji</span></div>
            <div className="stat-card"><span className="stat-icon">📱</span><span className="stat-value">{stats.pwa}</span><span className="stat-label">PWA Installs</span></div>
            <div className="stat-card"><span className="stat-icon">📝</span><span className="stat-value">{stats.posts}</span><span className="stat-label">Posts</span></div>
          </>
        )}
      </div>

      <div className="section">
        <div className="section-title">⚡ Vitendo vya Haraka</div>
        <div className="quick-actions">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to} className="quick-btn"><span className="icon">{a.icon}</span><span>{a.label}</span></Link>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-title">🆕 Posts za Hivi Karibuni</div>
        {loading ? <div className="skeleton skeleton-line" style={{ width: '100%' }}></div> : recent.length === 0 ? <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Hakuna posts bado</p> : recent.map((r) => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
            <span>{r.head}</span><span className="badge badge-gray">{r.content_type}</span>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-title">🗄️ Supabase (Backend)</div>
        <div className="monitors-grid">
          {supa?.ok ? (
            <>
              <Monitor title="Database" icon="💾" used={supa.database?.total || 0} limit={supa.database?.limit || 536870912} color="#4ade80" />
              <Monitor title="Bandwidth" icon="🌐" used={supa.bandwidth?.used || 0} limit={supa.bandwidth?.limit || 5368709120} color="#4ade80" />
            </>
          ) : <p style={{ color: 'var(--color-text-muted)' }}>Inapakia...</p>}
        </div>
      </div>

      <div className="section">
        <div className="section-title">🎵 Uploadcare (Audio & Large Files)</div>
        <div className="monitors-grid">
          {uploadcare ? (
            <>
              <Monitor title="Storage (5 Accounts)" icon="💾" used={uploadcare.storage_used} limit={uploadcare.storage_limit} color="#10b981" />
              <Monitor title="Bandwidth (Mwezi huu)" icon="🌐" used={uploadcare.bandwidth_used} limit={uploadcare.bandwidth_limit} color="#f59e0b" />
            </>
          ) : <p style={{ color: 'var(--color-text-muted)' }}>Inapakia...</p>}
        </div>
      </div>

      {cloud?.accounts && cloud.accounts.map((acc, index) => (
        <div className="section" key={index}>
          <div className="section-title">☁️ Cloudinary: {acc.label}</div>
          {acc.error ? (
            <p style={{ color: 'var(--color-danger)' }}>Kosa: {acc.error}</p>
          ) : (
            <div className="monitors-grid">
              <Monitor title="Storage" icon="💾" used={acc.storage?.used || 0} limit={acc.storage?.limit || 1} color="#3b82f6" />
              <Monitor title="Bandwidth" icon="🌐" used={acc.bandwidth?.used || 0} limit={acc.bandwidth?.limit || 1} color="#8b5cf6" />
              <Monitor title="Transformations" icon="🔄" used={acc.transformations?.used || 0} limit={acc.transformations?.limit || 25000} color="#ec4899" />
              <Monitor title="Credits" icon="💳" used={acc.credits?.used || 0} limit={acc.credits?.limit || 25} color="#eab308" format={(v) => Number(v).toFixed(2)} />
            </div>
          )}
        </div>
      ))}

      {showPermission && <PermissionSlide onDone={() => setShowPermission(false)} />}
    </div>
  );
}
