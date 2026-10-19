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
  const [view, setView] = useState('zote');

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

  const acc1 = cloud?.accounts?.find((a) => a.name === 'picha_audio');
  const acc2 = cloud?.accounts?.find((a) => a.name === 'video');
  const acc3 = cloud?.accounts?.find((a) => a.name === 'picha_audio_dharura');
  const acc4 = cloud?.accounts?.find((a) => a.name === 'video_dharura');

  const total = {
    storage: { used: (acc1?.storage?.used || 0) + (acc2?.storage?.used || 0) + (acc3?.storage?.used || 0) + (acc4?.storage?.used || 0), limit: 100 * 1024 * 1024 * 1024 },
    bandwidth: { used: (acc1?.bandwidth?.used || 0) + (acc2?.bandwidth?.used || 0) + (acc3?.bandwidth?.used || 0) + (acc4?.bandwidth?.used || 0), limit: 100 * 1024 * 1024 * 1024 },
    transformations: { used: (acc1?.transformations?.used || 0) + (acc2?.transformations?.used || 0) + (acc3?.transformations?.used || 0) + (acc4?.transformations?.used || 0), limit: 100000 },
    credits: { used: (acc1?.credits?.used || 0) + (acc2?.credits?.used || 0) + (acc3?.credits?.used || 0) + (acc4?.credits?.used || 0), limit: 100 },
  };

  const dharura = {
    storage: { used: (acc3?.storage?.used || 0) + (acc4?.storage?.used || 0), limit: 50 * 1024 * 1024 * 1024 },
    bandwidth: { used: (acc3?.bandwidth?.used || 0) + (acc4?.bandwidth?.used || 0), limit: 50 * 1024 * 1024 * 1024 },
    transformations: { used: (acc3?.transformations?.used || 0) + (acc4?.transformations?.used || 0), limit: 50000 },
    credits: { used: (acc3?.credits?.used || 0) + (acc4?.credits?.used || 0), limit: 50 },
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

      {/* Supabase Monitors */}
      <div className="section">
        <div className="section-title">🟢 Supabase (Backend)</div>
        <div className="monitors-grid">
          {supa?.ok ? (
            <>
              <Monitor title="Database" icon="💾" used={supa.database?.total || 0} limit={supa.database?.limit || 536870912} color="#4ade80" />
              <Monitor title="Bandwidth" icon="🌐" used={supa.bandwidth?.used || 0} limit={supa.bandwidth?.limit || 5368709120} color="#4ade80" />
            </>
          ) : (
            <p style={{ color: 'var(--color-text-muted)' }}>Inapakia...</p>
          )}
        </div>
      </div>

      {/* Cloudinary Monitors */}
      <div className="section">
        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span>☁️ Cloudinary Storage</span>
          <select
            value={view}
            onChange={(e) => setView(e.target.value)}
            style={{
              background: 'rgba(147, 51, 234, 0.15)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              padding: '6px 32px 6px 14px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23a0a0b0\' stroke-width=\'2\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              backgroundSize: '14px',
              outline: 'none',
            }}
          >
            <option value="zote">📦 Zote (100 GB)</option>
            <option value="video">🎬 Video (25 GB)</option>
            <option value="picha">🖼️ Picha/Audio (25 GB)</option>
            <option value="dharura">🚨 Dharura (50 GB)</option>
          </select>
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

            {view === 'video' && acc2 && !acc2.error && (
              <div className="monitors-grid">
                <Monitor title="Storage" icon="💾" used={acc2.storage.used} limit={acc2.storage.limit} color="#f59e0b" />
                <Monitor title="Bandwidth" icon="📡" used={acc2.bandwidth.used} limit={acc2.bandwidth.limit} color="#f59e0b" />
                <Monitor title="Transformations" icon="🔄" used={acc2.transformations.used} limit={acc2.transformations.limit} format={(n) => String(n)} color="#f59e0b" />
                <Monitor title="Credits" icon="💳" used={acc2.credits.used} limit={acc2.credits.limit} format={(n) => Number(n).toFixed(2)} color="#f59e0b" />
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

            {view === 'dharura' && (
              <div className="monitors-grid">
                <Monitor title="Storage" icon="💾" used={dharura.storage.used} limit={dharura.storage.limit} color="#ef4444" />
                <Monitor title="Bandwidth" icon="📡" used={dharura.bandwidth.used} limit={dharura.bandwidth.limit} color="#ef4444" />
                <Monitor title="Transformations" icon="🔄" used={dharura.transformations.used} limit={dharura.transformations.limit} format={(n) => String(n)} color="#ef4444" />
                <Monitor title="Credits" icon="💳" used={dharura.credits.used} limit={dharura.credits.limit} format={(n) => Number(n).toFixed(2)} color="#ef4444" />
              </div>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--color-text-muted)' }}>Inapakia...</p>
        )}
      </div>
    </div>
  );
}
