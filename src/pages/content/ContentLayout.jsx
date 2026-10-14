import { NavLink, Outlet } from 'react-router-dom';

export default function ContentLayout() {
  return (
    <div>
      <nav className="content-nav">
        <NavLink to="single-image">Picha Moja</NavLink>
        <NavLink to="multi-image">Picha Nyingi</NavLink>
        <NavLink to="single-image-music">Picha Moja + Music</NavLink>
        <NavLink to="multi-image-music">Picha Nyingi + Music</NavLink>
        <NavLink to="video">Video</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
