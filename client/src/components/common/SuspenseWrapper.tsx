import React, { Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ 
  children, 
  fallback = <LoadingSpinner size="lg" /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Specific suspense wrappers for different components
export const EditorSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading editor...</p>
        </div>
      </div>
    }
  >
    {children}
  </Suspense>
);

export const DashboardSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }
  >
    {children}
  </Suspense>
);

export const ModalSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <LoadingSpinner size="lg" />
      </div>
    }
  >
    {children}
  </Suspense>
);
