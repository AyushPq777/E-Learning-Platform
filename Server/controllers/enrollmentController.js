import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { generateCertificate } from '../utils/certificateGenerator.js';

// @desc    Get user's enrollments
// @route   GET /api/enrollments/my-enrollments
// @access  Private
export const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.id })
            .populate('course', 'title thumbnail instructor totalLectures totalDuration')
            .populate('course.instructor', 'name avatar')
            .sort({ lastAccessed: -1 });

        res.json({
            success: true,
            data: enrollments
        });
    } catch (error) {
        console.error('Get enrollments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching enrollments'
        });
    }
};

// @desc    Get enrollment progress for a course
// @route   GET /api/enrollments/course/:courseId
// @access  Private
export const getEnrollmentProgress = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: req.params.courseId
        })
            .populate('course', 'title curriculum totalLectures totalDuration')
            .populate('completedLectures.lecture');

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Calculate detailed progress
        const course = enrollment.course;
        const completedLecturesCount = enrollment.completedLectures.length;

        // Get current lecture and next lecture
        let currentLecture = null;
        let nextLecture = null;

        // Flatten all lectures from curriculum
        const allLectures = [];
        course.curriculum.forEach(section => {
            section.lectures.forEach(lecture => {
                allLectures.push({
                    ...lecture.toObject(),
                    sectionTitle: section.sectionTitle
                });
            });
        });

        // Find current lecture (last accessed or first incomplete)
        for (let lecture of allLectures) {
            const completed = enrollment.completedLectures.find(
                cl => cl.lecture && cl.lecture._id.toString() === lecture._id.toString()
            );

            if (!completed) {
                nextLecture = lecture;
                break;
            }
            currentLecture = lecture;
        }

        res.json({
            success: true,
            data: {
                enrollment,
                progress: {
                    completedLectures: completedLecturesCount,
                    totalLectures: course.totalLectures,
                    completionPercentage: enrollment.completionPercentage,
                    totalDuration: course.totalDuration,
                    currentLecture,
                    nextLecture
                },
                curriculum: course.curriculum
            }
        });
    } catch (error) {
        console.error('Get enrollment progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching enrollment progress'
        });
    }
};

// @desc    Update lecture progress
// @route   PUT /api/enrollments/course/:courseId/progress
// @access  Private
export const updateLectureProgress = async (req, res) => {
    try {
        const { lectureId, progress, position } = req.body;

        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: req.params.courseId
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Update progress
        await enrollment.updateLectureProgress(lectureId, progress, position);

        // Update last accessed
        enrollment.updateLastAccessed();

        // Recalculate completion percentage based on actual course lectures
        const course = await Course.findById(req.params.courseId);
        const totalLectures = course.totalLectures;
        const completedCount = enrollment.completedLectures.filter(
            cl => cl.progress === 100
        ).length;

        enrollment.completionPercentage = Math.min(100,
            Math.round((completedCount / totalLectures) * 100)
        );

        // Check if course is completed
        if (enrollment.completionPercentage === 100 && enrollment.status !== 'completed') {
            enrollment.status = 'completed';
        }

        await enrollment.save();

        res.json({
            success: true,
            message: 'Progress updated successfully',
            data: {
                completionPercentage: enrollment.completionPercentage,
                completedLectures: completedCount,
                totalLectures: totalLectures
            }
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating progress'
        });
    }
};

// @desc    Mark lecture as completed
// @route   PUT /api/enrollments/course/:courseId/complete-lecture
// @access  Private
export const markLectureCompleted = async (req, res) => {
    try {
        const { lectureId } = req.body;

        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: req.params.courseId
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        await enrollment.markLectureCompleted(lectureId);
        await enrollment.updateLastAccessed();

        // Recalculate completion
        const course = await Course.findById(req.params.courseId);
        const totalLectures = course.totalLectures;
        const completedCount = enrollment.completedLectures.length;

        enrollment.completionPercentage = Math.min(100,
            Math.round((completedCount / totalLectures) * 100)
        );

        if (enrollment.completionPercentage === 100 && enrollment.status !== 'completed') {
            enrollment.status = 'completed';
        }

        await enrollment.save();

        res.json({
            success: true,
            message: 'Lecture marked as completed',
            data: {
                completionPercentage: enrollment.completionPercentage,
                completedLectures: completedCount,
                totalLectures: totalLectures
            }
        });
    } catch (error) {
        console.error('Mark lecture completed error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while marking lecture as completed'
        });
    }
};

// @desc    Generate certificate
// @route   POST /api/enrollments/course/:courseId/generate-certificate
// @access  Private
export const generateCourseCertificate = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: req.params.courseId
        }).populate('course').populate('student');

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Check if course is completed
        if (enrollment.completionPercentage < 100) {
            return res.status(400).json({
                success: false,
                message: 'Course must be completed to generate certificate'
            });
        }

        // Check if certificate already generated
        if (enrollment.certificateGenerated) {
            return res.status(400).json({
                success: false,
                message: 'Certificate already generated for this course'
            });
        }

        // Generate certificate
        const certificateBuffer = await generateCertificate(enrollment);

        // Update enrollment with certificate info
        const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        enrollment.certificateGenerated = true;
        enrollment.certificateId = certificateId;
        await enrollment.save();

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename=certificate-${certificateId}.pdf`);

        res.send(certificateBuffer);
    } catch (error) {
        console.error('Generate certificate error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating certificate'
        });
    }
};

// @desc    Get certificate info
// @route   GET /api/enrollments/certificate/:certificateId
// @access  Public
export const getCertificateInfo = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            certificateId: req.params.certificateId
        })
            .populate('course', 'title instructor')
            .populate('student', 'name email')
            .populate('course.instructor', 'name');

        if (!enrollment || !enrollment.certificateGenerated) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.json({
            success: true,
            data: {
                certificateId: enrollment.certificateId,
                studentName: enrollment.student.name,
                courseTitle: enrollment.course.title,
                instructorName: enrollment.course.instructor.name,
                completionDate: enrollment.updatedAt,
                enrollmentDate: enrollment.enrollmentDate
            }
        });
    } catch (error) {
        console.error('Get certificate info error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching certificate info'
        });
    }
};

// @desc    Get student dashboard statistics
// @route   GET /api/enrollments/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.id })
            .populate('course');

        const totalEnrollments = enrollments.length;
        const completedCourses = enrollments.filter(e => e.status === 'completed').length;
        const inProgressCourses = enrollments.filter(e => e.status === 'active').length;

        const totalLearningTime = enrollments.reduce((total, enrollment) => {
            const courseDuration = enrollment.course.totalDuration || 0;
            const completionRatio = enrollment.completionPercentage / 100;
            return total + (courseDuration * completionRatio);
        }, 0);

        // Convert seconds to hours
        const totalLearningHours = Math.round(totalLearningTime / 3600);

        // Recent activity
        const recentEnrollments = await Enrollment.find({ student: req.user.id })
            .populate('course', 'title thumbnail instructor')
            .populate('course.instructor', 'name')
            .sort({ lastAccessed: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                stats: {
                    totalEnrollments,
                    completedCourses,
                    inProgressCourses,
                    totalLearningHours,
                    completionRate: totalEnrollments > 0 ?
                        Math.round((completedCourses / totalEnrollments) * 100) : 0
                },
                recentActivity: recentEnrollments
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard stats'
        });
    }
};