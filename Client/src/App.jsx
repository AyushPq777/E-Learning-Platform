import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/Layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Courses from './pages/courses/Courses';
import CourseDetail from './pages/courses/CourseDetail';
import SearchResults from './pages/SearchResults'; // ADD THIS
import Learning from './pages/learning/Learning';
import Dashboard from './pages/dashboard/Dashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import Profile from './pages/profile/Profile';
import NotFound from './pages/NotFound';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="search" element={<SearchResults />} /> {/* ADD THIS */}

          {/* Protected Routes */}
          <Route path="learning/:courseId" element={
            <ProtectedRoute>
              <Learning />
            </ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="instructor" element={
            <ProtectedRoute requireInstructor>
              <InstructorDashboard />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
}

export default App;