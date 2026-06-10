const CLOUD_NAME = 'dwsenlr3e';
const UPLOAD_PRESET = 'snack_shop';

export async function uploadToCloudinary(file) {
  if (!file) throw new Error('Không có file');
  if (!file.type.startsWith('image/')) throw new Error('Chỉ chấp nhận file ảnh');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload thất bại');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    throw new Error(error.message || 'Lỗi upload ảnh');
  }
}
