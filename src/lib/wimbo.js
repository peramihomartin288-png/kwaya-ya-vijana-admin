import { supabase } from './supabase';

export async function listWimbo() {
  const { data, error } = await supabase
    .from('wimbo_wa_siku')
    .select('*')
    .order('tarehe', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createWimbo(payload) {
  const { data, error } = await supabase.from('wimbo_wa_siku').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateWimbo(id, payload) {
  const { data, error } = await supabase.from('wimbo_wa_siku').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteWimbo(id) {
  const { error } = await supabase.from('wimbo_wa_siku').delete().eq('id', id);
  if (error) throw error;
}
