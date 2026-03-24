import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const useApiError = () => {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = useCallback((error: any) => {
    let errorMessage = 'An unexpected error occurred';
    let statusCode: number | undefined;

    if (error.response) {
      // Server responded with error status
      statusCode = error.response.status;
      errorMessage = error.response.data?.message || `Server error (${statusCode})`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.message) {
      // Client-side error
      errorMessage = error.message;
    }

    const apiError: ApiError = {
      message: errorMessage,
      status: statusCode,
    };

    setError(apiError);

    // Show toast notification
    if (statusCode === 401) {
      toast.error('Session expired. Please login again.');
    } else if (statusCode === 403) {
      toast.error('Access denied. Insufficient permissions.');
    } else if (statusCode && statusCode >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(errorMessage);
    }

    return apiError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
};
