import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from '../../types';
import { apiClient, exportEndpoints } from '../../utils/api';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  DocumentArrowDownIcon,
  XMarkIcon,
  DocumentTextIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface ExportModalProps {
  book: Book;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ book, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeTOC: true,
    includePageNumbers: true,
    includeChapterNumbers: true,
    includeCoverPage: true,
    fontSize: 12,
    lineHeight: 1.5,
    margins: 'normal' as 'narrow' | 'normal' | 'wide',
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const endpoint = selectedFormat === 'pdf' 
        ? exportEndpoints.pdf(book._id)
        : exportEndpoints.docx(book._id);

      const response = await apiClient.post(endpoint, exportOptions);
      
      // Create download link
      const blob = new Blob([response.data], {
        type: selectedFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.title}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Book exported as ${selectedFormat.toUpperCase()} successfully!`);
      onClose();
    } catch (error) {
      toast.error('Failed to export book');
    } finally {
      setIsExporting(false);
    }
  };

  const formats = [
    {
      id: 'pdf',
      title: 'PDF Document',
      description: 'Perfect for sharing and printing',
      icon: DocumentTextIcon,
      features: ['Print-ready', 'Fixed layout', 'Universal compatibility'],
    },
    {
      id: 'docx',
      title: 'Word Document',
      description: 'Editable format for further customization',
      icon: BookOpenIcon,
      features: ['Fully editable', 'Track changes', 'Professional formatting'],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-deep-purple rounded-full flex items-center justify-center">
                <DocumentArrowDownIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 font-space">Export Book</h3>
                <p className="text-sm text-gray-600">"{book.title}" • {book.chapters.length} chapters</p>
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

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Format Selection */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose Format</h4>
              <div className="space-y-4">
                {formats.map((format) => (
                  <div
                    key={format.id}
                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      selectedFormat === format.id
                        ? 'border-deep-purple bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFormat(format.id as any)}
                  >
                    <div className="flex items-start space-x-3">
                      <format.icon className="h-6 w-6 text-deep-purple mt-1" />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{format.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">{format.description}</p>
                        <div className="space-y-1">
                          {format.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2 text-xs text-gray-500">
                              <CheckCircleIcon className="h-3 w-3 text-green-500" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {selectedFormat === format.id && (
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

            {/* Export Options */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h4>
              
              {/* Content Options */}
              <div className="space-y-4 mb-6">
                <h5 className="font-medium text-gray-900">Content</h5>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeTOC}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeTOC: e.target.checked }))}
                    className="w-4 h-4 text-deep-purple focus:ring-deep-purple border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Include Table of Contents</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includePageNumbers}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includePageNumbers: e.target.checked }))}
                    className="w-4 h-4 text-deep-purple focus:ring-deep-purple border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Include Page Numbers</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeChapterNumbers}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeChapterNumbers: e.target.checked }))}
                    className="w-4 h-4 text-deep-purple focus:ring-deep-purple border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Include Chapter Numbers</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCoverPage}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeCoverPage: e.target.checked }))}
                    className="w-4 h-4 text-deep-purple focus:ring-deep-purple border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Include Cover Page</span>
                </label>
              </div>

              {/* Formatting Options */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-900">Formatting</h5>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size
                  </label>
                  <select
                    value={exportOptions.fontSize}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent"
                  >
                    <option value={10}>10pt</option>
                    <option value={11}>11pt</option>
                    <option value={12}>12pt (Standard)</option>
                    <option value={14}>14pt</option>
                    <option value={16}>16pt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Line Height
                  </label>
                  <select
                    value={exportOptions.lineHeight}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, lineHeight: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent"
                  >
                    <option value={1.0}>Single</option>
                    <option value={1.15}>1.15</option>
                    <option value={1.5}>1.5 (Standard)</option>
                    <option value={2.0}>Double</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Margins
                  </label>
                  <select
                    value={exportOptions.margins}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, margins: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-deep-purple focus:border-transparent"
                  >
                    <option value="narrow">Narrow (0.75")</option>
                    <option value="normal">Normal (1")</option>
                    <option value="wide">Wide (1.25")</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Export Summary</h5>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Format:</strong> {selectedFormat.toUpperCase()}</div>
              <div><strong>Book:</strong> {book.title}</div>
              <div><strong>Chapters:</strong> {book.chapters.length}</div>
              <div><strong>Words:</strong> {book.stats.totalWords.toLocaleString()}</div>
              <div><strong>Estimated Pages:</strong> {book.stats.estimatedPages}</div>
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
            onClick={handleExport}
            loading={isExporting}
            icon={<DocumentArrowDownIcon className="h-4 w-4" />}
          >
            Export {selectedFormat.toUpperCase()}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
