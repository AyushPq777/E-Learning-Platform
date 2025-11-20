import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
export const createCourse = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Add instructor to req.body
        req.body.instructor = req.user.id;

        const course = await Course.create(req.body);

        // Populate instructor details
        await course.populate('instructor', 'name email avatar');

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: course
        });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating course'
        });
    }
};

// @desc    Get all courses with filtering, pagination, and search
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            level,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            instructor,
            status = 'published'
        } = req.query;

        // Build query object
        let query = {};

        // Status filter
        if (status === 'published') {
            query.isPublished = true;
            query.status = 'published';
        } else if (req.user && req.user.role === 'instructor') {
            // Instructors can see their own courses in any status
            if (instructor === 'me') {
                query.instructor = req.user.id;
            }
        }

        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }

        // Category filter
        if (category) {
            query.category = new RegExp(category, 'i');
        }

        // Level filter
        if (level) {
            query.level = level;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Instructor filter
        if (instructor && instructor !== 'me') {
            query.instructor = instructor;
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const courses = await Course.find(query)
            .populate('instructor', 'name avatar bio profession')
            .populate('ratings.user', 'name avatar')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Get total count for pagination
        const total = await Course.countDocuments(query);

        res.json({
            success: true,
            data: courses,
            pagination: {
                current: Number(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching courses'
        });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name avatar bio profession socialLinks')
            .populate('ratings.user', 'name avatar');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user is enrolled (if authenticated)
        let isEnrolled = false;
        let userRating = null;

        if (req.user) {
            const enrollment = await Enrollment.findOne({
                student: req.user.id,
                course: req.params.id
            });

            isEnrolled = !!enrollment;

            // Get user's rating if exists
            const rating = course.ratings.find(r =>
                r.user._id.toString() === req.user.id.toString()
            );
            if (rating) {
                userRating = rating;
            }
        }

        res.json({
            success: true,
            data: {
                ...course.toObject(),
                isEnrolled,
                userRating
            }
        });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching course'
        });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
export const updateCourse = async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user is course instructor or admin
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this course'
            });
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('instructor', 'name avatar');

        res.json({
            success: true,
            message: 'Course updated successfully',
            data: course
        });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating course'
        });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user is course instructor or admin
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this course'
            });
        }

        // Check if there are enrollments
        const enrollmentsCount = await Enrollment.countDocuments({ course: req.params.id });
        if (enrollmentsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete course with active enrollments'
            });
        }

        await Course.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting course'
        });
    }
};

// @desc    Add/Update curriculum section
// @route   PUT /api/courses/:id/curriculum
// @access  Private (Instructor/Admin)
export const updateCurriculum = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user is course instructor or admin
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this course curriculum'
            });
        }

        course.curriculum = req.body.curriculum;
        await course.save();

        res.json({
            success: true,
            message: 'Curriculum updated successfully',
            data: course.curriculum
        });
    } catch (error) {
        console.error('Update curriculum error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating curriculum'
        });
    }
};

// @desc    Add rating and review
// @route   POST /api/courses/:id/ratings
// @access  Private (Students only)
export const addRating = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user is enrolled
        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: req.params.id
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: 'You must be enrolled in the course to rate it'
            });
        }

        const { rating, review } = req.body;

        // Check if user already rated
        const existingRatingIndex = course.ratings.findIndex(
            r => r.user.toString() === req.user.id.toString()
        );

        if (existingRatingIndex > -1) {
            // Update existing rating
            course.ratings[existingRatingIndex].rating = rating;
            course.ratings[existingRatingIndex].review = review;
        } else {
            // Add new rating
            course.ratings.push({
                user: req.user.id,
                rating,
                review
            });
        }

        await course.save();

        // Populate the newly added rating
        await course.populate('ratings.user', 'name avatar');

        res.json({
            success: true,
            message: 'Rating added successfully',
            data: course.ratings
        });
    } catch (error) {
        console.error('Add rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding rating'
        });
    }
};

// @desc    Get instructor courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor)
export const getInstructorCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.id })
            .populate('instructor', 'name avatar')
            .sort({ createdAt: -1 });

        // Get course statistics
        const courseStats = await Enrollment.aggregate([
            {
                $match: {
                    course: { $in: courses.map(c => c._id) }
                }
            },
            {
                $group: {
                    _id: '$course',
                    totalStudents: { $sum: 1 },
                    totalRevenue: { $sum: '$amountPaid' }
                }
            }
        ]);

        // Combine courses with stats
        const coursesWithStats = courses.map(course => {
            const stats = courseStats.find(stat =>
                stat._id.toString() === course._id.toString()
            );
            return {
                ...course.toObject(),
                totalStudents: stats?.totalStudents || 0,
                totalRevenue: stats?.totalRevenue || 0
            };
        });

        res.json({
            success: true,
            data: coursesWithStats
        });
    } catch (error) {
        console.error('Get instructor courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching instructor courses'
        });
    }
};