import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-32 w-32 rounded-full bg-primary-100 mb-8">
                    <span className="text-6xl font-bold text-primary-600">404</span>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">Page not found</h1>

                <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                    Sorry, we couldn't find the page you're looking for. Perhaps you'd like to go back to the homepage?
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="btn-primary flex items-center justify-center space-x-2"
                    >
                        <Home className="h-4 w-4" />
                        <span>Go Home</span>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="btn-secondary flex items-center justify-center space-x-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Go Back</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;