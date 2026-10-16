// Account 1 — Picha + Audio
const CLOUD_1 = import.meta.env.VITE_CLOUDINARY_CLOUD_1;
const PRESET_1 = import.meta.env.VITE_CLOUDINARY_PRESET_1;
const FOLDER_1 = import.meta.env.VITE_CLOUDINARY_FOLDER_1;

// Account 2 — Video
const CLOUD_2 = import.meta.env.VITE_CLOUDINARY_CLOUD_2;
const PRESET_2 = import.meta.env.VITE_CLOUDINARY_PRESET_2;
const FOLDER_2 = import.meta.env.VITE_CLOUDINARY_FOLDER_2;

export async function uploadToCloudinary(file, type = 'image') {
  // Video → account 2
  // Picha + Audio → account 1
  const isVideo = type === 'video';

  const cloud = isVideo ? CLOUD_2 : CLOUD_1;
  const preset = isVideo ? PRESET_2 : PRESET_1;
  const folder = isVideo ? FOLDER_2 : FOLDER_1;

  // Audio inapakiwa kama "video" (Cloudinary haitofautishi audio)
  const resourceType = (type === 'video' || type === 'audio') ? 'video' : 'image';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  if (folder) formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Upload imeshindwa');
  }

  const data = await res.json();
  return data.secure_url;
}

// Picha — thumbnail
export function thumbUrl(url, size = 400) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${size},c_fill/`);
}

// Picha — full
export function fullUrl(url, size = 1080) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${size}/`);
}

// Video — 720p
export function videoUrl(url) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/w_720,q_auto,f_auto,vc_auto,ac_auto/');
}

// Audio
export function audioUrl(url) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto/');
}
