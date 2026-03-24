import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-deep-purple ${sizeClasses[size]} ${className}`} />
  );
};

interface FullPageLoaderProps {
  message?: string;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center px-4">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
};

interface InlineLoaderProps {
  message?: string;
  showMessage?: boolean;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({ 
  message = 'Loading...',
  showMessage = true 
}) => {
  return (
    <div className="flex items-center space-x-3">
      <LoadingSpinner size="sm" />
      {showMessage && <span className="text-gray-600 text-sm">{message}</span>}
    </div>
  );
};
