import { supabase } from './supabase';

export async function listLive() {
  const { data, error } = await supabase
    .from('live')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createLive(payload) {
  const { data, error } = await supabase.from('live').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateLive(id, payload) {
  const { data, error } = await supabase.from('live').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteLive(id) {
  const { error } = await supabase.from('live').delete().eq('id', id);
  if (error) throw error;
}
