import { NavLink, Outlet } from 'react-router-dom';

export default function SettingsLayout() {
  return (
    <div>
      <nav className="settings-nav">
        <NavLink to="about">About</NavLink>
        <NavLink to="footer">Footer</NavLink>
        <NavLink to="intro">Intro Page</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
