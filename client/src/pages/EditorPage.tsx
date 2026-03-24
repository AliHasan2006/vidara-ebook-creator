import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book } from '../types';
import { apiClient, bookEndpoints, aiEndpoints, exportEndpoints } from '../utils/api';
import { useAutoSave } from '../hooks/useAutoSave';
import { ChapterSidebar } from '../components/editor/ChapterSidebar';
import { MarkdownEditor } from '../components/editor/MarkdownEditor';
import { Button } from '../components/common/Button';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ExportModal } from '../components/export/ExportModal';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export const EditorPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  
  const [book, setBook] = useState<Book | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [currentContent, setCurrentContent] = useState('');
  const [lastSave, setLastSave] = useState<Date | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const selectedChapter = book?.chapters.find(ch => ch._id === selectedChapterId);

  // Auto-save functionality
  const { triggerSave, lastSave: autoSaveLastSave } = useAutoSave({
    bookId: bookId!,
    data: { chapters: book?.chapters },
    onSave: () => {
      setIsSaving(false);
      toast.success('Book auto-saved');
    },
    onError: () => {
      toast.error('Auto-save failed');
    },
    delay: 2000,
  });

  const loadBook = useCallback(async () => {
    try {
      const response = await apiClient.get(bookEndpoints.book(bookId!));
      setBook(response.book);
      
      if (response.book.chapters.length > 0) {
        setSelectedChapterId(response.book.chapters[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load book');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [bookId, navigate]);

  useEffect(() => {
    if (!bookId) {
      navigate('/dashboard');
      return;
    }

    loadBook();
  }, [bookId, navigate, loadBook]);

  useEffect(() => {
    if (selectedChapter) {
      setCurrentContent(selectedChapter.content);
    }
  }, [selectedChapter]);

  const handleExport = (format: 'pdf' | 'docx') => {
    setShowExportModal(true);
  };

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapterId(chapterId);
  };

  const handleChapterAdd = async () => {
    if (!book) return;

    const chapterNumber = book.chapters.length + 1;
    const title = `Chapter ${chapterNumber}`;

    try {
      const response = await apiClient.post(bookEndpoints.chapters(bookId!), {
        title,
        content: '',
        status: 'draft'
      });

      setBook(response.book);
      setSelectedChapterId(response.book.chapters[response.book.chapters.length - 1]._id);
      toast.success('Chapter added successfully');
    } catch (error) {
      toast.error('Failed to add chapter');
    }
  };

  const handleChapterDelete = async (chapterId: string) => {
    if (!window.confirm('Are you sure you want to delete this chapter?')) return;

    try {
      // Update the book chapters array without the deleted chapter
      const updatedChapters = book!.chapters.filter(ch => ch._id !== chapterId);
      setBook({ ...book!, chapters: updatedChapters });
      
      if (selectedChapterId === chapterId) {
        setSelectedChapterId(updatedChapters.length > 0 ? updatedChapters[0]._id : '');
      }

      toast.success('Chapter deleted successfully');
    } catch (error) {
      toast.error('Failed to delete chapter');
    }
  };

  const handleChapterReorder = async (newOrder: string[]) => {
    try {
      const response = await apiClient.put(bookEndpoints.reorderChapters(bookId!), {
        newOrder
      });

      setBook(response.book);
      toast.success('Chapters reordered successfully');
    } catch (error) {
      toast.error('Failed to reorder chapters');
    }
  };

  const handleContentChange = async (content: string) => {
    setCurrentContent(content);
    setIsSaving(true);

    // Update local state immediately for responsive UI
    if (selectedChapter) {
      const updatedChapters = book!.chapters.map(ch =>
        ch._id === selectedChapterId
          ? { ...ch, content, wordCount: content.split(/\s+/).filter(word => word.length > 0).length }
          : ch
      );
      setBook({ ...book!, chapters: updatedChapters });
    }

    // Trigger auto-save
    triggerSave();
  };

  const handleSave = async () => {
    if (!selectedChapter) return;

    try {
      await apiClient.put(bookEndpoints.chapter(bookId!, selectedChapterId), {
        title: selectedChapter.title,
        content: currentContent,
        status: selectedChapter.status
      });

      toast.success('Chapter saved successfully');
    } catch (error) {
      toast.error('Failed to save chapter');
    }
  };

  const handleAIGenerate = async () => {
    if (!selectedChapter || !book) return;

    try {
      const previousChapters = book.chapters
        .filter(ch => ch.order < selectedChapter.order)
        .map(ch => ({ title: ch.title, content: ch.content }));

      const response = await apiClient.post(aiEndpoints.draftChapter, {
        bookId: bookId!,
        chapterTitle: selectedChapter.title,
        chapterNumber: selectedChapter.order,
        previousChapters
      });

      setCurrentContent(response.content);
      
      // Update chapter with AI-generated content
      const updatedChapters = book.chapters.map(ch =>
        ch._id === selectedChapterId
          ? { ...ch, content: response.content, status: 'ai-generated' as const, aiGenerated: true }
          : ch
      );
      setBook({ ...book, chapters: updatedChapters });

      toast.success('Chapter generated successfully');
    } catch (error) {
      toast.error('Failed to generate chapter');
    }
  };

  const handleRewrite = async (text: string, instruction: string) => {
    try {
      const response = await apiClient.post(aiEndpoints.rewrite, {
        text,
        instruction,
        context: selectedChapter?.title
      });

      // Replace selected text with rewritten version
      const newContent = currentContent.replace(text, response.rewrittenText);
      setCurrentContent(newContent);
      
      toast.success('Text rewritten successfully');
    } catch (error) {
      toast.error('Failed to rewrite text');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <SkeletonLoader height="h-8" width="w-64" className="mb-4" />
          <SkeletonLoader height="h-4" width="w-48" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Book not found</h2>
          <p className="text-gray-600 mb-4">The book you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Go back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              icon={<ArrowLeftIcon className="h-4 w-4" />}
            >
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 font-space">{book.title}</h1>
              {book.subtitle && (
                <p className="text-sm text-gray-600">{book.subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              icon={<DocumentArrowDownIcon className="h-4 w-4" />}
            >
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('docx')}
              icon={<DocumentArrowDownIcon className="h-4 w-4" />}
            >
              Export DOCX
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<ShareIcon className="h-4 w-4" />}
            >
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Cog6ToothIcon className="h-4 w-4" />}
            >
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="lg:w-80 xl:w-96 flex-shrink-0"
        >
          <ChapterSidebar
            chapters={book.chapters}
            selectedChapterId={selectedChapterId}
            onChapterSelect={handleChapterSelect}
            onChapterAdd={handleChapterAdd}
            onChapterDelete={handleChapterDelete}
            onChapterReorder={handleChapterReorder}
          />
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 flex flex-col"
        >
          {selectedChapter ? (
            <MarkdownEditor
              chapter={selectedChapter}
              content={currentContent}
              onChange={handleContentChange}
              onSave={handleSave}
              onAIGenerate={handleAIGenerate}
              onRewrite={handleRewrite}
              isLoading={isSaving}
              lastSaveTime={lastSave || undefined}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chapter selected</h3>
                <p className="text-gray-600 mb-4">Select a chapter from the sidebar or create a new one</p>
                <Button onClick={handleChapterAdd}>
                  Add First Chapter
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Export Modal */}
      {showExportModal && book && (
        <ExportModal
          book={book}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
