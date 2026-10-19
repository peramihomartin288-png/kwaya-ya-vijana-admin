// Account 1 (Picha/Audio - Kawaida)
const C1 = import.meta.env.VITE_CLOUDINARY_CLOUD_1;
const P1 = import.meta.env.VITE_CLOUDINARY_PRESET_1;
const F1 = import.meta.env.VITE_CLOUDINARY_FOLDER_1;

// Account 2 (Video - Kawaida)
const C2 = import.meta.env.VITE_CLOUDINARY_CLOUD_2;
const P2 = import.meta.env.VITE_CLOUDINARY_PRESET_2;
const F2 = import.meta.env.VITE_CLOUDINARY_FOLDER_2;

// Account 3 (Dharura 1)
const C3 = import.meta.env.VITE_CLOUDINARY_CLOUD_3;
const P3 = import.meta.env.VITE_CLOUDINARY_PRESET_3;
const F3 = import.meta.env.VITE_CLOUDINARY_FOLDER_3;

// Account 4 (Dharura 2)
const C4 = import.meta.env.VITE_CLOUDINARY_CLOUD_4;
const P4 = import.meta.env.VITE_CLOUDINARY_PRESET_4;
const F4 = import.meta.env.VITE_CLOUDINARY_FOLDER_4;

async function uploadTo(cloud, preset, folder, file, type) {
  const resourceType = (type === 'video' || type === 'audio') ? 'video' : 'image';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  if (folder) formData.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Upload imeshindwa');
  }
  const data = await res.json();
  return data.secure_url;
}

export async function uploadToCloudinary(file, type = 'image') {
  // Kama ni Video, tumia Account 2, ikifeli tumia Account 4
  if (type === 'video') {
    try {
      return await uploadTo(C2, P2, F2, file, type);
    } catch (e) {
      console.warn('Account 2 (Video) imefeli, inajaribu Dharura (Account 4)...');
      return await uploadTo(C4, P4, F4, file, type);
    }
  }

  // Kama ni Picha/Audio, tumia Account 1, ikifeli tumia Account 3
  try {
    return await uploadTo(C1, P1, F1, file, type);
  } catch (e) {
    console.warn('Account 1 (Picha/Audio) imefeli, inajaribu Dharura (Account 3)...');
    return await uploadTo(C3, P3, F3, file, type);
  }
}

// Functions za URL (Hazibadiliki)
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
