import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Chapter } from '../../types';
import { apiClient, aiEndpoints } from '../../utils/api';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface AIDraftPanelProps {
  chapter: Chapter;
  previousChapters: Chapter[];
  onDraftGenerated: (content: string) => void;
  onClose: () => void;
}

export const AIDraftPanel: React.FC<AIDraftPanelProps> = ({
  chapter,
  previousChapters,
  onDraftGenerated,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [selectedOption, setSelectedOption] = useState<'basic' | 'detailed' | 'creative'>('basic');

  const generateDraft = async () => {
    setIsGenerating(true);
    try {
      const response = await apiClient.post(aiEndpoints.draftChapter, {
        bookId: 'current', // This would come from context
        chapterTitle: chapter.title,
        chapterNumber: chapter.order,
        previousChapters,
        additionalInstructions: instructions || undefined,
      });

      onDraftGenerated(response.content);
      toast.success('Chapter draft generated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to generate chapter draft');
    } finally {
      setIsGenerating(false);
    }
  };

  const options = [
    {
      id: 'basic',
      title: 'Basic Draft',
      description: 'Generate a straightforward chapter draft',
      icon: DocumentTextIcon,
      estimatedWords: '1500-2000 words',
    },
    {
      id: 'detailed',
      title: 'Detailed Draft',
      description: 'Create a comprehensive chapter with examples',
      icon: LightBulbIcon,
      estimatedWords: '2500-3000 words',
    },
    {
      id: 'creative',
      title: 'Creative Draft',
      description: 'Generate an engaging chapter with storytelling',
      icon: SparklesIcon,
      estimatedWords: '2000-2500 words',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-deep-purple rounded-full flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 font-space">AI Chapter Generator</h3>
                <p className="text-sm text-gray-600">Generate content for "{chapter.title}"</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<XMarkIcon className="h-5 w-5" />}
            >
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Context */}
          {previousChapters.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Context from Previous Chapters</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 space-y-2">
                  {previousChapters.slice(-3).map((ch, index) => (
                    <div key={ch._id} className="flex items-start space-x-2">
                      <span className="font-medium text-gray-700">Chapter {ch.order}:</span>
                      <span>{ch.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Draft Type</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {options.map((option) => (
                <div
                  key={option.id}
                  className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    selectedOption === option.id
                      ? 'border-deep-purple bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOption(option.id as any)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <option.icon className="h-6 w-6 text-deep-purple" />
                    <h5 className="font-medium text-gray-900">{option.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  <p className="text-xs text-gray-500">{option.estimatedWords}</p>
                  {selectedOption === option.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-deep-purple rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586V7a1 1 0 012 0v5.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Instructions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Instructions (Optional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent resize-none"
              placeholder="Any specific requirements or preferences for this chapter..."
            />
          </div>

          {/* AI Features */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">AI Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Context-aware generation</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Tone consistency</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Chapter flow optimization</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Character/plot continuity</span>
              </div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-blue-800">
              <ArrowPathIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Estimated generation time: 30-45 seconds</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={generateDraft}
            loading={isGenerating}
            icon={<SparklesIcon className="h-4 w-4" />}
          >
            Generate Draft
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
