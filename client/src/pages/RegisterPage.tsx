import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data);
    } catch (error) {
      // Error is handled by the API client
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-space text-gray-900 mb-2">
          Create Account
        </h1>
        <p className="text-gray-600">
          Join Vidara and start your writing journey
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent transition-all"
              placeholder="First name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent transition-all"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            {...register('username')}
            type="text"
            id="username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent transition-all"
            placeholder="Choose a username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent transition-all"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent transition-all"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="terms"
            className="h-4 w-4 text-deep-purple focus:ring-deep-purple border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
            I agree to the{' '}
            <Link to="/terms" className="text-deep-purple hover:text-purple-700">
              Terms and Conditions
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-deep-purple hover:text-purple-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
