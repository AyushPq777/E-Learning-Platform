import express from 'express';
import {
    getAdminDashboard,
    getAllUsers,
    updateUserRole,
    updateCourseApproval,
    getSystemAnalytics
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/courses/:id/approval', updateCourseApproval);
router.get('/analytics', getSystemAnalytics);

export default router;