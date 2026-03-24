import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import {
  BookOpenIcon,
  SparklesIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <SparklesIcon className="h-8 w-8" />,
      title: 'AI-Powered Writing',
      description: 'Generate compelling content with advanced AI assistance while maintaining your unique voice.',
    },
    {
      icon: <DocumentTextIcon className="h-8 w-8" />,
      title: 'Smart Editor',
      description: 'Professional markdown editor with real-time preview and intelligent formatting tools.',
    },
    {
      icon: <BookOpenIcon className="h-8 w-8" />,
      title: 'Easy Publishing',
      description: 'Export your masterpiece to PDF or DOCX with professional formatting and layout.',
    },
  ];

  const stats = [
    { label: 'Books Created', value: '10,000+' },
    { label: 'Words Written', value: '50M+' },
    { label: 'Active Authors', value: '5,000+' },
  ];

  const sampleBooks = [
    {
      title: 'Anxiety Alchemy',
      subtitle: 'Transforming Stress into Strength',
      author: 'Sarah Chen',
      cover: '🧘‍♀️',
      description: 'A practical guide to understanding and managing anxiety in the modern world.',
    },
    {
      title: 'The Introvert\'s Guide to Networking',
      subtitle: 'Building Connections Your Way',
      author: 'Michael Torres',
      cover: '🤝',
      description: 'Learn how to network effectively as an introvert without changing who you are.',
    },
    {
      title: 'Digital Minimalism',
      subtitle: 'Finding Focus in a Noisy World',
      author: 'Emma Watson',
      cover: '🌿',
      description: 'Reclaim your time and attention with practical digital minimalism strategies.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-off-white to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-deep-purple/10 to-champagne-gold/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="glassmorphism inline-block px-6 py-2 rounded-full mb-6">
              <span className="text-deep-purple font-medium">✨ AI-Powered Authorship</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-space text-gray-900 mb-6">
              Architect Your
              <span className="block text-deep-purple">Legacy</span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your ideas into published masterpieces with AI-powered writing tools, 
              professional editing, and seamless publishing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  Start Writing Free
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-deep-purple font-space mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-space text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional tools designed to help you write better, faster, and with more confidence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 lg:p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-deep-purple mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-space">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Books Section */}
      <section className="py-20 bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-space text-gray-900 mb-4">
              Published with Vidara
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what authors are creating with our platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sampleBooks.map((book, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-deep-purple to-champagne-gold flex items-center justify-center">
                  <div className="text-6xl">{book.cover}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-space">
                    {book.title}
                  </h3>
                  <p className="text-sm text-champagne-gold font-medium mb-3">
                    {book.subtitle}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">by {book.author}</span>
                    <Button variant="ghost" size="sm">
                      Read More
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-deep-purple text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <RocketLaunchIcon className="h-16 w-16 mx-auto mb-6 text-champagne-gold" />
            <h2 className="text-4xl font-bold font-space mb-6">
              Ready to Write Your Masterpiece?
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              Join thousands of authors who trust Vidara to bring their stories to life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-lg px-8 py-4 bg-champagne-gold hover:bg-yellow-600"
                >
                  Start Your Free Trial
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-champagne-gold flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">No Credit Card Required</h4>
                  <p className="text-purple-100 text-sm">Start writing immediately</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-champagne-gold flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">AI-Powered Tools</h4>
                  <p className="text-purple-100 text-sm">Write faster and smarter</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-champagne-gold flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Professional Export</h4>
                  <p className="text-purple-100 text-sm">Publish-ready formats</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
