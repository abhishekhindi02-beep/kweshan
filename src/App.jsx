import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import SubjectsPage from './pages/SubjectsPage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import QuestionEditorPage from './pages/QuestionEditorPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import QuestionsPage from './pages/QuestionsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ToastContainer from './components/common/ToastContainer';

import { useAuth } from './context/AuthContext';

// Protected Route Wrapper for Prototype App
function ProtectedRoute({ children, isAuthenticated, isRegistered }) {
  if (!isAuthenticated || !isRegistered) {
    return <Navigate to="/" replace />;
  }
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  const { isAuthenticated, isRegistered } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-[#090d16] text-[#f8fafc] font-sans antialiased selection:bg-[#0df2c9]/30 selection:text-[#0df2c9]">
        <Routes>
          {/* Public Landing & Authentication */}
          <Route
            path="/"
            element={
              isAuthenticated && isRegistered ? (
                <AppShell>
                  <HomePage />
                </AppShell>
              ) : (
                <LandingPage />
              )
            }
          />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Protected Main Repository Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* Subjects Routes */}
          <Route
            path="/subjects"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <SubjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/:subjectId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <SubjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/:subjectId/questions/new"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <QuestionEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/:subjectId/questions/:questionId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <QuestionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/:subjectId/questions/:questionId/edit"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <QuestionEditorPage />
              </ProtectedRoute>
            }
          />

          {/* Questions Routes */}
          <Route
            path="/questions"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <QuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/new"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <QuestionEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/:questionId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <QuestionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/:questionId/edit"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <QuestionEditorPage />
              </ProtectedRoute>
            }
          />

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Graceful Fallbacks for Legacy Removed Routes */}
          <Route path="/battles/*" element={<Navigate to="/" replace />} />
          <Route path="/decks/*" element={<Navigate to="/subjects" replace />} />
          <Route path="/practice/*" element={<Navigate to="/subjects" replace />} />
          <Route path="/leaderboard/*" element={<Navigate to="/" replace />} />
          <Route path="/friends/*" element={<Navigate to="/" replace />} />
          <Route path="/notifications/*" element={<Navigate to="/" replace />} />
          <Route path="/arena/*" element={<Navigate to="/" replace />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Global Reactive Toast Notifications */}
        <ToastContainer />
      </div>
    </Router>
  );
}
