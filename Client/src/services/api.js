import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        const message = error.response?.data?.message || 'Something went wrong';
        if (error.response?.status !== 404) {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    updateDetails: (userData) => api.put('/auth/updatedetails', userData),
    updatePassword: (passwordData) => api.put('/auth/updatepassword', passwordData),
    logout: () => api.post('/auth/logout'),
};

// Courses API
export const coursesAPI = {
    getAll: (params) => api.get('/courses', { params }),
    getById: (id) => api.get(`/courses/${id}`),
    create: (courseData) => api.post('/courses', courseData),
    update: (id, courseData) => api.put(`/courses/${id}`, courseData),
    delete: (id) => api.delete(`/courses/${id}`),
    addRating: (id, ratingData) => api.post(`/courses/${id}/ratings`, ratingData),
    getInstructorCourses: () => api.get('/courses/instructor/my-courses'),
    updateCurriculum: (id, curriculum) => api.put(`/courses/${id}/curriculum`, { curriculum }),
};

// Payments API
export const paymentsAPI = {
    createPaymentIntent: (courseId) => api.post('/payments/create-payment-intent', { courseId }),
    confirmEnrollment: (paymentIntentId) => api.post('/payments/confirm-enrollment', { paymentIntentId }),
    freeEnrollment: (courseId) => api.post('/payments/free-enroll', { courseId }),
    getHistory: () => api.get('/payments/history'),
};

// Enrollments API
export const enrollmentsAPI = {
    getMyEnrollments: () => api.get('/enrollments/my-enrollments'),
    getProgress: (courseId) => api.get(`/enrollments/course/${courseId}`),
    updateProgress: (courseId, data) => api.put(`/enrollments/course/${courseId}/progress`, data),
    markComplete: (courseId, lectureId) => api.put(`/enrollments/course/${courseId}/complete-lecture`, { lectureId }),
    generateCertificate: (courseId) => api.post(`/enrollments/course/${courseId}/generate-certificate`),
    getDashboardStats: () => api.get('/enrollments/dashboard/stats'),
};

// Upload API
export const uploadAPI = {
    uploadImage: (formData) => {
        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
        };
        return api.post('/upload/image', formData, config);
    },
    uploadVideo: (formData) => {
        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
        };
        return api.post('/upload/video', formData, config);
    },
    deleteFile: (publicId) => api.delete(`/upload/${publicId}`),
};

export const searchAPI = {
    globalSearch: (params) => api.get('/search', { params }),
    getSuggestions: (q) => api.get('/search/suggestions', { params: { q } })
}

export default api;