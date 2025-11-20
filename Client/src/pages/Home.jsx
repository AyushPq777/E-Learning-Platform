import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Star, Users, BookOpen, Award, ArrowRight } from 'lucide-react';

const Home = () => {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: <BookOpen className="h-8 w-8" />,
            title: 'Expert-Led Courses',
            description: 'Learn from industry professionals with real-world experience'
        },
        {
            icon: <Play className="h-8 w-8" />,
            title: 'Video Lessons',
            description: 'High-quality video content with lifetime access'
        },
        {
            icon: <Award className="h-8 w-8" />,
            title: 'Certificates',
            description: 'Earn certificates to showcase your skills'
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: 'Community',
            description: 'Join a community of passionate learners'
        }
    ];

    const stats = [
        { number: '10,000+', label: 'Students Enrolled' },
        { number: '500+', label: 'Courses Available' },
        { number: '100+', label: 'Expert Instructors' },
        { number: '98%', label: 'Satisfaction Rate' }
    ];

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-600 via-blue-600 to-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Learn Without
                            <span className="block text-yellow-300">Limits</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                            Advance your career with our comprehensive online courses. Learn from industry experts and join a community of passionate learners.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {isAuthenticated ? (
                                <Link
                                    to="/courses"
                                    className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <span>Browse Courses</span>
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/register"
                                        className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors duration-200"
                                    >
                                        Start Learning Free
                                    </Link>
                                    <Link
                                        to="/courses"
                                        className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors duration-200"
                                    >
                                        Browse Courses
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, index) => (
                            <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose LearnHub?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            We provide the best learning experience with cutting-edge features
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="card p-6 text-center hover:scale-105 transition-transform duration-200 animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="text-primary-600 mb-4 flex justify-center">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-primary-600 text-white py-20">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Start Learning?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of students already advancing their careers with LearnHub
                    </p>
                    <Link
                        to={isAuthenticated ? "/courses" : "/register"}
                        className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 inline-flex items-center space-x-2"
                    >
                        <span>{isAuthenticated ? "Browse Courses" : "Get Started Today"}</span>
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;