import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Book } from '../types';
import { Button } from '../components/common/Button';
import { SkeletonLoader, CardSkeleton } from '../components/common/SkeletonLoader';
import { AnalyticsWidget } from '../components/analytics/AnalyticsWidget';
import toast from 'react-hot-toast';
import {
  BookOpenIcon,
  PlusIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockBooks: Book[] = [
        {
          _id: '1',
          title: 'Anxiety Alchemy',
          subtitle: 'Transforming Stress into Strength',
          author: user?._id || '',
          description: 'A practical guide to understanding and managing anxiety in the modern world.',
          genre: 'self-help',
          metadata: {
            targetAudience: 'Young adults',
            tone: 'Supportive',
            language: 'English',
            keywords: ['anxiety', 'mental health', 'self-help']
          },
          chapters: [],
          status: 'draft',
          stats: {
            totalWords: 15000,
            totalChapters: 8,
            estimatedPages: 60
          },
          settings: {
            autoSave: true,
            publicPreview: false,
            allowComments: false
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'The Introvert\'s Guide to Networking',
          subtitle: 'Building Connections Your Way',
          author: user?._id || '',
          description: 'Learn how to network effectively as an introvert without changing who you are.',
          genre: 'business',
          metadata: {
            targetAudience: 'Professionals',
            tone: 'Professional',
            language: 'English',
            keywords: ['networking', 'introvert', 'career']
          },
          chapters: [],
          status: 'in-progress',
          stats: {
            totalWords: 22000,
            totalChapters: 12,
            estimatedPages: 88
          },
          settings: {
            autoSave: true,
            publicPreview: false,
            allowComments: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setBooks(mockBooks);
    } catch (error) {
      toast.error('Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewBook = () => {
    // Navigate to book creation flow
    navigate('/create-book');
  };

  const openBook = (bookId: string) => {
    navigate(`/editor/${bookId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <SkeletonLoader height="h-8" width="w-64" className="mb-2" />
            <SkeletonLoader height="h-4" width="w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-space mb-2">
                Welcome back, {user?.profile?.firstName || user?.username}!
              </h1>
              <p className="text-gray-600">
                Continue your writing journey and bring your stories to life.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={createNewBook}
              icon={<PlusIcon className="h-5 w-5" />}
            >
              Create New Book
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Books</p>
                <p className="text-2xl font-bold text-gray-900 font-space">{books.length}</p>
              </div>
              <BookOpenIcon className="h-8 w-8 text-deep-purple" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Words Written</p>
                <p className="text-2xl font-bold text-gray-900 font-space">
                  {books.reduce((total, book) => total + book.stats.totalWords, 0).toLocaleString()}
                </p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-champagne-gold" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Chapters</p>
                <p className="text-2xl font-bold text-gray-900 font-space">
                  {books.reduce((total, book) => total + book.stats.totalChapters, 0)}
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Est. Pages</p>
                <p className="text-2xl font-bold text-gray-900 font-space">
                  {books.reduce((total, book) => total + book.stats.estimatedPages, 0)}
                </p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </motion.div>

        {/* Books Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 font-space">Your Books</h2>
            <Link to="/books" className="text-gray-600 hover:text-gray-900">
              View All
            </Link>
          </div>

          {books.length === 0 ? (
            <div className="text-center py-12">
              <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No books yet</h3>
              <p className="text-gray-600 mb-6">Start your writing journey by creating your first book</p>
              <Button onClick={createNewBook} icon={<PlusIcon className="h-5 w-5" />}>
                Create Your First Book
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book, index) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openBook(book._id)}
                >
                  <div className="h-32 bg-gradient-to-br from-deep-purple to-champagne-gold flex items-center justify-center">
                    <BookOpenIcon className="h-12 w-12 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 font-space">
                      {book.title}
                    </h3>
                    {book.subtitle && (
                      <p className="text-sm text-champagne-gold font-medium mb-3">
                        {book.subtitle}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {book.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{book.stats.totalChapters} chapters</span>
                      <span>{book.stats.totalWords.toLocaleString()} words</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        book.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                        book.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {book.status}
                      </span>
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <AnalyticsWidget />
        </motion.div>
      </div>
    </div>
  );
};
