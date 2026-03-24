import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  BookOpenIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalBooks: number;
  totalWords: number;
  totalChapters: number;
  totalExports: number;
  writingStreak: number;
  averageWordsPerDay: number;
  mostProductiveDay: string;
  weeklyProgress: Array<{
    day: string;
    words: number;
    chapters: number;
  }>;
  genreDistribution: Array<{
    genre: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    type: 'chapter' | 'export' | 'book';
    title: string;
    timestamp: string;
  }>;
}

interface AnalyticsWidgetProps {
  bookId?: string;
  compact?: boolean;
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ 
  bookId, 
  compact = false 
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Mock data - replace with actual API call
  React.useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData: AnalyticsData = {
          totalBooks: 3,
          totalWords: 45678,
          totalChapters: 24,
          totalExports: 8,
          writingStreak: 12,
          averageWordsPerDay: 1250,
          mostProductiveDay: 'Tuesday',
          weeklyProgress: [
            { day: 'Mon', words: 1200, chapters: 1 },
            { day: 'Tue', words: 2100, chapters: 2 },
            { day: 'Wed', words: 800, chapters: 0 },
            { day: 'Thu', words: 1500, chapters: 1 },
            { day: 'Fri', words: 1800, chapters: 1 },
            { day: 'Sat', words: 900, chapters: 0 },
            { day: 'Sun', words: 1600, chapters: 1 },
          ],
          genreDistribution: [
            { genre: 'Fiction', count: 2, percentage: 66.7 },
            { genre: 'Non-Fiction', count: 1, percentage: 33.3 },
          ],
          recentActivity: [
            { type: 'chapter', title: 'Chapter 5 - The Journey', timestamp: '2 hours ago' },
            { type: 'export', title: 'Book 1 - PDF Export', timestamp: '1 day ago' },
            { type: 'book', title: 'New Book Created', timestamp: '3 days ago' },
          ],
        };
        
        setData(mockData);
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedPeriod]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          No analytics data available
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-space">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-deep-purple font-space">{data.totalBooks}</div>
            <div className="text-sm text-gray-600">Books</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-champagne-gold font-space">{data.totalWords.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500 font-space">{data.writingStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500 font-space">{data.averageWordsPerDay}</div>
            <div className="text-sm text-gray-600">Words/Day</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-6 w-6 text-deep-purple" />
          <h3 className="text-xl font-semibold text-gray-900 font-space">Analytics Dashboard</h3>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-deep-purple to-purple-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <BookOpenIcon className="h-8 w-8 opacity-80" />
            <span className="text-2xl font-bold font-space">{data.totalBooks}</span>
          </div>
          <div className="text-sm opacity-90">Total Books</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-champagne-gold to-yellow-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <DocumentTextIcon className="h-8 w-8 opacity-80" />
            <span className="text-2xl font-bold font-space">{data.totalWords.toLocaleString()}</span>
          </div>
          <div className="text-sm opacity-90">Total Words</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <ArrowTrendingUpIcon className="h-8 w-8 opacity-80" />
            <span className="text-2xl font-bold font-space">{data.writingStreak}</span>
          </div>
          <div className="text-sm opacity-90">Day Streak</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <ClockIcon className="h-8 w-8 opacity-80" />
            <span className="text-2xl font-bold font-space">{data.averageWordsPerDay}</span>
          </div>
          <div className="text-sm opacity-90">Words/Day Avg</div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h4>
          <div className="space-y-3">
            {data.weeklyProgress.map((day, index) => (
              <div key={day.day} className="flex items-center space-x-3">
                <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(day.words / 2500) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="h-full bg-gradient-to-r from-deep-purple to-purple-600 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {day.words.toLocaleString()} words
                  </div>
                </div>
                <div className="w-8 text-sm text-gray-500 text-center">
                  {day.chapters > 0 && (
                    <div className="bg-champagne-gold text-white rounded px-1 text-xs">
                      {day.chapters}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Genre Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Genre Distribution</h4>
          <div className="space-y-3">
            {data.genreDistribution.map((genre, index) => (
              <div key={genre.genre} className="flex items-center space-x-3">
                <div className="w-24 text-sm font-medium text-gray-600">{genre.genre}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${genre.percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className="h-full bg-gradient-to-r from-champagne-gold to-yellow-600 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {genre.percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="w-8 text-sm text-gray-500 text-center">
                  {genre.count}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
        <div className="space-y-3">
          {data.recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity.type === 'chapter' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'export' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {
                  activity.type === 'chapter' ? <DocumentTextIcon className="h-4 w-4" /> :
                  activity.type === 'export' ? <TrendingUpIcon className="h-4 w-4" /> :
                  <BookOpenIcon className="h-4 w-4" />
                }
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{activity.title}</div>
                <div className="text-sm text-gray-500">{activity.timestamp}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg"
      >
        <h4 className="font-medium text-purple-900 mb-2">Writing Insights</h4>
        <div className="text-sm text-purple-800 space-y-1">
          <div>• Your most productive day is {data.mostProductiveDay}</div>
          <div>• You're on a {data.writingStreak}-day writing streak!</div>
          <div>• Average of {data.averageWordsPerDay} words per day</div>
          <div>• {data.totalExports} books exported this period</div>
        </div>
      </motion.div>
    </div>
  );
};
