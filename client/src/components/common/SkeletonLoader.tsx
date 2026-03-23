import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  height?: string;
  width?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  lines?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  height = 'h-4',
  width = 'w-full',
  variant = 'text',
  lines = 1,
}) => {
  const baseClasses = 'skeleton-loader rounded';
  
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${height} ${i === lines - 1 ? 'w-3/4' : width}`}
          />
        ))}
      </div>
    );
  }

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${height} ${width} ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
    <SkeletonLoader height="h-6" width="w-3/4" />
    <SkeletonLoader height="h-4" lines={3} />
    <div className="flex justify-between items-center pt-4">
      <SkeletonLoader height="h-8" width="w-24" />
      <SkeletonLoader height="h-8" width="w-24" />
    </div>
  </div>
);

export const ChapterSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
    <div className="flex items-center space-x-3">
      <SkeletonLoader height="h-8" width="w-8" variant="circular" />
      <SkeletonLoader height="h-5" width="w-1/2" />
    </div>
    <SkeletonLoader height="h-4" width="w-1/4" />
  </div>
);

export const EditorSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
    <div className="border-b border-gray-200 p-4">
      <SkeletonLoader height="h-6" width="w-1/3" />
    </div>
    <div className="p-4 space-y-3">
      <SkeletonLoader height="h-4" lines={8} />
    </div>
  </div>
);
