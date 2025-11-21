import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://e-learning-platform-server-608h.onrender.com';

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
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    getMe: () => api.get('/api/auth/me'),
    updateDetails: (userData) => api.put('/api/auth/updatedetails', userData),
    updatePassword: (passwordData) => api.put('/api/auth/updatepassword', passwordData),
    logout: () => api.post('/api/auth/logout'),
};

// Courses API
export const coursesAPI = {
    getAll: (params) => api.get('/api/courses', { params }),
    getById: (id) => api.get(`/api/courses/${id}`),
    create: (courseData) => api.post('/api/courses', courseData),
    update: (id, courseData) => api.put(`/api/courses/${id}`, courseData),
    delete: (id) => api.delete(`/api/courses/${id}`),
    addRating: (id, ratingData) => api.post(`/api/courses/${id}/ratings`, ratingData),
    getInstructorCourses: () => api.get('/api/courses/instructor/my-courses'),
    updateCurriculum: (id, curriculum) => api.put(`/api/courses/${id}/curriculum`, { curriculum }),
};

// Payments API
export const paymentsAPI = {
    createPaymentIntent: (courseId) => api.post('/api/payments/create-payment-intent', { courseId }),
    confirmEnrollment: (paymentIntentId) => api.post('/api/payments/confirm-enrollment', { paymentIntentId }),
    freeEnrollment: (courseId) => api.post('/api/payments/free-enroll', { courseId }),
    getHistory: () => api.get('/api/payments/history'),
};

// Enrollments API
export const enrollmentsAPI = {
    getMyEnrollments: () => api.get('/api/enrollments/my-enrollments'),
    getProgress: (courseId) => api.get(`/api/enrollments/course/${courseId}`),
    updateProgress: (courseId, data) => api.put(`/api/enrollments/course/${courseId}/progress`, data),
    markComplete: (courseId, lectureId) => api.put(`/api/enrollments/course/${courseId}/complete-lecture`, { lectureId }),
    generateCertificate: (courseId) => api.post(`/api/enrollments/course/${courseId}/generate-certificate`),
    getDashboardStats: () => api.get('/api/enrollments/dashboard/stats'),
};

// Upload API
export const uploadAPI = {
    uploadImage: (formData) => {
        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
        };
        return api.post('/api/upload/image', formData, config);
    },
    uploadVideo: (formData) => {
        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
        };
        return api.post('/api/upload/video', formData, config);
    },
    deleteFile: (publicId) => api.delete(`/api/upload/${publicId}`),
};

export const searchAPI = {
    globalSearch: (params) => api.get('/api/search', { params }),
    getSuggestions: (q) => api.get('/api/search/suggestions', { params: { q } })
}

export default api;
