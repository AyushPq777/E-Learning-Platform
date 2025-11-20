import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { enrollmentsAPI, coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Play, CheckCircle, Clock, BookOpen, Menu, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const Learning = () => {
    const { courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [currentLecture, setCurrentLecture] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [videoProgress, setVideoProgress] = useState(0);

    useEffect(() => {
        fetchLearningData();
    }, [courseId]);

    const fetchLearningData = async () => {
        try {
            const [courseResponse, enrollmentResponse] = await Promise.all([
                coursesAPI.getById(courseId),
                enrollmentsAPI.getProgress(courseId)
            ]);

            setCourse(courseResponse.data.data);
            setEnrollment(enrollmentResponse.data.data);

            // Set first lecture as current if none is set
            if (!enrollmentResponse.data.data.progress.currentLecture) {
                const firstLecture = getFirstLecture(courseResponse.data.data.curriculum);
                if (firstLecture) {
                    setCurrentLecture(firstLecture);
                }
            } else {
                setCurrentLecture(enrollmentResponse.data.data.progress.currentLecture);
            }
        } catch (error) {
            console.error('Error fetching learning data:', error);
            toast.error('Failed to load course content');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const getFirstLecture = (curriculum) => {
        for (const section of curriculum || []) {
            for (const lecture of section.lectures || []) {
                return { ...lecture, sectionTitle: section.sectionTitle };
            }
        }
        return null;
    };

    const handleLectureSelect = (lecture, section) => {
        setCurrentLecture({ ...lecture, sectionTitle: section.sectionTitle });
        setSidebarOpen(false);
    };

    const handleMarkComplete = async (lectureId) => {
        try {
            await enrollmentsAPI.markComplete(courseId, { lectureId });
            toast.success('Lecture marked as complete!');
            fetchLearningData(); // Refresh data
        } catch (error) {
            console.error('Error marking lecture complete:', error);
            toast.error('Failed to mark lecture as complete');
        }
    };

    const handleVideoProgress = async (lectureId, progress, position) => {
        try {
            await enrollmentsAPI.updateProgress(courseId, {
                lectureId,
                progress,
                position
            });
            setVideoProgress(progress);
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const isLectureCompleted = (lectureId) => {
        return enrollment?.completedLectures?.some(
            cl => cl.lecture?._id === lectureId && cl.progress === 100
        );
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0m';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-800"></div>
                    <div className="flex">
                        <div className="w-80 bg-gray-800 h-screen"></div>
                        <div className="flex-1 bg-gray-900 h-96"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!course || !enrollment) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
                    <p className="text-gray-600 mb-4">You may not be enrolled in this course.</p>
                    <button onClick={() => navigate('/courses')} className="btn-primary">
                        Browse Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-gray-800 transition-all duration-300 flex flex-col overflow-hidden`}>
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg truncate">{course.title}</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 hover:bg-gray-700 rounded"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="mt-2">
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{enrollment.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${enrollment.completionPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {course.curriculum?.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="border-b border-gray-700 last:border-b-0">
                            <div className="p-4 bg-gray-750">
                                <h3 className="font-medium">{section.sectionTitle}</h3>
                                {section.description && (
                                    <p className="text-sm text-gray-400 mt-1">{section.description}</p>
                                )}
                            </div>
                            <div className="divide-y divide-gray-700">
                                {section.lectures?.map((lecture, lectureIndex) => (
                                    <button
                                        key={lectureIndex}
                                        onClick={() => handleLectureSelect(lecture, section)}
                                        className={`w-full text-left p-4 hover:bg-gray-750 transition-colors ${currentLecture?._id === lecture._id ? 'bg-gray-700' : ''
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                {isLectureCompleted(lecture._id) ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                ) : (
                                                    <Play className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                )}
                                                <span className="text-sm truncate">{lecture.title}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-xs text-gray-400 flex-shrink-0">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatDuration(lecture.duration)}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 hover:bg-gray-700 rounded-lg"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold">{currentLecture?.sectionTitle}</h1>
                                <h2 className="text-xl font-bold">{currentLecture?.title}</h2>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-400 hover:text-white text-sm"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </header>

                {/* Video Player */}
                <div className="flex-1 bg-black flex items-center justify-center relative">
                    {currentLecture?.videoUrl ? (
                        <div className="w-full max-w-4xl aspect-video bg-gray-800 rounded-lg overflow-hidden">
                            {/* Mock video player - in real app, you'd use a video player component */}
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                <div className="text-center">
                                    <Play className="h-16 w-16 text-white mx-auto mb-4" />
                                    <p className="text-gray-400">Video Player - {currentLecture.title}</p>
                                    <p className="text-gray-500 text-sm mt-2">
                                        In production, this would be a real video player
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Lecture Content</h3>
                            <p className="text-gray-400 max-w-md">
                                {currentLecture?.description || 'This lecture contains reading materials and resources.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Lecture Info & Controls */}
                <div className="bg-gray-800 border-t border-gray-700 p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{currentLecture?.title}</h3>
                            {!isLectureCompleted(currentLecture?._id) && (
                                <button
                                    onClick={() => handleMarkComplete(currentLecture?._id)}
                                    className="btn-primary flex items-center space-x-2"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Mark Complete</span>
                                </button>
                            )}
                        </div>

                        {currentLecture?.description && (
                            <p className="text-gray-300 mb-4">{currentLecture.description}</p>
                        )}

                        {/* Resources */}
                        {currentLecture?.resources?.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2">Resources</h4>
                                <div className="space-y-2">
                                    {currentLecture.resources.map((resource, index) => (
                                        <a
                                            key={index}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>{resource.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Learning;