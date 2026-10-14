import { supabase } from './supabase';

export async function listWatakatifu() {
  const { data, error } = await supabase
    .from('watakatifu')
    .select('*')
    .order('tarehe', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createWatakatifu(payload) {
  const { data, error } = await supabase.from('watakatifu').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateWatakatifu(id, payload) {
  const { data, error } = await supabase.from('watakatifu').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteWatakatifu(id) {
  const { error } = await supabase.from('watakatifu').delete().eq('id', id);
  if (error) throw error;
}
