import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { Search, Filter, Star, Users, Clock, BookOpen } from 'lucide-react';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        level: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    useEffect(() => {
        fetchCourses();
    }, [filters]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await coursesAPI.getAll(filters);
            setCourses(response.data.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="card p-4 animate-pulse">
                                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-300 rounded"></div>
                                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Courses</h1>
                    <p className="text-gray-600">Discover your next learning adventure</p>
                </div>

                {/* Filters */}
                <div className="card p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="flex-1 w-full">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="input-field"
                        >
                            <option value="">All Categories</option>
                            <option value="web-development">Web Development</option>
                            <option value="mobile-development">Mobile Development</option>
                            <option value="data-science">Data Science</option>
                            <option value="design">Design</option>
                            <option value="business">Business</option>
                        </select>

                        {/* Level Filter */}
                        <select
                            value={filters.level}
                            onChange={(e) => handleFilterChange('level', e.target.value)}
                            className="input-field"
                        >
                            <option value="">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="input-field"
                        >
                            <option value="createdAt">Newest</option>
                            <option value="averageRating">Highest Rated</option>
                            <option value="price">Price</option>
                            <option value="totalStudents">Most Popular</option>
                        </select>
                    </div>
                </div>

                {/* Courses Grid */}
                {courses.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                        <p className="text-gray-600">Try adjusting your search filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.map((course) => (
                            <Link
                                key={course._id}
                                to={`/courses/${course._id}`}
                                className="card p-4 hover:shadow-lg transition-all duration-200 group"
                            >
                                {/* Thumbnail */}
                                <div className="relative mb-4 overflow-hidden rounded-lg">
                                    <img
                                        src={course.thumbnail || '/api/placeholder/300/200'}
                                        alt={course.title}
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                                        {formatPrice(course.currentPrice)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                        {course.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {course.subtitle || course.description}
                                    </p>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="flex items-center mr-4">
                                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                            {course.averageRating || '0.0'}
                                        </span>
                                        <span className="flex items-center">
                                            <Users className="h-4 w-4 text-gray-400 mr-1" />
                                            {course.totalStudents || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {formatDuration(course.totalDuration || 0)}
                                        </span>
                                        <span className="capitalize">{course.level}</span>
                                    </div>

                                    {/* Instructor */}
                                    <div className="flex items-center pt-2 border-t border-gray-200">
                                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                                            <span className="text-xs font-medium text-primary-600">
                                                {course.instructor?.name?.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {course.instructor?.name}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;