import { supabase } from './supabase';

export async function listMasomo() {
  const { data, error } = await supabase
    .from('masomo_dominika')
    .select('*')
    .order('tarehe', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createMasomo(payload) {
  const { data, error } = await supabase.from('masomo_dominika').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateMasomo(id, payload) {
  const { data, error } = await supabase.from('masomo_dominika').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMasomo(id) {
  const { error } = await supabase.from('masomo_dominika').delete().eq('id', id);
  if (error) throw error;
}
