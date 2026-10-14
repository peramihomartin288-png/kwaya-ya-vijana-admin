import { supabase } from './supabase';

export async function getTodayVisits() {
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .eq('date', today);
  return count || 0;
}

export async function getPWAInstalls() {
  const { count } = await supabase
    .from('pwa_installs')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

export async function getTotalPosts() {
  const { count } = await supabase
    .from('content')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

export async function getVisitsLast7Days() {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const { data } = await supabase
    .from('visits')
    .select('date')
    .in('date', dates);

  const counts = dates.map(date => ({
    date: date.slice(5),
    visits: (data || []).filter(v => v.date === date).length,
  }));

  return counts;
}

export async function getContentBreakdown() {
  const { data } = await supabase.from('content').select('content_type');
  const counts = {};
  (data || []).forEach(c => {
    counts[c.content_type] = (counts[c.content_type] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}
