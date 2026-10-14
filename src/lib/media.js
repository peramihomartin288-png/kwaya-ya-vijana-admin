import { supabase } from './supabase';

export async function listMedia() {
  const { data, error } = await supabase
    .from('media_library')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveMedia({ url, type, used_in = null }) {
  const { data, error } = await supabase
    .from('media_library')
    .insert({ url, type, used_in })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMedia(id) {
  const { error } = await supabase.from('media_library').delete().eq('id', id);
  if (error) throw error;
}
