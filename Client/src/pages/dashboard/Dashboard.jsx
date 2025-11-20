import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Play, Award, Clock, TrendingUp, Calendar, Star, Users } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, enrollmentsResponse] = await Promise.all([
                enrollmentsAPI.getDashboardStats(),
                enrollmentsAPI.getMyEnrollments()
            ]);

            setStats(statsResponse.data.data.stats);
            setEnrollments(enrollmentsResponse.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        return `${hours}h`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
                            ))}
                        </div>
                        <div className="h-64 bg-gray-300 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.name}!
                    </h1>
                    <p className="text-gray-600">Continue your learning journey</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.totalEnrollments || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg mr-4">
                                <Award className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.completedCourses || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Learning Hours</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.totalLearningHours || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg mr-4">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.completionRate || 0}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
                                <Link to="/courses" className="text-primary-600 hover:text-primary-700 font-medium">
                                    Browse Courses
                                </Link>
                            </div>

                            {enrollments.length === 0 ? (
                                <div className="text-center py-8">
                                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                                    <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course</p>
                                    <Link to="/courses" className="btn-primary">
                                        Browse Courses
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {enrollments.slice(0, 5).map((enrollment) => (
                                        <div key={enrollment._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={enrollment.course?.thumbnail || '/api/placeholder/100/75'}
                                                    alt={enrollment.course?.title}
                                                    className="w-16 h-12 object-cover rounded"
                                                />
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        {enrollment.course?.title}
                                                    </h3>
                                                    <div className="flex items-center text-sm text-gray-600 mt-1">
                                                        <div className="flex items-center mr-4">
                                                            <Play className="h-3 w-3 mr-1" />
                                                            {enrollment.completionPercentage}% complete
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Last accessed {new Date(enrollment.lastAccessed).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link
                                                to={`/learning/${enrollment.course?._id}`}
                                                className="btn-primary text-sm py-2 px-4"
                                            >
                                                Continue
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Progress Overview */}
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Progress Overview</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>In Progress</span>
                                        <span>{stats?.inProgressCourses || 0} courses</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-500 h-2 rounded-full"
                                            style={{
                                                width: `${((stats?.inProgressCourses || 0) / (stats?.totalEnrollments || 1)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Completed</span>
                                        <span>{stats?.completedCourses || 0} courses</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{
                                                width: `${((stats?.completedCourses || 0) / (stats?.totalEnrollments || 1)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommended Actions */}
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link
                                    to="/courses"
                                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                                >
                                    <BookOpen className="h-5 w-5 text-gray-400 group-hover:text-primary-600 mr-3" />
                                    <span className="text-gray-700 group-hover:text-primary-600">Browse New Courses</span>
                                </Link>
                                <Link
                                    to="/profile"
                                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                                >
                                    <Users className="h-5 w-5 text-gray-400 group-hover:text-primary-600 mr-3" />
                                    <span className="text-gray-700 group-hover:text-primary-600">Update Profile</span>
                                </Link>
                                {enrollments.some(e => e.completionPercentage === 100 && !e.certificateGenerated) && (
                                    <Link
                                        to="#"
                                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                                    >
                                        <Award className="h-5 w-5 text-gray-400 group-hover:text-primary-600 mr-3" />
                                        <span className="text-gray-700 group-hover:text-primary-600">Download Certificates</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;