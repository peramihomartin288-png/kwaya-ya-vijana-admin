const URL = import.meta.env.VITE_SUPABASE_URL;

export async function verifyAdmin(pin) {
  const res = await fetch(`${URL}/functions/v1/verify-admin`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pin }),
  });
  return res.json();
}
