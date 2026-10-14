import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/intro.css';

export default function Intro() {
  const navigate = useNavigate();

  useEffect(() => {
    // Kama tayari ameona intro kwenye session hii, ruka
    const seen = sessionStorage.getItem('intro_seen');
    if (seen) {
      const admin = localStorage.getItem('admin');
      navigate(admin ? '/' : '/login', { replace: true });
      return;
    }

    sessionStorage.setItem('intro_seen', '1');

    const admin = localStorage.getItem('admin');
    const timer = setTimeout(() => {
      navigate(admin ? '/' : '/login', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="intro-page">
      <img src="/icons/icon.svg" alt="KMCA" className="intro-logo-img" />
      <h1 className="intro-name">KMCA</h1>
      <p className="intro-tag">Kwaya ya Vijana ya Mtakatifu Carlo Acutis</p>
      <div className="intro-loader">
        <div className="intro-loader-bar"></div>
      </div>
    </div>
  );
}
