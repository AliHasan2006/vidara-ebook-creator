import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Chapter } from '../../types';
import { Button } from '../common/Button';
import {
  PlusIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface ChapterSidebarProps {
  chapters: Chapter[];
  selectedChapterId?: string;
  onChapterSelect: (chapterId: string) => void;
  onChapterAdd: () => void;
  onChapterDelete: (chapterId: string) => void;
  onChapterReorder: (newOrder: string[]) => void;
}

interface SortableChapterProps {
  chapter: Chapter;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const SortableChapter: React.FC<SortableChapterProps> = ({
  chapter,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusColor = (status: Chapter['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-600';
      case 'ai-generated':
        return 'bg-purple-100 text-purple-600';
      case 'final':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: Chapter['status']) => {
    switch (status) {
      case 'ai-generated':
        return '🤖';
      case 'final':
        return '✓';
      default:
        return '📝';
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`group ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
    >
      <div
        className={`p-3 rounded-lg border cursor-pointer transition-all ${
          isSelected
            ? 'border-deep-purple bg-purple-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
        onClick={onSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
              {...listeners}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
              </svg>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>

            <span className="text-lg">{getStatusIcon(chapter.status)}</span>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900 truncate">
                {chapter.title}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(chapter.status)}`}>
                  {chapter.status}
                </span>
                <span className="text-xs text-gray-500">
                  {chapter.wordCount} words
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Edit functionality
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-red-400 hover:text-red-600 rounded"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isExpanded && chapter.content && (
          <div className="mt-3 pl-10 pr-4">
            <p className="text-xs text-gray-600 line-clamp-3">
              {chapter.content.replace(/[#*`]/g, '').substring(0, 150)}...
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ChapterSidebar: React.FC<ChapterSidebarProps> = ({
  chapters,
  selectedChapterId,
  onChapterSelect,
  onChapterAdd,
  onChapterDelete,
  onChapterReorder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = chapters.findIndex((chapter) => chapter._id === active.id);
      const newIndex = chapters.findIndex((chapter) => chapter._id === over.id);

      const newChapters = arrayMove(chapters, oldIndex, newIndex);
      const newOrder = newChapters.map((chapter) => chapter._id);
      onChapterReorder(newOrder);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 font-space">Chapters</h3>
          <Button
            variant="primary"
            size="sm"
            onClick={onChapterAdd}
            icon={<PlusIcon className="h-4 w-4" />}
          >
            Add Chapter
          </Button>
        </div>
        
        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>Draft</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>AI Generated</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Final</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={chapters.map((chapter) => chapter._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {chapters.map((chapter) => (
                <SortableChapter
                  key={chapter._id}
                  chapter={chapter}
                  isSelected={chapter._id === selectedChapterId}
                  onSelect={() => onChapterSelect(chapter._id)}
                  onDelete={() => onChapterDelete(chapter._id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {chapters.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first chapter</p>
            <Button variant="primary" onClick={onChapterAdd}>
              Add First Chapter
            </Button>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Total Chapters:</span>
            <span className="font-medium">{chapters.length}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Total Words:</span>
            <span className="font-medium">
              {chapters.reduce((total, chapter) => total + chapter.wordCount, 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Est. Pages:</span>
            <span className="font-medium">
              {Math.ceil(chapters.reduce((total, chapter) => total + chapter.wordCount, 0) / 250)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
