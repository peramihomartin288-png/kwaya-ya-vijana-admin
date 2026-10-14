import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import '../../styles/pages/dashboard.css';

const COLORS = ['#9333ea', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);
  const [visitsData, setVisitsData] = useState([]);
  const [contentData, setContentData] = useState([]);
  const [votesData, setVotesData] = useState([]);
  const [userStats, setUserStats] = useState({ total: 0, online: 0, pwa: 0, notif: 0, voted: 0, shared: 0, commented: 0 });

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Visits
      const dates = [];
      for (let i = range - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }
      const { data: visits } = await supabase.from('visits').select('date').in('date', dates);
      setVisitsData(dates.map((date) => ({
        date: date.slice(5),
        visits: (visits || []).filter((v) => v.date === date).length,
      })));

      // Content types
      const { data: content } = await supabase.from('content').select('content_type');
      const counts = {};
      (content || []).forEach((c) => { counts[c.content_type] = (counts[c.content_type] || 0) + 1; });
      setContentData(Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })));

      // Polls
      const { data: polls } = await supabase.from('polls').select('id, swali');
      const voteData = await Promise.all((polls || []).map(async (p) => {
        const { count } = await supabase.from('poll_votes').select('*', { count: 'exact', head: true }).eq('poll_id', p.id);
        return { name: p.swali.slice(0, 25), votes: count || 0 };
      }));
      setVotesData(voteData);

      // User stats
      const { data: users } = await supabase.from('users').select('*');
      setUserStats({
        total: users?.length || 0,
        online: users?.filter((u) => u.is_online).length || 0,
        pwa: users?.filter((u) => u.pwa_installed).length || 0,
        notif: users?.filter((u) => u.notifications_on).length || 0,
        voted: users?.filter((u) => u.has_voted).length || 0,
        shared: users?.filter((u) => u.has_shared).length || 0,
        commented: users?.filter((u) => u.has_commented).length || 0,
      });

      setLoading(false);
    }
    load();
  }, [range]);

  return (
    <div className="dashboard">
      {/* Range filter */}
      <div className="section">
        <div className="section-title">📅 Kipindi</div>
        <div className="media-filters">
          {[7, 14, 30, 90].map((r) => (
            <button key={r} className={`media-tab ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>
              Siku {r}
            </button>
          ))}
        </div>
      </div>

      {/* User Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-info"><h3>{userStats.total}</h3><p>Watumiaji Wote</p></div></div>
        <div className="stat-card"><div className="stat-icon">🟢</div><div className="stat-info"><h3>{userStats.online}</h3><p>Online</p></div></div>
        <div className="stat-card"><div className="stat-icon">📱</div><div className="stat-info"><h3>{userStats.pwa}</h3><p>PWA</p></div></div>
        <div className="stat-card"><div className="stat-icon">🔔</div><div className="stat-info"><h3>{userStats.notif}</h3><p>Notifications</p></div></div>
        <div className="stat-card"><div className="stat-icon">🗳️</div><div className="stat-info"><h3>{userStats.voted}</h3><p>Wamepiga Kura</p></div></div>
        <div className="stat-card"><div className="stat-icon">📤</div><div className="stat-info"><h3>{userStats.shared}</h3><p>Wameshare</p></div></div>
        <div className="stat-card"><div className="stat-icon">💬</div><div className="stat-info"><h3>{userStats.commented}</h3><p>Comments</p></div></div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="section">
          <div className="section-title">📈 Visits — Siku {range}</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={visitsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="date" stroke="#a0a0b0" fontSize={11} />
              <YAxis stroke="#a0a0b0" fontSize={11} />
              <Tooltip contentStyle={{ background: '#16213e', border: '1px solid #2a2a4a', borderRadius: 8 }} />
              <Line type="monotone" dataKey="visits" stroke="#9333ea" strokeWidth={2} dot={{ fill: '#9333ea' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="section">
          <div className="section-title">📊 Content kwa Aina</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={contentData} dataKey="value" nameKey="name" outerRadius={90} label>
                {contentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#16213e', border: '1px solid #2a2a4a', borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {votesData.length > 0 && (
        <div className="section">
          <div className="section-title">🗳️ Kura kwa Poll</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={votesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
              <XAxis dataKey="name" stroke="#a0a0b0" fontSize={11} />
              <YAxis stroke="#a0a0b0" fontSize={11} />
              <Tooltip contentStyle={{ background: '#16213e', border: '1px solid #2a2a4a', borderRadius: 8 }} />
              <Bar dataKey="votes" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
