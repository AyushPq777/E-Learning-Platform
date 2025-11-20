import express from 'express';
import {
    getMyEnrollments,
    getEnrollmentProgress,
    updateLectureProgress,
    markLectureCompleted,
    generateCourseCertificate,
    getCertificateInfo,
    getDashboardStats
} from '../controllers/enrollmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/my-enrollments', getMyEnrollments);
router.get('/dashboard/stats', getDashboardStats);
router.get('/course/:courseId', getEnrollmentProgress);
router.put('/course/:courseId/progress', updateLectureProgress);
router.put('/course/:courseId/complete-lecture', markLectureCompleted);
router.post('/course/:courseId/generate-certificate', generateCourseCertificate);

// Public certificate verification route
router.get('/certificate/:certificateId', getCertificateInfo);

export default router;