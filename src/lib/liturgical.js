import { supabase } from './supabase';

export async function listLiturgical() {
  const { data, error } = await supabase
    .from('liturgical_colors')
    .select('*')
    .order('tarehe_kuanza', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createLiturgical(payload) {
  const { data, error } = await supabase
    .from('liturgical_colors')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLiturgical(id, payload) {
  const { data, error } = await supabase
    .from('liturgical_colors')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLiturgical(id) {
  const { error } = await supabase
    .from('liturgical_colors')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export const RANGI = [
  { value: 'nyeupe', label: '⚪ Nyeupe', color: '#e0e0e0' },
  { value: 'nyekundu', label: '🔴 Nyekundu', color: '#ef4444' },
  { value: 'zambarau', label: '🟣 Zambarau', color: '#a855f7' },
  { value: 'kijani', label: '🟢 Kijani', color: '#22c55e' },
];
