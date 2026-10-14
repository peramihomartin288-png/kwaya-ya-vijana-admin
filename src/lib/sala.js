import { supabase } from './supabase';

export async function listSala() {
  const { data, error } = await supabase.from('sala').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function createSala(p) {
  const { data, error } = await supabase.from('sala').insert(p).select().single();
  if (error) throw error;
  return data;
}
export async function updateSala(id, p) {
  const { data, error } = await supabase.from('sala').update(p).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteSala(id) {
  const { error } = await supabase.from('sala').delete().eq('id', id);
  if (error) throw error;
}
