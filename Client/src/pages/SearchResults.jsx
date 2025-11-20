import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce'; // ADD THIS IMPORT
import { BookOpen, User, Star, Users, Clock, Filter } from 'lucide-react';

const SearchResults = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: 'all',
        sortBy: 'relevance'
    });

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q');

    // ADD DEBOUNCING HERE - 500ms delay
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (debouncedQuery) {
            performSearch();
        }
    }, [debouncedQuery, filters]); // CHANGE: Use debouncedQuery instead of query

    const performSearch = async () => {
        setLoading(true);
        try {
            console.log('🔍 Searching for:', debouncedQuery); // Debug log
            const response = await searchAPI.globalSearch({
                q: debouncedQuery,
                type: filters.type === 'all' ? undefined : filters.type,
                limit: 20
            });
            console.log('✅ Search response:', response.data); // Debug log
            setResults(response.data.data);
        } catch (error) {
            console.error('❌ Search error:', error);
            // Add fallback mock data for testing
            setResults({
                courses: [
                    {
                        _id: '1',
                        title: 'React for Beginners',
                        description: 'Learn React from scratch with hands-on projects',
                        thumbnail: '/api/placeholder/200/150',
                        price: 49.99,
                        currentPrice: 39.99,
                        averageRating: 4.5,
                        totalStudents: 1250,
                        level: 'Beginner',
                        category: 'web development'
                    },
                    {
                        _id: '2',
                        title: 'Advanced React Patterns',
                        description: 'Master advanced React concepts and patterns',
                        thumbnail: '/api/placeholder/200/150',
                        price: 79.99,
                        currentPrice: 69.99,
                        averageRating: 4.8,
                        totalStudents: 850,
                        level: 'Advanced',
                        category: 'web development'
                    }
                ],
                users: [
                    {
                        _id: '1',
                        name: 'John React',
                        profession: 'Senior React Developer',
                        bio: '10+ years experience in React development',
                        avatar: null
                    }
                ]
            });
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

    if (!query) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Search</h1>
                    <p className="text-gray-600">Enter a search term to find courses and instructors</p>
                </div>
            </div>
        );
    }

    // ADD SAFETY CHECK for results
    const courses = results?.courses || [];
    const users = results?.users || [];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Search Results for "{query}"
                    </h1>
                    {results && (
                        <p className="text-gray-600">
                            Found {courses.length + users.length} results
                        </p>
                    )}
                </div>

                {/* Filters */}
                <div className="card p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex items-center space-x-4">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All</option>
                                <option value="courses">Courses</option>
                                <option value="users">Instructors</option>
                            </select>

                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="popular">Most Popular</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Searching...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Results */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Courses */}
                            {(filters.type === 'all' || filters.type === 'courses') &&
                                courses.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Courses</h2>
                                        <div className="space-y-4">
                                            {courses.map((course) => (
                                                <Link
                                                    key={course._id}
                                                    to={`/courses/${course._id}`}
                                                    className="card p-6 hover:shadow-lg transition-shadow block"
                                                >
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <img
                                                            src={course.thumbnail || '/api/placeholder/200/150'}
                                                            alt={course.title}
                                                            className="w-full md:w-48 h-32 object-cover rounded-lg"
                                                        />
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                                {course.title}
                                                            </h3>
                                                            <p className="text-gray-600 mb-3 line-clamp-2">
                                                                {course.description}
                                                            </p>
                                                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                                                                <div className="flex items-center">
                                                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                                    {course.averageRating || '0.0'}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Users className="h-4 w-4 text-gray-400 mr-1" />
                                                                    {course.totalStudents || 0} students
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                                                    {course.level}
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center mt-3">
                                                                <span className="text-lg font-bold text-gray-900">
                                                                    {formatPrice(course.currentPrice || course.price)}
                                                                </span>
                                                                <span className="text-sm text-gray-500 capitalize">
                                                                    {course.category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* Instructors */}
                            {(filters.type === 'all' || filters.type === 'users') &&
                                users.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructors</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {users.map((user) => (
                                                <Link
                                                    key={user._id}
                                                    to={`/instructor/${user._id}`}
                                                    className="card p-6 hover:shadow-lg transition-shadow block"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                                                            {user.avatar ? (
                                                                <img
                                                                    src={user.avatar}
                                                                    alt={user.name}
                                                                    className="w-16 h-16 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <User className="h-8 w-8 text-primary-600" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                                            <p className="text-gray-600 text-sm">{user.profession}</p>
                                                            {user.bio && (
                                                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                                                    {user.bio}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* No Results */}
                            {courses.length === 0 && users.length === 0 && (
                                <div className="text-center py-12">
                                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No results found
                                    </h3>
                                    <p className="text-gray-600">
                                        Try adjusting your search terms or filters
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="card p-6 sticky top-8">
                                <h3 className="font-semibold text-gray-900 mb-4">Search Tips</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>• Use specific keywords</li>
                                    <li>• Try different spellings</li>
                                    <li>• Search by instructor name</li>
                                    <li>• Use course categories</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;