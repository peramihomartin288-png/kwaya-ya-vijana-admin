import { supabase } from './supabase';

export async function listMatukio() {
  const { data, error } = await supabase.from('matukio').select('*').order('tarehe_kuanza', { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function createMatukio(p) {
  const { data, error } = await supabase.from('matukio').insert(p).select().single();
  if (error) throw error;
  return data;
}
export async function updateMatukio(id, p) {
  const { data, error } = await supabase.from('matukio').update(p).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteMatukio(id) {
  const { error } = await supabase.from('matukio').delete().eq('id', id);
  if (error) throw error;
}
