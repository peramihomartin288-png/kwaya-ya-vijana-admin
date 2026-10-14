import { AuthProvider } from './context/AuthContext';
import Router from './router';
import OfflineIndicator from './components/OfflineIndicator';
import InstallPWAHandler from './components/InstallPWAHandler';

export default function App() {
  return (
    <AuthProvider>
      <OfflineIndicator />
      <Router />
      <InstallPWAHandler />
    </AuthProvider>
  );
}
