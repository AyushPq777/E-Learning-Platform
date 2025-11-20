// import { uploadImage, uploadVideo, deleteFile } from '../utils/cloudinary.js';

// Mock file upload functions for development
const uploadImage = async (file, folder = 'elearning/images') => {
    console.log('📁 Mock Cloudinary: Uploading image -', file);
    return {
        secure_url: '/uploads/mock-image.jpg',
        public_id: 'mock_image_' + Date.now(),
        format: 'jpg',
        bytes: 1024000, // 1MB
        folder: folder
    };
};

const uploadVideo = async (file, folder = 'elearning/videos') => {
    console.log('📁 Mock Cloudinary: Uploading video -', file);
    return {
        secure_url: '/uploads/mock-video.mp4',
        public_id: 'mock_video_' + Date.now(),
        format: 'mp4',
        bytes: 10485760, // 10MB
        duration: 3600, // 1 hour in seconds
        eager: [],
        folder: folder
    };
};

const deleteFile = async (publicId) => {
    console.log('📁 Mock Cloudinary: Deleting file -', publicId);
    return { result: 'ok' };
};

// @desc    Upload image
// @route   POST /api/upload/image
// @access  Private
export const uploadImageFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        console.log('📁 File received:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        const result = await uploadImage(req.file.path, 'elearning/images');

        res.json({
            success: true,
            message: 'Image uploaded successfully (Demo Mode)',
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                bytes: result.bytes,
                note: 'Using mock file upload. Add Cloudinary keys for real uploads.'
            }
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while uploading image'
        });
    }
};

// @desc    Upload video
// @route   POST /api/upload/video
// @access  Private (Instructor/Admin)
export const uploadVideoFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a video file'
            });
        }

        console.log('📁 Video received:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        const result = await uploadVideo(req.file.path, 'elearning/videos');

        res.json({
            success: true,
            message: 'Video uploaded successfully (Demo Mode)',
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                bytes: result.bytes,
                duration: result.duration,
                eager: result.eager,
                note: 'Using mock file upload. Add Cloudinary keys for real video uploads.'
            }
        });
    } catch (error) {
        console.error('Video upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while uploading video'
        });
    }
};

// @desc    Delete file
// @route   DELETE /api/upload/:publicId
// @access  Private
export const deleteUploadedFile = async (req, res) => {
    try {
        const { publicId } = req.params;

        await deleteFile(publicId);

        res.json({
            success: true,
            message: 'File deleted successfully (Demo Mode)'
        });
    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting file'
        });
    }
};