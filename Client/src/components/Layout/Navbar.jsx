import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../Search/SearchBar';
import NotificationBell from '../Notifications/NotificationBell';
import ChatWindow from '../Chat/ChatWindow';
import {
    Menu,
    X,
    User,
    BookOpen,
    LogOut,
    Settings,
    BarChart3,
    MessageCircle
} from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const { user, logout, isInstructor } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Courses', href: '/courses' },
    ];

    if (user) {
        navLinks.push({ name: 'Dashboard', href: '/dashboard' });
        if (isInstructor) {
            navLinks.push({ name: 'Instructor', href: '/instructor' });
        }
    }

    return (
        <>
            <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-400 rounded-lg flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900">LearnHub</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.href
                                            ? 'text-primary-600 bg-primary-50'
                                            : 'text-gray-700 hover:text-primary-600'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Search & User Menu */}
                        <div className="hidden md:flex items-center space-x-4">
                            {/* SearchBar - CENTER POSITION */}
                            <div className="w-80">
                                <SearchBar />
                            </div>

                            {user ? (
                                <div className="flex items-center space-x-2">
                                    {/* Notification Bell */}
                                    <NotificationBell />

                                    {/* Chat Button */}
                                    <button
                                        onClick={() => setShowChat(true)}
                                        className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                                        title="Chat"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                    </button>

                                    {/* User Menu */}
                                    <div className="relative group">
                                        <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                                <User className="h-4 w-4 text-primary-600" />
                                            </div>
                                            <span>{user.name}</span>
                                        </button>

                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Settings className="h-4 w-4 mr-2" />
                                                Profile
                                            </Link>
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <BarChart3 className="h-4 w-4 mr-2" />
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        to="/login"
                                        className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn-primary"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                            >
                                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isOpen && (
                        <div className="md:hidden border-t border-gray-200 py-4">
                            {/* Mobile Search */}
                            <div className="px-4 mb-4">
                                <SearchBar />
                            </div>

                            <div className="flex flex-col space-y-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`px-3 py-2 rounded-md text-base font-medium ${location.pathname === link.href
                                                ? 'text-primary-600 bg-primary-50'
                                                : 'text-gray-700 hover:text-primary-600'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}

                                {user ? (
                                    <>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={() => setShowChat(true)}
                                            className="px-3 py-2 rounded-md text-base font-medium text-left text-gray-700 hover:text-primary-600 flex items-center space-x-2"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            <span>Chat</span>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="px-3 py-2 rounded-md text-base font-medium text-left text-gray-700 hover:text-primary-600"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsOpen(false)}
                                            className="px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-700"
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Chat Window */}
            {showChat && (
                <ChatWindow
                    chatId="general"
                    title="General Chat"
                    onClose={() => setShowChat(false)}
                />
            )}
        </>
    );
};

export default Navbar;