import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, BookOpen, Award, Settings, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        profession: '',
        socialLinks: {
            website: '',
            youtube: '',
            twitter: '',
            linkedin: ''
        }
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                profession: user.profession || '',
                socialLinks: user.socialLinks || {
                    website: '',
                    youtube: '',
                    twitter: '',
                    linkedin: ''
                }
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('socialLinks.')) {
            const socialField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [socialField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await updateProfile(formData);
            if (result.success) {
                toast.success('Profile updated successfully!');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
                    <p className="text-gray-600">Manage your account information and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card p-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                                    <User className="h-8 w-8 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">{user.name}</h2>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                    <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full capitalize">
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeTab === 'profile'
                                            ? 'bg-primary-100 text-primary-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <User className="h-4 w-4" />
                                        <span>Profile Information</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeTab === 'security'
                                            ? 'bg-primary-100 text-primary-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Settings className="h-4 w-4" />
                                        <span>Security</span>
                                    </div>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'profile' && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="input-field pl-10"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="input-field pl-10 bg-gray-50"
                                                    placeholder="Enter your email"
                                                    disabled
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-2">
                                                Profession
                                            </label>
                                            <input
                                                type="text"
                                                id="profession"
                                                name="profession"
                                                value={formData.profession}
                                                onChange={handleChange}
                                                className="input-field"
                                                placeholder="e.g. Software Developer"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            rows={4}
                                            value={formData.bio}
                                            onChange={handleChange}
                                            className="input-field resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    {/* Social Links */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-4">Social Links</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="website" className="block text-xs font-medium text-gray-600 mb-2">
                                                    Website
                                                </label>
                                                <input
                                                    type="url"
                                                    id="website"
                                                    name="socialLinks.website"
                                                    value={formData.socialLinks.website}
                                                    onChange={handleChange}
                                                    className="input-field text-sm"
                                                    placeholder="https://yourwebsite.com"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="youtube" className="block text-xs font-medium text-gray-600 mb-2">
                                                    YouTube
                                                </label>
                                                <input
                                                    type="url"
                                                    id="youtube"
                                                    name="socialLinks.youtube"
                                                    value={formData.socialLinks.youtube}
                                                    onChange={handleChange}
                                                    className="input-field text-sm"
                                                    placeholder="https://youtube.com/yourchannel"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="twitter" className="block text-xs font-medium text-gray-600 mb-2">
                                                    Twitter
                                                </label>
                                                <input
                                                    type="url"
                                                    id="twitter"
                                                    name="socialLinks.twitter"
                                                    value={formData.socialLinks.twitter}
                                                    onChange={handleChange}
                                                    className="input-field text-sm"
                                                    placeholder="https://twitter.com/yourusername"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="linkedin" className="block text-xs font-medium text-gray-600 mb-2">
                                                    LinkedIn
                                                </label>
                                                <input
                                                    type="url"
                                                    id="linkedin"
                                                    name="socialLinks.linkedin"
                                                    value={formData.socialLinks.linkedin}
                                                    onChange={handleChange}
                                                    className="input-field text-sm"
                                                    placeholder="https://linkedin.com/in/yourprofile"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-gray-200">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-primary flex items-center space-x-2"
                                        >
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>

                                <div className="space-y-6">
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Update your password to keep your account secure
                                        </p>
                                        <button className="btn-secondary text-sm">
                                            Change Password
                                        </button>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Add an extra layer of security to your account
                                        </p>
                                        <button className="btn-secondary text-sm">
                                            Enable 2FA
                                        </button>
                                    </div>

                                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                                        <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
                                        <p className="text-sm text-red-700 mb-4">
                                            Once you delete your account, there is no going back. Please be certain.
                                        </p>
                                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;