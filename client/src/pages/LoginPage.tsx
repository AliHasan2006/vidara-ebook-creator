import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-off-white to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-deep-purple hover:text-purple-700 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
