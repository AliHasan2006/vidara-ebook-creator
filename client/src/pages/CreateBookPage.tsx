import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { apiClient, bookEndpoints } from '../utils/api';
import { Button } from '../components/common/Button';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  SparklesIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  subtitle: z.string().optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  genre: z.enum(['fiction', 'non-fiction', 'biography', 'self-help', 'technical', 'business', 'other']),
});

type CreateBookFormData = z.infer<typeof createBookSchema>;

export const CreateBookPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBookFormData>({
    resolver: zodResolver(createBookSchema),
    defaultValues: {
      genre: 'other',
    },
  });

  const onSubmit = async (data: CreateBookFormData) => {
    setIsCreating(true);
    try {
      const response = await apiClient.post(bookEndpoints.books, data);
      toast.success('Book created successfully!');
      navigate(`/editor/${response.book._id}`);
    } catch (error) {
      toast.error('Failed to create book');
    } finally {
      setIsCreating(false);
    }
  };

  const genres = [
    { value: 'fiction', label: 'Fiction' },
    { value: 'non-fiction', label: 'Non-Fiction' },
    { value: 'biography', label: 'Biography' },
    { value: 'self-help', label: 'Self-Help' },
    { value: 'technical', label: 'Technical' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            icon={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 font-space mt-4 mb-2">
            Create Your Book
          </h1>
          <p className="text-gray-600">
            Start by giving your book a title and basic information. You can always change this later.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Book Title *
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent transition-all"
                placeholder="Enter your book title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle (Optional)
              </label>
              <input
                {...register('subtitle')}
                type="text"
                id="subtitle"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent transition-all"
                placeholder="A catchy subtitle"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent transition-all resize-none"
                placeholder="What's your book about?"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select
                {...register('genre')}
                id="genre"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent transition-all"
              >
                {genres.map((genre) => (
                  <option key={genre.value} value={genre.value}>
                    {genre.label}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Assistant Toggle */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="h-6 w-6 text-deep-purple" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">AI Writing Assistant</h3>
                    <p className="text-sm text-gray-600">
                      Let AI help you generate outlines and chapter content
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUseAI(!useAI)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useAI ? 'bg-deep-purple' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useAI ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {useAI && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                >
                  <h4 className="font-medium text-purple-900 mb-2">AI Features Available:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Generate comprehensive book outlines</li>
                    <li>• Create chapter drafts with context awareness</li>
                    <li>• Rewrite and improve existing content</li>
                    <li>• Suggest engaging titles and descriptions</li>
                  </ul>
                </motion.div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isCreating}
              >
                Create Book
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Quick Start Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 font-space mb-4">
            Quick Start Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-deep-purple transition-colors cursor-pointer">
              <BookOpenIcon className="h-8 w-8 text-deep-purple mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Novel Template</h3>
              <p className="text-sm text-gray-600">
                Perfect for fiction writers with character development and plot structure
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-deep-purple transition-colors cursor-pointer">
              <BookOpenIcon className="h-8 w-8 text-champagne-gold mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Non-Fiction Template</h3>
              <p className="text-sm text-gray-600">
                Ideal for educational and informative content with clear chapter organization
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-deep-purple transition-colors cursor-pointer">
              <BookOpenIcon className="h-8 w-8 text-green-500 mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Self-Help Template</h3>
              <p className="text-sm text-gray-600">
                Structured for personal development books with exercises and examples
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
