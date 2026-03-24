import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LazyDashboardPage, LazyEditorPage, LazyCreateBookPage, LazyProfilePage } from './utils/lazyLoad';
import { LoginForm } from './components/auth/LoginForm';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { EditorSuspense, DashboardSuspense, ModalSuspense } from './components/common/SuspenseWrapper';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { motion } from 'framer-motion';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-deep-purple border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-deep-purple border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Login Page
const LoginPageComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-off-white to-white flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><LoginPageComponent /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardSuspense><LazyDashboardPage /></DashboardSuspense></ProtectedRoute>} />
              <Route path="/create-book" element={<ProtectedRoute><ModalSuspense><LazyCreateBookPage /></ModalSuspense></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ModalSuspense><LazyProfilePage /></ModalSuspense></ProtectedRoute>} />
              <Route path="/editor/:bookId" element={<ProtectedRoute><EditorSuspense><LazyEditorPage /></EditorSuspense></ProtectedRoute>} />
              
              {/* Demo Page */}
              <Route path="/demo" element={<LandingPage />} />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#6D28D9',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
