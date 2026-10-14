import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, onMenuClick }) {
  const { admin } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Menu">
          ☰
        </button>
        <h2 className="topbar-title">{title}</h2>
      </div>

      <div className="topbar-right">
        <div className="admin-badge">
          <div className="admin-avatar">
            {admin?.jina?.charAt(0)?.toUpperCase()}
          </div>
          <span>{admin?.jina}</span>
        </div>
      </div>
    </header>
  );
}
