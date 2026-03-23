export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'author' | 'admin' | 'reader';
  profile: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
  };
  stats: {
    wordsWritten: number;
    booksCreated: number;
    booksExported: number;
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  _id: string;
  title: string;
  content: string;
  status: 'draft' | 'ai-generated' | 'final';
  wordCount: number;
  order: number;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  _id: string;
  title: string;
  subtitle?: string;
  author: User | string;
  description?: string;
  genre: 'fiction' | 'non-fiction' | 'biography' | 'self-help' | 'technical' | 'business' | 'other';
  metadata: {
    targetAudience?: string;
    tone?: string;
    language: string;
    estimatedLength?: number;
    keywords?: string[];
  };
  cover?: string;
  chapters: Chapter[];
  status: 'draft' | 'in-progress' | 'review' | 'published';
  stats: {
    totalWords: number;
    totalChapters: number;
    estimatedPages: number;
  };
  settings: {
    autoSave: boolean;
    publicPreview: boolean;
    previewPassword?: string;
    allowComments: boolean;
  };
  publishedAt?: string;
  lastAutoSave?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIWizardInput {
  title: string;
  genre?: string;
  targetAudience?: string;
  tone?: string;
  language?: string;
  estimatedChapters?: number;
  keywords?: string[];
}

export interface AIWizardOutput {
  description: string;
  chapters: {
    title: string;
    description: string;
    estimatedWords: number;
    keyPoints: string[];
  }[];
  totalEstimatedWords: number;
  themes: string[];
}

export interface DraftChapterInput {
  bookId: string;
  chapterTitle: string;
  chapterNumber: number;
  previousChapters?: {
    title: string;
    content: string;
  }[];
  additionalInstructions?: string;
}

export interface RewriteTextInput {
  text: string;
  instruction: 'summarize' | 'expand' | 'rephrase' | 'simplify';
  context?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
