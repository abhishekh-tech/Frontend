import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Auth from './pages/Auth';
import TeacherDashboardShell from './pages/teacher/TeacherDashboardShell';
import TeacherOverview from './pages/teacher/TeacherOverview';
import TeacherMyClasses from './pages/teacher/TeacherMyClasses';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherMessages from './pages/teacher/TeacherMessages';
import TeacherCertificates from './pages/teacher/TeacherCertificates';
import LearnerDashboardShell from './pages/learner/LearnerDashboardShell';
import LearnerOverview from './pages/learner/LearnerOverview';
import LearnerEnrolledClasses from './pages/learner/LearnerEnrolledClasses';
import LearnerWishlist from './pages/learner/LearnerWishlist';
import LearnerCertificates from './pages/learner/LearnerCertificates';
import LearnerMessages from './pages/learner/LearnerMessages';
import TeacherSkills from './pages/teacher/TeacherSkills';
import LearnerSkills from './pages/learner/LearnerSkills';
import Profile from './pages/Profile';
import Community from './pages/Community';
import ProtectedRoute from './components/shared/ProtectedRoute';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/login" element={<Auth type="login" />} />
        <Route path="/signup" element={<Auth type="signup" />} />
        
        {/* Protected Routes for all authenticated users */}
        <Route element={<ProtectedRoute allowedRole={['student', 'teacher', 'admin']} />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/community" element={<Community />} />
        </Route>
        
        {/* Teacher Dashboard - Restricted to 'teacher' role */}
        <Route element={<ProtectedRoute allowedRole="teacher" />}>
          <Route path="/dashboard/teacher" element={<TeacherDashboardShell />}>
            <Route index element={<TeacherOverview />} />
            <Route path="classes" element={<TeacherMyClasses />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="certificates" element={<TeacherCertificates />} />
            <Route path="skills" element={<TeacherSkills />} />
            <Route path="messages" element={<TeacherMessages />} />
          </Route>
        </Route>
        
        {/* Learner Dashboard - Restricted to 'student' role */}
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/dashboard/learner" element={<LearnerDashboardShell />}>
            <Route index element={<LearnerOverview />} />
            <Route path="enrolled" element={<LearnerEnrolledClasses />} />
            <Route path="wishlist" element={<LearnerWishlist />} />
            <Route path="certificates" element={<LearnerCertificates />} />
            <Route path="skills" element={<LearnerSkills />} />
            <Route path="messages" element={<LearnerMessages />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
