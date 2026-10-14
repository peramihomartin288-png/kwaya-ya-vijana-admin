import { NavLink, Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div>
      <nav className="dashboard-nav">
        <NavLink to="" end>Overview</NavLink>
        <NavLink to="analytics">Analytics</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
