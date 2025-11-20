import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
export const uploadImage = async (file, folder = 'elearning') => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: 'image',
            quality: 'auto',
            fetch_format: 'auto'
        });
        return result;
    } catch (error) {
        throw new Error(`Image upload failed: ${error.message}`);
    }
};

// Upload video to Cloudinary
export const uploadVideo = async (file, folder = 'elearning/videos') => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: 'video',
            resource_type: 'video',
            chunk_size: 6000000, // 6MB chunks
            eager: [
                { width: 300, height: 300, crop: 'pad', audio_codec: 'none' },
                { width: 160, height: 100, crop: 'crop', gravity: 'south', audio_codec: 'none' }
            ]
        });
        return result;
    } catch (error) {
        throw new Error(`Video upload failed: ${error.message}`);
    }
};

// Delete file from Cloudinary
export const deleteFile = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`File deletion failed: ${error.message}`);
    }
};

export default cloudinary;