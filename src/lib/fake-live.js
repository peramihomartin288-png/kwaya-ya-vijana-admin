import { supabase } from './supabase';

export async function listFakeLive() {
  const { data, error } = await supabase
    .from('fake_live')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createFakeLive(payload) {
  const { data, error } = await supabase.from('fake_live').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateFakeLive(id, payload) {
  const { data, error } = await supabase.from('fake_live').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteFakeLive(id) {
  const { error } = await supabase.from('fake_live').delete().eq('id', id);
  if (error) throw error;
}
