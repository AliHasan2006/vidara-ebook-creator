import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      bio: user?.profile?.bio || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Mock avatar upload - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* <Button
            variant="ghost"
            size="sm"
            as={Link}
            to="/dashboard"
            icon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Back to Dashboard
          </Button> */}
          <h1 className="text-3xl font-bold text-gray-900 font-space mt-4 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-deep-purple to-champagne-gold rounded-full flex items-center justify-center">
                    {user.profile?.avatar ? (
                      <img
                        src={user.profile.avatar}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-deep-purple text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors"
                  >
                    <CameraIcon className="h-4 w-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                  </label>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {user.profile?.firstName && user.profile?.lastName
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user.username}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{user.email}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-medium">Role:</span>
                    <span className="capitalize">{user.role}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-medium">Member since:</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Your Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Books Created</span>
                    <span className="font-medium">{user.stats.booksCreated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Words Written</span>
                    <span className="font-medium">{user.stats.wordsWritten.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Books Exported</span>
                    <span className="font-medium">{user.stats.booksExported}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Edit Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 font-space">
                Edit Profile
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
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
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    id="bio"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {user.profile?.bio?.length || 0}/500 characters
                  </p>
                </div>

                {/* Account Info (Read-only) */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 rounded-lg">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{user.username}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 rounded-lg">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
