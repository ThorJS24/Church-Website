import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getOptimizedImageUrl = (publicId: string, options: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
} = {}) => {
  const {
    width = 800,
    height,
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    quality,
    format,
    crop: 'fill',
    gravity: 'auto'
  });
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'church_uploads'); // You'll need to create this preset in Cloudinary

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  return data.secure_url;
};

export default cloudinary;