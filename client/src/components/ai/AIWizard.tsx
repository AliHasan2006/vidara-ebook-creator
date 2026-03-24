import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, AIWizardInput, AIWizardOutput } from '../../types';
import { apiClient, aiEndpoints } from '../../utils/api';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  ChevronRightIcon,
  BookOpenIcon,
  UsersIcon,
  LightBulbIcon,
  LanguageIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const wizardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  genre: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  language: z.string().default('English'),
  estimatedChapters: z.number().min(1).max(50).default(10),
  keywords: z.array(z.string()).optional(),
});

type WizardFormData = z.infer<typeof wizardSchema>;

interface AIWizardProps {
  onOutlineGenerated: (outline: AIWizardOutput) => void;
  bookData?: Partial<Book>;
}

export const AIWizard: React.FC<AIWizardProps> = ({ onOutlineGenerated, bookData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<AIWizardOutput | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      title: bookData?.title || '',
      genre: bookData?.genre || '',
      targetAudience: bookData?.metadata?.targetAudience || '',
      tone: bookData?.metadata?.tone || '',
      language: bookData?.metadata?.language || 'English',
      estimatedChapters: bookData?.metadata?.estimatedLength ? Math.ceil(bookData.metadata.estimatedLength / 2000) : 10,
      keywords: bookData?.metadata?.keywords || [],
    },
  });

  const genres = [
    'fiction', 'non-fiction', 'biography', 'self-help', 'technical', 'business', 'other'
  ];

  const tones = [
    'Professional', 'Casual', 'Academic', 'Inspirational', 'Humorous', 'Formal', 'Conversational'
  ];

  const audiences = [
    'Young adults', 'Adults', 'Professionals', 'Students', 'Parents', 'Entrepreneurs', 'General audience'
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Other'
  ];

  const onSubmitStep1 = (data: WizardFormData) => {
    setCurrentStep(2);
  };

  const onSubmitStep2 = async (data: WizardFormData) => {
    setIsGenerating(true);
    try {
      const response = await apiClient.post(aiEndpoints.wizard, data);
      setGeneratedOutline(response.outline);
      onOutlineGenerated(response.outline);
      toast.success('Book outline generated successfully!');
    } catch (error) {
      toast.error('Failed to generate outline');
    } finally {
      setIsGenerating(false);
    }
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !watch('keywords')?.includes(keyword.trim())) {
      const currentKeywords = watch('keywords') || [];
      setValue('keywords', [...currentKeywords, keyword.trim()]);
    }
  };

  const removeKeyword = (keyword: string) => {
    const currentKeywords = watch('keywords') || [];
    setValue('keywords', currentKeywords.filter(k => k !== keyword));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-deep-purple rounded-full flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 font-space">AI Book Wizard</h2>
              <p className="text-sm text-gray-600">Generate a comprehensive book outline</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep >= 1 ? 'bg-deep-purple text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep >= 2 ? 'bg-deep-purple text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Step 1: Basic Information</h3>
            
            <form onSubmit={handleSubmit(onSubmitStep1)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent"
                  placeholder="Enter your book title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre
                  </label>
                  <select
                    {...register('genre')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent"
                  >
                    <option value="">Select a genre</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Chapters
                  </label>
                  <input
                    {...register('estimatedChapters', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords (Optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {watch('keywords')?.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-deep-purple text-white"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-2 text-purple-200 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add keyword and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" icon={<ChevronRightIcon className="h-4 w-4" />}>
                  Next Step
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 2: AI Configuration */}
      <AnimatePresence mode="wait">
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Step 2: AI Configuration</h3>
            
            <form onSubmit={handleSubmit(onSubmitStep2)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UsersIcon className="h-4 w-4 inline mr-1" />
                    Target Audience
                  </label>
                  <select
                    {...register('targetAudience')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent"
                  >
                    <option value="">Select audience</option>
                    {audiences.map((audience) => (
                      <option key={audience} value={audience}>
                        {audience}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LightBulbIcon className="h-4 w-4 inline mr-1" />
                    Writing Tone
                  </label>
                  <select
                    {...register('tone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent"
                  >
                    <option value="">Select tone</option>
                    {tones.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LanguageIcon className="h-4 w-4 inline mr-1" />
                    Language
                  </label>
                  <select
                    {...register('language')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent"
                  >
                    {languages.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Preview</h4>
                <div className="text-sm text-purple-800 space-y-1">
                  <div><strong>Title:</strong> {watch('title')}</div>
                  {watch('genre') && <div><strong>Genre:</strong> {watch('genre')}</div>}
                  {watch('targetAudience') && <div><strong>Audience:</strong> {watch('targetAudience')}</div>}
                  {watch('tone') && <div><strong>Tone:</strong> {watch('tone')}</div>}
                  <div><strong>Chapters:</strong> {watch('estimatedChapters')}</div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isGenerating}
                  icon={<SparklesIcon className="h-4 w-4" />}
                >
                  Generate Outline
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Outline */}
      {generatedOutline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border-t border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Outline</h3>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700">{generatedOutline.description}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Chapters</h4>
            <div className="space-y-3">
              {generatedOutline.chapters.map((chapter, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                  <h5 className="font-medium text-gray-900">
                    Chapter {index + 1}: {chapter.title}
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{chapter.estimatedWords} words</span>
                    <span>{chapter.keyPoints.length} key points</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium text-gray-900">Total Words</div>
              <div className="text-gray-600">{generatedOutline.totalEstimatedWords.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium text-gray-900">Themes</div>
              <div className="text-gray-600">{generatedOutline.themes.join(', ')}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="font-medium text-gray-900">Status</div>
              <div className="text-green-600">✓ Ready to use</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
