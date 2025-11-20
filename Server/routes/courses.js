import express from 'express';
import { body } from 'express-validator';
import {
    createCourse,
    getCourses,
    getCourse,
    updateCourse,
    deleteCourse,
    updateCurriculum,
    addRating,
    getInstructorCourses
} from '../controllers/courseController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Course validation rules
const courseValidation = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
];

const ratingValidation = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('review')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Review cannot be more than 1000 characters')
];

// Public routes
router.get('/', optionalAuth, getCourses);
router.get('/:id', optionalAuth, getCourse);

// Protected routes
router.use(protect);

// Student routes
router.post('/:id/ratings', ratingValidation, addRating);

// Instructor routes
router.post('/', authorize('instructor', 'admin'), courseValidation, createCourse);
router.put('/:id', authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', authorize('instructor', 'admin'), deleteCourse);
router.put('/:id/curriculum', authorize('instructor', 'admin'), updateCurriculum);
router.get('/instructor/my-courses', authorize('instructor', 'admin'), getInstructorCourses);

export default router;