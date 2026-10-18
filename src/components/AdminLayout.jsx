import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../styles/layout/layout.css';

const titles = {
  '/': 'Dashboard',
  '/analytics': 'Analytics',
  '/users': 'Watumiaji',
  '/liturgical-colors': 'Rangi za Misa',
  '/live': 'Live',
  '/fake-live': 'Fake Live',
  '/daily-cards/watakatifu': 'Watakatifu',
  '/daily-cards/masomo': 'Masomo ya Dominika',
  '/daily-cards/wimbo': 'Wimbo wa Siku',
  '/daily-cards/tafakari': 'Tafakari',
  '/content/single-image': 'Picha Moja',
  '/content/multi-image': 'Picha Nyingi',
  '/content/single-image-music': 'Picha Moja + Music',
  '/content/multi-image-music': 'Picha Nyingi + Music',
  '/content/video': 'Video',
  '/other-content/sala': 'Sala',
  '/other-content/matukio': 'Matukio',
  '/other-content/polls': 'Polls',
  '/settings/about': 'About',
  '/settings/footer': 'Footer',
  '/settings/intro': 'Intro Page',
  '/media': 'Media Library',
  '/notifications': 'Notifications',
  '/admin-management': 'Msimamizi',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = titles[location.pathname] || 'Admin';

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
