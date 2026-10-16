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

function Monitor({ title, icon, used, limit, format, color }) {
  const pct = limit ? Math.min((used / limit) * 100, 100).toFixed(2) : 0;
  const fmt = format || formatBytes;
  return (
    <div className="monitor-card">
      <div className="monitor-header">
        <h4>{icon} {title}</h4>
        <span className="monitor-badge" style={{ color }}>{pct}%</span>
      </div>
      <div className="monitor-bar">
        <div
          className="monitor-bar-fill"
          style={{
            width: `${pct}%`,
            background: color ? `linear-gradient(90deg, ${color}, ${color}cc)` : undefined,
          }}
        ></div>
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
  const [stats, setStats] = useState({ visits: 0, pwa: 0, posts: 0, online: 0 });
  const [recent, setRecent] = useState([]);
  const [supa, setSupa] = useState(null);
  const [cloud, setCloud] = useState(null);
  const [showPermission, setShowPermission] = useState(false);
  const [view, setView] = useState('zote'); // 'zote' | 'picha' | 'video'

  useEffect(() => {
    async function load() {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [v, p, c, u, r, s, cl] = await Promise.all([
        supabase.from('visits').select('*', { count: 'exact', head: true }).eq('date', today),
        supabase.from('pwa_installs').select('*', { count: 'exact', head: true }),
        supabase.from('content').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('is_online').eq('is_online', true),
        supabase.from('content').select('id, head, content_type, created_at').order('created_at', { ascending: false }).limit(5),
        getSupabaseUsage(),
        getCloudinaryUsage(),
      ]);

      setStats({
        visits: v.count || 0,
        pwa: p.count || 0,
        posts: c.count || 0,
        online: u.data?.length || 0,
      });
      setRecent(r.data || []);
      setSupa(s);
      setCloud(cl);
      setLoading(false);
    }
    load();

    const timer = setTimeout(() => {
      const notifGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';
      const pwaInstalled = window.matchMedia('(display-mode: standalone)').matches;
      if (!notifGranted || !pwaInstalled) setShowPermission(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  function cycleView() {
    setView((v) => (v === 'zote' ? 'picha' : v === 'picha' ? 'video' : 'zote'));
  }

  const viewLabel =
    view === 'zote' ? '📦 Zote' :
    view === 'picha' ? '🖼️ Picha/Audio' :
    '🎬 Video';

  const acc1 = cloud?.accounts?.find((a) => a.name === 'picha_audio');
  const acc2 = cloud?.accounts?.find((a) => a.name === 'video');

  // Jumla ya account 2, limit × 2
  const total = {
    storage: {
      used: (acc1?.storage?.used || 0) + (acc2?.storage?.used || 0),
      limit: 50 * 1024 * 1024 * 1024, // 50 GB
    },
    bandwidth: {
      used: (acc1?.bandwidth?.used || 0) + (acc2?.bandwidth?.used || 0),
      limit: 50 * 1024 * 1024 * 1024, // 50 GB
    },
    transformations: {
      used: (acc1?.transformations?.used || 0) + (acc2?.transformations?.used || 0),
      limit: 50000, // 25,000 × 2
    },
    credits: {
      used: (acc1?.credits?.used || 0) + (acc2?.credits?.used || 0),
      limit: 50, // 25 × 2
    },
  };

  return (
    <div className="dashboard">
      {showPermission && <PermissionSlide onDone={() => setShowPermission(false)} />}

      {/* Stats */}
      <div className="stats-grid">
        {loading ? (
          <><SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat /></>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info"><h3>{stats.visits}</h3><p>Watumiaji Leo</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📱</div>
              <div className="stat-info"><h3>{stats.pwa}</h3><p>PWA Installs</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🟢</div>
              <div className="stat-info"><h3>{stats.online}</h3><p>Online Sasa</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info"><h3>{stats.posts}</h3><p>Post Zote</p></div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="section">
        <div className="section-title">⚡ Vitendo vya Haraka</div>
        <div className="quick-actions">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to} className="quick-btn">
              <span className="icon">{a.icon}</span>
              <span>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="section">
        <div className="section-title">🆕 Posts za Hivi Karibuni</div>
        {loading ? (
          <div className="skeleton skeleton-line" style={{ width: '100%' }}></div>
        ) : recent.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Hakuna posts bado</p>
        ) : (
          recent.map((r) => (
            <div key={r.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.9rem',
            }}>
              <span>{r.head}</span>
              <span className="badge badge-gray">{r.content_type}</span>
            </div>
          ))
        )}
      </div>

      {/* Backend */}
      <div className="section">
        <div className="monitor-group">
          <div className="monitor-group-title backend">🟢 Backend (Supabase)</div>
          <div className="monitors-grid">
            {supa?.ok ? (
              <>
                <Monitor title="Database" icon="💾" used={supa.database.total} limit={supa.database.limit} color="#4ade80" />
                <Monitor title="Bandwidth" icon="🌐" used={supa.bandwidth.used} limit={supa.bandwidth.limit} color="#4ade80" />
              </>
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>Inapakia...</p>
            )}
          </div>
        </div>
      </div>

      {/* Cloudinary — na button */}
      <div className="section">
        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span>☁️ Cloudinary Storage</span>
          <button
            onClick={cycleView}
            style={{
              background: 'rgba(147, 51, 234, 0.15)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {viewLabel} ▾
          </button>
        </div>

        {cloud?.ok ? (
          <>
            {view === 'zote' && (
              <div className="monitors-grid">
                <Monitor title="Storage" icon="💾" used={total.storage.used} limit={total.storage.limit} color="#9333ea" />
                <Monitor title="Bandwidth" icon="📡" used={total.bandwidth.used} limit={total.bandwidth.limit} color="#9333ea" />
                <Monitor title="Transformations" icon="🔄" used={total.transformations.used} limit={total.transformations.limit} format={(n) => String(n)} color="#9333ea" />
                <Monitor title="Credits" icon="💳" used={total.credits.used} limit={total.credits.limit} format={(n) => Number(n).toFixed(2)} color="#9333ea" />
              </div>
            )}

            {view === 'picha' && acc1 && !acc1.error && (
              <div className="monitors-grid">
                <Monitor title="Storage" icon="💾" used={acc1.storage.used} limit={acc1.storage.limit} color="#60a5fa" />
                <Monitor title="Bandwidth" icon="📡" used={acc1.bandwidth.used} limit={acc1.bandwidth.limit} color="#60a5fa" />
                <Monitor title="Transformations" icon="🔄" used={acc1.transformations.used} limit={acc1.transformations.limit} format={(n) => String(n)} color="#60a5fa" />
                <Monitor title="Credits" icon="💳" used={acc1.credits.used} limit={acc1.credits.limit} format={(n) => Number(n).toFixed(2)} color="#60a5fa" />
              </div>
            )}

            {view === 'video' && acc2 && !acc2.error && (
              <div className="monitors-grid">
                <Monitor title="Storage" icon="💾" used={acc2.storage.used} limit={acc2.storage.limit} color="#f59e0b" />
                <Monitor title="Bandwidth" icon="📡" used={acc2.bandwidth.used} limit={acc2.bandwidth.limit} color="#f59e0b" />
                <Monitor title="Transformations" icon="🔄" used={acc2.transformations.used} limit={acc2.transformations.limit} format={(n) => String(n)} color="#f59e0b" />
                <Monitor title="Credits" icon="💳" used={acc2.credits.used} limit={acc2.credits.limit} format={(n) => Number(n).toFixed(2)} color="#f59e0b" />
              </div>
            )}

            {((view === 'picha' && (!acc1 || acc1.error)) || (view === 'video' && (!acc2 || acc2.error))) && (
              <p style={{ color: 'var(--color-text-muted)' }}>Kosa la kupata data</p>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>Inapakia...</p>
        )}
      </div>
    </div>
  );
}
