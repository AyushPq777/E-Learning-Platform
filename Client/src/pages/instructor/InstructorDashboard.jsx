import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Users, DollarSign, TrendingUp, BookOpen, Eye, Edit, MoreVertical } from 'lucide-react';

const InstructorDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalStudents: 0,
        totalRevenue: 0,
        averageRating: 0
    });

    useEffect(() => {
        fetchInstructorData();
    }, []);

    const fetchInstructorData = async () => {
        try {
            const response = await coursesAPI.getInstructorCourses();
            setCourses(response.data.data);

            // Calculate stats
            const calculatedStats = response.data.data.reduce((acc, course) => ({
                totalCourses: acc.totalCourses + 1,
                totalStudents: acc.totalStudents + (course.totalStudents || 0),
                totalRevenue: acc.totalRevenue + (course.totalRevenue || 0),
                averageRating: acc.averageRating + (course.averageRating || 0)
            }), {
                totalCourses: 0,
                totalStudents: 0,
                totalRevenue: 0,
                averageRating: 0
            });

            calculatedStats.averageRating = calculatedStats.totalCourses > 0
                ? (calculatedStats.averageRating / calculatedStats.totalCourses).toFixed(1)
                : 0;

            setStats(calculatedStats);
        } catch (error) {
            console.error('Error fetching instructor data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const getStatusBadge = (course) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review' },
            published: { color: 'bg-green-100 text-green-800', label: 'Published' },
            rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
        };

        const config = statusConfig[course.status] || statusConfig.draft;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
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
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Instructor Dashboard</h1>
                        <p className="text-gray-600">Manage your courses and track performance</p>
                    </div>
                    <Link
                        to="/instructor/courses/create"
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Course</span>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg mr-4">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg mr-4">
                                <DollarSign className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                                <TrendingUp className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses Table */}
                <div className="card">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Your Courses</h2>
                    </div>

                    {courses.length === 0 ? (
                        <div className="p-12 text-center">
                            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                            <p className="text-gray-600 mb-6">Create your first course to start teaching</p>
                            <Link to="/instructor/courses/create" className="btn-primary">
                                Create Your First Course
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Course
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Students
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Revenue
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {courses.map((course) => (
                                        <tr key={course._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        src={course.thumbnail || '/api/placeholder/60/45'}
                                                        alt={course.title}
                                                        className="h-10 w-16 object-cover rounded mr-4"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                                            {course.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {course.category}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(course)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {course.totalStudents || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatPrice(course.totalRevenue || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <span className="text-yellow-400 mr-1">★</span>
                                                    {course.averageRating || '0.0'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        to={`/courses/${course._id}`}
                                                        className="text-gray-400 hover:text-gray-600 p-1"
                                                        title="View Course"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        to={`/instructor/courses/${course._id}/edit`}
                                                        className="text-gray-400 hover:text-gray-600 p-1"
                                                        title="Edit Course"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button className="text-gray-400 hover:text-gray-600 p-1">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;