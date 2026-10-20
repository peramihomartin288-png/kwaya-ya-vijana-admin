import { Routes, Route, Navigate } from 'react-router-dom';
import Intro from './pages/Intro';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

import DashboardHome from './pages/dashboard/DashboardHome';
import Analytics from './pages/dashboard/Analytics';

import Users from './pages/Users';
import LiturgicalColors from './pages/LiturgicalColors';

import Watakatifu from './pages/daily-cards/Watakatifu';
import MasomoDominika from './pages/daily-cards/MasomoDominika';
import WimboWaSiku from './pages/daily-cards/WimboWaSiku';
import Tafakari from './pages/daily-cards/Tafakari';

import SingleImage from './pages/content/SingleImage';
import MultiImage from './pages/content/MultiImage';
import SingleImageMusic from './pages/content/SingleImageMusic';
import MultiImageMusic from './pages/content/MultiImageMusic';
import Video from './pages/content/Video';

import Sala from './pages/other-content/Sala';
import Matukio from './pages/other-content/Matukio';
import Polls from './pages/other-content/Polls';

import About from './pages/settings/About';
import Footer from './pages/settings/Footer';
import IntroPage from './pages/settings/IntroPage';

import Live from './pages/Live';
import FakeLive from './pages/FakeLive';
import MediaLibrary from './pages/MediaLibrary';
import Notifications from './pages/Notifications';
import AdminManagement from './pages/AdminManagement';

export default function Router() {
  return (
    <Routes>
      <Route path="/intro" element={<Intro />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/analytics" element={<Analytics />} />

        <Route path="/users" element={<Users />} />
        <Route path="/liturgical-colors" element={<LiturgicalColors />} />

        <Route path="/daily-cards/watakatifu" element={<Watakatifu />} />
        <Route path="/daily-cards/masomo" element={<MasomoDominika />} />
        <Route path="/daily-cards/wimbo" element={<WimboWaSiku />} />
        <Route path="/daily-cards/tafakari" element={<Tafakari />} />

        <Route path="/content/single-image" element={<SingleImage />} />
        <Route path="/content/multi-image" element={<MultiImage />} />
        <Route path="/content/video" element={<Video />} />

        <Route path="/other-content/sala" element={<Sala />} />
        <Route path="/other-content/matukio" element={<Matukio />} />
        <Route path="/other-content/polls" element={<Polls />} />

        <Route path="/settings/about" element={<About />} />
        <Route path="/settings/footer" element={<Footer />} />
        <Route path="/settings/intro" element={<IntroPage />} />

        <Route path="/live" element={<Live />} />
        <Route path="/fake-live" element={<FakeLive />} />
        <Route path="/media" element={<MediaLibrary />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin-management" element={<AdminManagement />} />
        <Route path="/admin-management" element={<AdminManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/intro" replace />} />
    </Routes>
  );
}
