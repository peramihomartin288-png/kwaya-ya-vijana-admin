const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD;
const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;
const FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER;

export async function uploadToCloudinary(file, type = 'image') {
  const resourceType =
    type === 'video' ? 'video' :
    type === 'audio' ? 'video' :
    'image';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', PRESET);
  if (FOLDER) formData.append('folder', FOLDER);
  // transformation HAIRUHUSIWI kwenye unsigned — tunaiacha kwenye URL

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Upload imeshindwa');
  }

  const data = await res.json();
  return data.secure_url;
}

export function thumbUrl(url, size = 400) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${size},c_fill/`);
}

export function fullUrl(url, size = 1080) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${size}/`);
}

export function videoUrl(url) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/w_720,q_auto,f_auto,vc_auto,ac_auto/');
}

export function audioUrl(url) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto/');
}
