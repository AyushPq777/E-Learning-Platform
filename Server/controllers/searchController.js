import User from '../models/User.js';
import Course from '../models/Course.js';

// @desc    Global search
// @route   GET /api/search
// @access  Public
export const globalSearch = async (req, res) => {
    try {
        const { q, type, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters long'
            });
        }

        const searchRegex = new RegExp(q, 'i');
        const results = {
            users: [],
            courses: []
        };

        // Search users
        if (!type || type === 'users') {
            const users = await User.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { profession: searchRegex },
                    { bio: searchRegex }
                ],
                role: { $in: ['instructor', 'admin'] } // Only search instructors/admins
            })
                .select('name email avatar profession bio role')
                .limit(parseInt(limit));

            results.users = users;
        }

        // Search courses
        if (!type || type === 'courses') {
            const courses = await Course.find({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { category: searchRegex },
                    { 'learningObjectives': searchRegex }
                ],
                isPublished: true,
                status: 'published'
            })
                .populate('instructor', 'name avatar')
                .select('title subtitle description thumbnail price totalStudents averageRating category level')
                .limit(parseInt(limit));

            results.courses = courses;
        }

        res.json({
            success: true,
            data: results,
            query: q
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during search'
        });
    }
};

// @desc    Search suggestions
// @route   GET /api/search/suggestions
// @access  Public
export const getSearchSuggestions = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                data: []
            });
        }

        const searchRegex = new RegExp(q, 'i');

        const [courseSuggestions, userSuggestions] = await Promise.all([
            Course.find({
                title: searchRegex,
                isPublished: true,
                status: 'published'
            })
                .select('title')
                .limit(5),

            User.find({
                name: searchRegex,
                role: { $in: ['instructor', 'admin'] }
            })
                .select('name profession')
                .limit(5)
        ]);

        const suggestions = [
            ...courseSuggestions.map(course => ({
                type: 'course',
                title: course.title,
                _id: course._id
            })),
            ...userSuggestions.map(user => ({
                type: 'user',
                title: user.name,
                subtitle: user.profession,
                _id: user._id
            }))
        ];

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching suggestions'
        });
    }
};