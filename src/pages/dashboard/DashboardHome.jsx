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
  const pct = limit ? ((used / limit) * 100).toFixed(2) : 0;
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
            background: color
              ? `linear-gradient(90deg, ${color}, ${color}cc)`
              : undefined,
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

  return (
    <div className="dashboard">
      {showPermission && <PermissionSlide onDone={() => setShowPermission(false)} />}

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

      {/* BACKEND */}
      <div className="section">
        <div className="monitor-group">
          <div className="monitor-group-title backend">🟢 Backend (Supabase)</div>
          <div className="monitors-grid">
            {supa?.ok ? (
              <>
                <Monitor
                  title="Database"
                  icon="💾"
                  used={supa.database.total}
                  limit={supa.database.limit}
                  color="#4ade80"
                />
                <Monitor
                  title="Bandwidth"
                  icon="🌐"
                  used={supa.bandwidth.used}
                  limit={supa.bandwidth.limit}
                  color="#4ade80"
                />
              </>
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>Inapakia...</p>
            )}
          </div>
        </div>

        {/* CLOUDINARY */}
        <div className="monitor-group">
          <div className="monitor-group-title media">🎬 Picha + Audio (Cloudinary)</div>
          <div className="monitors-grid">
            {cloud?.ok ? (
              <>
                <Monitor
                  title="Storage"
                  icon="☁️"
                  used={cloud.storage.used}
                  limit={cloud.storage.limit}
                  color="#60a5fa"
                />
                <Monitor
                  title="Bandwidth"
                  icon="📡"
                  used={cloud.bandwidth.used}
                  limit={cloud.bandwidth.limit}
                  color="#60a5fa"
                />
                <Monitor
                  title="Transformations"
                  icon="🔄"
                  used={cloud.transformations.used}
                  limit={cloud.transformations.limit}
                  format={(n) => String(n)}
                  color="#60a5fa"
                />
                <Monitor
                  title="Credits"
                  icon="💳"
                  used={cloud.credits.used}
                  limit={cloud.credits.limit}
                  format={(n) => Number(n).toFixed(2)}
                  color="#60a5fa"
                />
              </>
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>Inapakia...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
