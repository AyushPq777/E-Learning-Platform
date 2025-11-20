import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -resetPasswordToken -resetPasswordExpire');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user profile'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            bio: req.body.bio,
            profession: req.body.profession,
            socialLinks: req.body.socialLinks,
            avatar: req.body.avatar
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key => {
            if (fieldsToUpdate[key] === undefined) {
                delete fieldsToUpdate[key];
            }
        });

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        }).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
};

// @desc    Get instructor public profile
// @route   GET /api/users/instructor/:id
// @access  Public
export const getInstructorProfile = async (req, res) => {
    try {
        const instructor = await User.findById(req.params.id)
            .select('name avatar bio profession socialLinks createdAt');

        if (!instructor || (instructor.role !== 'instructor' && instructor.role !== 'admin')) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        // Get instructor courses (only published ones)
        const courses = await Course.find({
            instructor: req.params.id,
            isPublished: true,
            status: 'published'
        })
            .select('title thumbnail price totalStudents averageRating ratingsCount')
            .sort({ createdAt: -1 });

        // Get instructor statistics
        const stats = await Course.aggregate([
            {
                $match: {
                    instructor: instructor._id,
                    isPublished: true,
                    status: 'published'
                }
            },
            {
                $group: {
                    _id: null,
                    totalCourses: { $sum: 1 },
                    totalStudents: { $sum: '$totalStudents' },
                    totalRatings: { $sum: { $size: '$ratings' } },
                    averageRating: { $avg: '$averageRating' }
                }
            }
        ]);

        const instructorStats = stats[0] || {
            totalCourses: 0,
            totalStudents: 0,
            totalRatings: 0,
            averageRating: 0
        };

        res.json({
            success: true,
            data: {
                instructor,
                courses,
                stats: instructorStats
            }
        });
    } catch (error) {
        console.error('Get instructor profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching instructor profile'
        });
    }
};

// @desc    Get all instructors
// @route   GET /api/users/instructors
// @access  Public
export const getInstructors = async (req, res) => {
    try {
        const { page = 1, limit = 12, search } = req.query;

        let query = { role: { $in: ['instructor', 'admin'] } };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { profession: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } }
            ];
        }

        const instructors = await User.find(query)
            .select('name avatar bio profession socialLinks createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        // Get stats for each instructor
        const instructorsWithStats = await Promise.all(
            instructors.map(async (instructor) => {
                const stats = await Course.aggregate([
                    {
                        $match: {
                            instructor: instructor._id,
                            isPublished: true,
                            status: 'published'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalCourses: { $sum: 1 },
                            totalStudents: { $sum: '$totalStudents' },
                            averageRating: { $avg: '$averageRating' }
                        }
                    }
                ]);

                return {
                    ...instructor.toObject(),
                    stats: stats[0] || {
                        totalCourses: 0,
                        totalStudents: 0,
                        averageRating: 0
                    }
                };
            })
        );

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: instructorsWithStats,
            pagination: {
                current: Number(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get instructors error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching instructors'
        });
    }
};