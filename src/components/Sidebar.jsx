import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menu = [
  {
    title: 'Main', icon: '🏠',
    items: [
      { to: '/', label: 'Dashboard', icon: '📊', end: true },
      { to: '/analytics', label: 'Analytics', icon: '📈' },
      { to: '/users', label: 'Watumiaji', icon: '👥' },
      { to: '/live', label: 'Live', icon: '🔴' },
      { to: '/fake-live', label: 'Fake Live', icon: '📺' },
    ],
  },
  {
    title: 'Daily Cards', icon: '📅',
    items: [
      { to: '/daily-cards/watakatifu', label: 'Watakatifu', icon: '✝️' },
      { to: '/daily-cards/masomo', label: 'Masomo ya Dominika', icon: '📖' },
      { to: '/daily-cards/wimbo', label: 'Wimbo wa Siku', icon: '🎵' },
      { to: '/daily-cards/tafakari', label: 'Tafakari', icon: '💭' },
    ],
  },
  {
    title: 'Content', icon: '🖼️',
    items: [
      { to: '/content/single-image', label: 'Picha Moja', icon: '🖼️' },
      { to: '/content/multi-image', label: 'Picha Nyingi', icon: '🖼️🖼️' },
      { to: '/content/single-image-music', label: 'Picha + Music', icon: '🎶' },
      { to: '/content/multi-image-music', label: 'Picha Nyingi + Music', icon: '🎶' },
      { to: '/content/video', label: 'Video', icon: '🎬' },
    ],
  },
  {
    title: 'Other Content', icon: '📁',
    items: [
      { to: '/other-content/sala', label: 'Sala', icon: '🙏' },
      { to: '/other-content/matukio', label: 'Matukio', icon: '📅' },
      { to: '/other-content/polls', label: 'Polls', icon: '📊' },
    ],
  },
  {
    title: 'Settings', icon: '⚙️',
    items: [
      { to: '/settings/about', label: 'About', icon: 'ℹ️' },
      { to: '/settings/footer', label: 'Footer', icon: '🔗' },
      { to: '/settings/intro', label: 'Intro Page', icon: '🎨' },
      { to: '/media', label: 'Media Library', icon: '📁' },
      { to: '/notifications', label: 'Notifications', icon: '🔔' },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(null);

  function handleLogout() { logout(); navigate('/login'); }
  function toggleSection(title) { setOpenSection(openSection === title ? null : title); }

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/icons/icon.svg" alt="KMCA" className="sidebar-logo-img" />
          <div className="sidebar-brand">
            <h3>KMCA</h3>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menu.map((section) => (
            <div key={section.title} className="nav-section">
              <button
                className={`nav-group-btn ${openSection === section.title ? 'open' : ''}`}
                onClick={() => toggleSection(section.title)}
              >
                <span className="icon">{section.icon}</span>
                <span className="label">{section.title}</span>
                <span className="chevron">{openSection === section.title ? '▾' : '▸'}</span>
              </button>

              {openSection === section.title && (
                <div className="nav-submenu">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <span className="icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>🚪 Toka</button>
        </div>
      </aside>
    </>
  );
}
