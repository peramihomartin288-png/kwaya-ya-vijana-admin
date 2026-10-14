const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function call(fn) {
  try {
    const res = await fetch(`${URL}/functions/v1/${fn}`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    return res.json();
  } catch {
    return { ok: false };
  }
}

export async function getSupabaseUsage() {
  return call('get-supabase-usage');
}
