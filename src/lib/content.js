import { supabase } from './supabase';

export async function listContent(type) {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('content_type', type)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createContent(payload) {
  const { data, error } = await supabase.from('content').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateContent(id, payload) {
  const { data, error } = await supabase.from('content').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteContent(id) {
  const { error } = await supabase.from('content').delete().eq('id', id);
  if (error) throw error;
}
