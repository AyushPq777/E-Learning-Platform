import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User, BookOpen, Clock } from 'lucide-react';
import { searchAPI } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef();
    const navigate = useNavigate();

    const debouncedQuery = useDebounce(query, 500); // INCREASE to 500ms

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            fetchSuggestions(debouncedQuery); // PASS debouncedQuery as parameter
        } else {
            setSuggestions([]);
            setLoading(false);
        }
    }, [debouncedQuery]); // ONLY depend on debouncedQuery

    const fetchSuggestions = async (searchTerm) => { // ACCEPT parameter
        if (!searchTerm || searchTerm.length < 2) return;

        setLoading(true);
        try {
            console.log('🔍 Fetching suggestions for:', searchTerm);
            const response = await searchAPI.getSuggestions(searchTerm);
            setSuggestions(response.data.data);
        } catch (error) {
            console.error('❌ Suggestions error:', error);
            // Don't show error to user for suggestions
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // TEMPORARY FIX - Disable suggestions while testing:
    // Comment out the entire useEffect above and replace with:
    /*
    useEffect(() => {
        // Temporarily disable suggestions to test search
        setSuggestions([]);
        setLoading(false);
    }, [debouncedQuery]);
    */

    // ... rest of your component remains the same
    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'course') {
            navigate(`/courses/${suggestion._id}`);
        } else if (suggestion.type === 'user') {
            navigate(`/instructor/${suggestion._id}`);
        }
        setShowSuggestions(false);
        setQuery('');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setShowSuggestions(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full max-w-lg">
            <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Search courses, instructors..."
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (query.length >= 2 || suggestions.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="py-2">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={`${suggestion.type}-${suggestion._id}-${index}`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                                >
                                    {suggestion.type === 'course' ? (
                                        <BookOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    ) : (
                                        <User className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 truncate">
                                            {suggestion.title}
                                        </div>
                                        {suggestion.subtitle && (
                                            <div className="text-sm text-gray-500 truncate">
                                                {suggestion.subtitle}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400 capitalize px-2 py-1 bg-gray-100 rounded">
                                        {suggestion.type}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : query.length >= 2 ? (
                        <div className="p-4 text-center text-gray-500">
                            No results found for "{query}"
                        </div>
                    ) : null}

                    {query.length >= 2 && (
                        <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
                            <button
                                onClick={handleSearchSubmit}
                                className="w-full text-left text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                See all results for "{query}"
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;