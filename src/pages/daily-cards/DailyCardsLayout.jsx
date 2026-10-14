import { NavLink, Outlet } from 'react-router-dom';

export default function DailyCardsLayout() {
  return (
    <div>
      <nav className="daily-cards-nav">
        <NavLink to="watakatifu">Watakatifu</NavLink>
        <NavLink to="masomo">Masomo ya Dominika</NavLink>
        <NavLink to="wimbo">Wimbo wa Siku</NavLink>
        <NavLink to="tafakari">Tafakari</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
