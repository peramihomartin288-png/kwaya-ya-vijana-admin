const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Hifadhi keys zilizovutwa ili tusivute kila mara
let cachedKeys = null;
let currentIndex = 0;

// Kazi ya kupata keys kutoka Edge Function yetu
export async function getUploadcareKeys() {
  if (cachedKeys) return cachedKeys;
  const res = await fetch(`${SUPABASE_URL}/functions/v1/uploadcare-upload`, {
    headers: { 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  const data = await res.json();
  cachedKeys = data.keys || [];
  return cachedKeys;
}

// Kupakia faili kwenye Uploadcare kwa kutumia Public Key
async function uploadFileToAccount(file, publicKey) {
  const formData = new FormData();
  formData.append('UPLOADCARE_PUB_KEY', publicKey);
  formData.append('UPLOADCARE_STORE', '1');
  formData.append('file', file);

  const res = await fetch('https://upload.uploadcare.com/base/', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Uploadcare upload imefeli');
  const data = await res.json();
  // Rudisha URL ya faili
  return `https://ucarecdn.com/${data.file}/`;
}

// Kazi kuu ya kupakia (inatumiwa na UI)
export async function uploadToUploadcare(file) {
  const keys = await getUploadcareKeys();
  if (keys.length === 0) throw new Error('Hakuna Uploadcare account iliyopatikana.');

  // Chagua account kwa mzunguko (Round-robin)
  const account = keys[currentIndex % keys.length];
  currentIndex++;

  return await uploadFileToAccount(file, account.pub);
}
