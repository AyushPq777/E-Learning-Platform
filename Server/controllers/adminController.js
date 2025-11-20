import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req, res) => {
    try {
        // Get total counts
        const totalUsers = await User.countDocuments();
        const totalInstructors = await User.countDocuments({ role: 'instructor' });
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ isPublished: true });
        const totalEnrollments = await Enrollment.countDocuments();

        // Get revenue statistics
        const revenueStats = await Enrollment.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amountPaid' },
                    averageRevenue: { $avg: '$amountPaid' }
                }
            }
        ]);

        // Get recent activities
        const recentEnrollments = await Enrollment.find()
            .populate('student', 'name email')
            .populate('course', 'title')
            .sort({ createdAt: -1 })
            .limit(10);

        const recentCourses = await Course.find()
            .populate('instructor', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get course approval queue
        const pendingCourses = await Course.find({ status: 'pending' })
            .populate('instructor', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalInstructors,
                    totalStudents,
                    totalCourses,
                    publishedCourses,
                    totalEnrollments,
                    totalRevenue: revenueStats[0]?.totalRevenue || 0,
                    averageRevenue: revenueStats[0]?.averageRevenue || 0
                },
                recentActivities: {
                    enrollments: recentEnrollments,
                    courses: recentCourses
                },
                approvalQueue: pendingCourses
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching admin dashboard'
        });
    }
};

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;

        let query = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                current: Number(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['student', 'instructor', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating user role'
        });
    }
};

// @desc    Approve/reject course
// @route   PUT /api/admin/courses/:id/approval
// @access  Private (Admin)
export const updateCourseApproval = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        course.status = status === 'approved' ? 'published' : 'rejected';
        course.isPublished = status === 'approved';

        if (status === 'rejected' && rejectionReason) {
            course.rejectionReason = rejectionReason;
        }

        await course.save();
        await course.populate('instructor', 'name email');

        res.json({
            success: true,
            message: `Course ${status} successfully`,
            data: course
        });
    } catch (error) {
        console.error('Course approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating course approval'
        });
    }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getSystemAnalytics = async (req, res) => {
    try {
        // Monthly enrollment growth
        const monthlyEnrollments = await Enrollment.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: '$amountPaid' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
        ]);

        // Course category distribution
        const categoryStats = await Course.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalStudents: { $sum: '$totalStudents' },
                    averageRating: { $avg: '$averageRating' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Instructor performance
        const instructorStats = await Course.aggregate([
            {
                $group: {
                    _id: '$instructor',
                    totalCourses: { $sum: 1 },
                    totalStudents: { $sum: '$totalStudents' },
                    totalRevenue: { $sum: { $multiply: ['$price', '$totalStudents'] } },
                    averageRating: { $avg: '$averageRating' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'instructor'
                }
            },
            { $unwind: '$instructor' },
            {
                $project: {
                    'instructor.name': 1,
                    'instructor.email': 1,
                    totalCourses: 1,
                    totalStudents: 1,
                    totalRevenue: 1,
                    averageRating: 1
                }
            },
            { $sort: { totalStudents: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                monthlyEnrollments,
                categoryStats,
                instructorStats
            }
        });
    } catch (error) {
        console.error('System analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching analytics'
        });
    }
};