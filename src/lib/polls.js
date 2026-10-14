import { supabase } from './supabase';

export async function listPolls() {
  const { data, error } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function createPoll(p) {
  const { data, error } = await supabase.from('polls').insert(p).select().single();
  if (error) throw error;
  return data;
}
export async function updatePoll(id, p) {
  const { data, error } = await supabase.from('polls').update(p).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
export async function deletePoll(id) {
  const { error } = await supabase.from('polls').delete().eq('id', id);
  if (error) throw error;
}
export async function getVotes(pollId) {
  const { data } = await supabase.from('poll_votes').select('*').eq('poll_id', pollId);
  return data || [];
}
