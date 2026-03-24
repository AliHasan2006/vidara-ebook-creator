import React, { useCallback, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chapter } from '../../types';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AIDraftPanel } from '../ai/AIDraftPanel';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ClipboardIcon,
} from '@heroicons/react/24/outline';

interface MarkdownEditorProps {
  chapter: Chapter;
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onAIGenerate: () => void;
  onRewrite: (text: string, instruction: string) => void;
  isLoading?: boolean;
  lastSaveTime?: Date;
  previousChapters?: Chapter[];
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  chapter,
  content,
  onChange,
  onSave,
  onAIGenerate,
  onRewrite,
  isLoading = false,
  lastSaveTime,
  previousChapters = [],
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [selectedText, setSelectedText] = useState('');
  const [showAIDraftPanel, setShowAIDraftPanel] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAIDraftGenerated = (generatedContent: string) => {
    onChange(generatedContent);
    onSave();
  };

  const handleTextSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    setSelectedText(selected);
  }, [content]);

  const handleRewrite = (instruction: string) => {
    if (selectedText) {
      onRewrite(selectedText, instruction);
    }
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = before + selectedText + after;
    
    const newContent = content.substring(0, start) + newText + content.substring(end);
    onChange(newContent);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const renderPreview = (text: string) => {
    // Simple markdown to HTML conversion (in production, use a proper markdown library)
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-purple-400 pl-4 italic my-2">$1</blockquote>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^/, '<p class="mb-4">')
      .replace(/$/, '</p>');
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('select', handleTextSelection);
      textarea.addEventListener('mouseup', handleTextSelection);
      textarea.addEventListener('keyup', handleTextSelection);
      
      return () => {
        textarea.removeEventListener('select', handleTextSelection);
        textarea.removeEventListener('mouseup', handleTextSelection);
        textarea.removeEventListener('keyup', handleTextSelection);
      };
    }
  }, [handleTextSelection]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="font-semibold text-gray-900 font-space">
            {chapter.title}
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              chapter.status === 'draft' ? 'bg-gray-100 text-gray-600' :
              chapter.status === 'ai-generated' ? 'bg-purple-100 text-purple-600' :
              'bg-green-100 text-green-600'
            }`}>
              {chapter.status}
            </span>
            <span className="text-xs text-gray-500">
              {content.split(/\s+/).filter(word => word.length > 0).length} words
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CodeBracketIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'split' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>
          </div>

          {/* AI Actions */}
          <div className="flex items-center space-x-2 border-l pl-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIDraftPanel(true)}
              icon={<SparklesIcon className="h-4 w-4" />}
            >
              AI Draft
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onAIGenerate}
              icon={<SparklesIcon className="h-4 w-4" />}
            >
              AI Generate
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              loading={isLoading}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* AI Rewrite Toolbar */}
      {selectedText && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 p-3 bg-purple-50 border-b border-purple-200"
        >
          <span className="text-sm text-purple-700">Selected text:</span>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRewrite('summarize')}
            >
              Summarize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRewrite('expand')}
            >
              Expand
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRewrite('rephrase')}
            >
              Rephrase
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRewrite('simplify')}
            >
              Simplify
            </Button>
          </div>
        </motion.div>
      )}

      {/* Editor Toolbar */}
      <div className="flex items-center space-x-2 p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => insertMarkdown('**', '**')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => insertMarkdown('`', '`')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded font-mono text-sm"
            title="Code"
          >
            {'</>'}
          </button>
          <button
            onClick={() => insertMarkdown('# ')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Heading"
          >
            H1
          </button>
          <button
            onClick={() => insertMarkdown('## ')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Subheading"
          >
            H2
          </button>
          <button
            onClick={() => insertMarkdown('> ')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="Quote"
          >
            "
          </button>
          <button
            onClick={() => insertMarkdown('* ')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            title="List"
          >
            •
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'w-1/2 border-r border-gray-200' : 'w-full'}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
              placeholder="Start writing your chapter in Markdown..."
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'w-1/2' : 'w-full'}>
            <div className="h-full p-4 overflow-y-auto">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        <div>
          Markdown supported • Auto-save enabled
        </div>
        {lastSaveTime && (
          <div>
            Last saved: {lastSaveTime.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* AI Draft Panel */}
      {showAIDraftPanel && (
        <AIDraftPanel
          chapter={chapter}
          previousChapters={previousChapters}
          onDraftGenerated={handleAIDraftGenerated}
          onClose={() => setShowAIDraftPanel(false)}
        />
      )}
    </div>
  );
};
