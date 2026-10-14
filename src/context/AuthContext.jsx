import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const TIMEOUT_MS = 5 * 60 * 1000; // dakika 5

function getSavedAdmin() {
  try {
    const saved = localStorage.getItem('admin');
    const lastActivity = localStorage.getItem('lastActivity');

    if (!saved) return null;

    // Angalia kama amekaa nje zaidi ya dakika 5
    if (lastActivity && Date.now() - Number(lastActivity) > TIMEOUT_MS) {
      localStorage.removeItem('admin');
      localStorage.removeItem('lastActivity');
      return null;
    }

    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(getSavedAdmin);

  function login(adminData) {
    setAdmin(adminData);
    localStorage.setItem('admin', JSON.stringify(adminData));
    localStorage.setItem('lastActivity', String(Date.now()));
  }

  function logout() {
    setAdmin(null);
    localStorage.removeItem('admin');
    localStorage.removeItem('lastActivity');
  }

  useEffect(() => {
    if (!admin) return;

    // Sasisha lastActivity kila dakika
    function updateActivity() {
      if (admin) {
        localStorage.setItem('lastActivity', String(Date.now()));
      }
    }

    const interval = setInterval(updateActivity, 60 * 1000);

    function onVisibility() {
      if (!document.hidden) {
        // Alirudi kwenye tab
        const last = Number(localStorage.getItem('lastActivity') || 0);
        if (last && Date.now() - last > TIMEOUT_MS) {
          logout();
        } else {
          updateActivity();
        }
      }
    }

    function onActivity() {
      updateActivity();
    }

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('click', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('touchstart', onActivity);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('touchstart', onActivity);
    };
  }, [admin]);

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
