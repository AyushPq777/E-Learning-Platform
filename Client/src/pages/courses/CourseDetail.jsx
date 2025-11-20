import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesAPI, paymentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Star, Users, Clock, Play, CheckCircle, BookOpen, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseDetail = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const response = await coursesAPI.getById(id);
            setCourse(response.data.data);
        } catch (error) {
            console.error('Error fetching course:', error);
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to enroll in this course');
            return;
        }

        setEnrolling(true);
        try {
            // For demo, use free enrollment. In production, you'd use payment flow
            const response = await paymentsAPI.freeEnrollment({ courseId: id });

            if (response.data.success) {
                toast.success('Successfully enrolled in course!');
                // Redirect to learning page
                window.location.href = `/learning/${id}`;
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            toast.error(error.response?.data?.message || 'Enrollment failed');
        } finally {
            setEnrolling(false);
        }
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-64 bg-gray-300 rounded"></div>
                                <div className="h-4 bg-gray-300 rounded"></div>
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-48 bg-gray-300 rounded"></div>
                                <div className="h-12 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
                    <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
                    <Link to="/courses" className="btn-primary inline-flex items-center space-x-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Courses</span>
                    </Link>
                </div>
            </div>
        );
    }

    const isEnrolled = course.isEnrolled;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link to="/courses" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Courses
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                    <p className="text-xl text-gray-600 mb-4">{course.subtitle}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span>{course.averageRating || '0.0'} rating</span>
                            <span className="mx-2">•</span>
                            <span>{course.ratingsCount || 0} reviews</span>
                        </div>
                        <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-1" />
                            <span>{course.totalStudents || 0} students</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            <span>{formatDuration(course.totalDuration || 0)} total length</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Tabs */}
                        <div className="bg-white rounded-lg border border-gray-200 mb-6">
                            <div className="border-b border-gray-200">
                                <nav className="flex -mb-px">
                                    {['overview', 'curriculum', 'reviews'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === tab
                                                    ? 'border-primary-500 text-primary-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6">
                                {activeTab === 'overview' && (
                                    <div className="prose max-w-none">
                                        <h3 className="text-lg font-semibold mb-4">About This Course</h3>
                                        <p className="text-gray-700 mb-6">{course.description}</p>

                                        <h4 className="font-semibold mb-3">What You'll Learn</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                                            {course.learningObjectives?.map((objective, index) => (
                                                <div key={index} className="flex items-start">
                                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">{objective}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <h4 className="font-semibold mb-3">Requirements</h4>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {course.requirements?.map((req, index) => (
                                                <li key={index}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {activeTab === 'curriculum' && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Course Content</h3>
                                        <div className="space-y-4">
                                            {course.curriculum?.map((section, sectionIndex) => (
                                                <div key={sectionIndex} className="border border-gray-200 rounded-lg">
                                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                        <h4 className="font-medium">{section.sectionTitle}</h4>
                                                        {section.description && (
                                                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="divide-y divide-gray-200">
                                                        {section.lectures?.map((lecture, lectureIndex) => (
                                                            <div key={lectureIndex} className="px-4 py-3 flex items-center justify-between">
                                                                <div className="flex items-center">
                                                                    <Play className="h-4 w-4 text-gray-400 mr-3" />
                                                                    <span className="text-gray-700">{lecture.title}</span>
                                                                </div>
                                                                <span className="text-sm text-gray-500">
                                                                    {formatDuration(lecture.duration || 0)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Student Reviews</h3>
                                        {course.ratings?.length > 0 ? (
                                            <div className="space-y-4">
                                                {course.ratings.map((rating, index) => (
                                                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                                                        <div className="flex items-center mb-2">
                                                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                                                <span className="text-sm font-medium text-primary-600">
                                                                    {rating.user?.name?.charAt(0)}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{rating.user?.name}</div>
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`h-4 w-4 ${i < rating.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                                                }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-700">{rating.review}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-600">No reviews yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            {/* Course Card */}
                            <div className="card p-6 mb-6">
                                <div className="mb-4">
                                    <img
                                        src={course.thumbnail || '/api/placeholder/300/200'}
                                        alt={course.title}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                    />

                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-3xl font-bold text-gray-900">
                                            {formatPrice(course.currentPrice)}
                                        </span>
                                        {course.discountPrice > 0 && (
                                            <span className="text-lg text-gray-500 line-through">
                                                {formatPrice(course.price)}
                                            </span>
                                        )}
                                    </div>

                                    {isEnrolled ? (
                                        <Link
                                            to={`/learning/${course._id}`}
                                            className="w-full btn-primary flex items-center justify-center space-x-2"
                                        >
                                            <Play className="h-4 w-4" />
                                            <span>Continue Learning</span>
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                            className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
                                        >
                                            {enrolling ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            ) : (
                                                <BookOpen className="h-5 w-5" />
                                            )}
                                            <span>{enrolling ? 'Enrolling...' : 'Enroll Now'}</span>
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Course Level</span>
                                        <span className="capitalize font-medium">{course.level}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Lectures</span>
                                        <span className="font-medium">{course.totalLectures || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Duration</span>
                                        <span className="font-medium">{formatDuration(course.totalDuration || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Category</span>
                                        <span className="font-medium capitalize">{course.category}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Instructor Card */}
                            <div className="card p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Instructor</h3>
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-lg font-medium text-primary-600">
                                            {course.instructor?.name?.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{course.instructor?.name}</div>
                                        <div className="text-sm text-gray-600">{course.instructor?.profession}</div>
                                    </div>
                                </div>
                                {course.instructor?.bio && (
                                    <p className="text-sm text-gray-600">{course.instructor.bio}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;