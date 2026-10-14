import { supabase } from './supabase';

export async function listTafakari() {
  const { data, error } = await supabase
    .from('tafakari')
    .select('*')
    .order('tarehe', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createTafakari(payload) {
  const { data, error } = await supabase.from('tafakari').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateTafakari(id, payload) {
  const { data, error } = await supabase.from('tafakari').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTafakari(id) {
  const { error } = await supabase.from('tafakari').delete().eq('id', id);
  if (error) throw error;
}
