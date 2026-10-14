import { supabase } from './supabase';

// ABOUT
export async function getAbout() {
  const { data } = await supabase.from('about').select('*').limit(1).maybeSingle();
  return data;
}
export async function saveAbout(payload) {
  if (payload.id) {
    const { data, error } = await supabase.from('about').update(payload).eq('id', payload.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('about').insert(payload).select().single();
  if (error) throw error;
  return data;
}

// FOOTER
export async function getFooter() {
  const { data } = await supabase.from('footer').select('*').limit(1).maybeSingle();
  return data;
}
export async function saveFooter(payload) {
  if (payload.id) {
    const { data, error } = await supabase.from('footer').update(payload).eq('id', payload.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('footer').insert(payload).select().single();
  if (error) throw error;
  return data;
}

// INTRO
export async function getIntro() {
  const { data } = await supabase.from('intro_page').select('*').limit(1).maybeSingle();
  return data;
}
export async function saveIntro(payload) {
  if (payload.id) {
    const { data, error } = await supabase.from('intro_page').update(payload).eq('id', payload.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('intro_page').insert(payload).select().single();
  if (error) throw error;
  return data;
}
