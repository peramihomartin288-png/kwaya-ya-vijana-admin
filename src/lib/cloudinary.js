const CLOUD_1 = import.meta.env.VITE_CLOUDINARY_CLOUD_1;
const PRESET_1 = import.meta.env.VITE_CLOUDINARY_PRESET_1;

const CLOUD_2 = import.meta.env.VITE_CLOUDINARY_CLOUD_2;
const PRESET_2 = import.meta.env.VITE_CLOUDINARY_PRESET_2;

export async function uploadToCloudinary(file, type = "image") {
  const isVideo = type === "video" || type === "audio";
  const cloud = isVideo ? CLOUD_2 : CLOUD_1;
  const preset = isVideo ? PRESET_2 : PRESET_1;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/${type}/upload`,
    { method: "POST", body: formData }
  );

  const data = await res.json();
  return data.secure_url;
}
