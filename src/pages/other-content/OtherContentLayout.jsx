import { NavLink, Outlet } from 'react-router-dom';

export default function OtherContentLayout() {
  return (
    <div>
      <nav className="other-content-nav">
        <NavLink to="sala">Sala</NavLink>
        <NavLink to="matukio">Matukio</NavLink>
        <NavLink to="polls">Polls</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
