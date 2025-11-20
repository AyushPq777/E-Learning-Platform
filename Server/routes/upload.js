import express from 'express';
import {
    uploadImageFile,
    uploadVideoFile,
    deleteUploadedFile
} from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadImage, uploadVideo } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.post('/image', uploadImage.single('image'), uploadImageFile);
router.post('/video', authorize('instructor', 'admin'), uploadVideo.single('video'), uploadVideoFile);
router.delete('/:publicId', deleteUploadedFile);

export default router;