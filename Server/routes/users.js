import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    getInstructorProfile,
    getInstructors
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/instructors', getInstructors);
router.get('/instructor/:id', getInstructorProfile);

// Protected routes
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

export default router;