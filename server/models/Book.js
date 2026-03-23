const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'ai-generated', 'final'],
    default: 'draft'
  },
  wordCount: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    required: true
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: 300
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  genre: {
    type: String,
    enum: ['fiction', 'non-fiction', 'biography', 'self-help', 'technical', 'business', 'other'],
    default: 'other'
  },
  metadata: {
    targetAudience: String,
    tone: String,
    language: {
      type: String,
      default: 'English'
    },
    estimatedLength: Number,
    keywords: [String]
  },
  cover: {
    type: String,
    default: ''
  },
  chapters: [chapterSchema],
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'review', 'published'],
    default: 'draft'
  },
  stats: {
    totalWords: { type: Number, default: 0 },
    totalChapters: { type: Number, default: 0 },
    estimatedPages: { type: Number, default: 0 }
  },
  settings: {
    autoSave: { type: Boolean, default: true },
    publicPreview: { type: Boolean, default: false },
    previewPassword: { type: String },
    allowComments: { type: Boolean, default: false }
  },
  publishedAt: Date,
  lastAutoSave: Date
}, {
  timestamps: true
});

// Calculate stats before saving
bookSchema.pre('save', function(next) {
  this.stats.totalWords = this.chapters.reduce((total, chapter) => total + chapter.wordCount, 0);
  this.stats.totalChapters = this.chapters.length;
  this.stats.estimatedPages = Math.ceil(this.stats.totalWords / 250); // Average 250 words per page
  
  // Update chapter word counts
  this.chapters.forEach(chapter => {
    chapter.wordCount = chapter.content.split(/\s+/).filter(word => word.length > 0).length;
  });
  
  next();
});

// Add chapter method
bookSchema.methods.addChapter = function(chapterData) {
  const chapter = {
    ...chapterData,
    order: this.chapters.length + 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  this.chapters.push(chapter);
  return this.save();
};

// Update chapter method
bookSchema.methods.updateChapter = function(chapterId, updateData) {
  const chapter = this.chapters.id(chapterId);
  if (chapter) {
    Object.assign(chapter, updateData);
    chapter.updatedAt = new Date();
  }
  return this.save();
};

// Reorder chapters method
bookSchema.methods.reorderChapters = function(newOrder) {
  newOrder.forEach((chapterId, index) => {
    const chapter = this.chapters.id(chapterId);
    if (chapter) {
      chapter.order = index + 1;
    }
  });
  this.chapters.sort((a, b) => a.order - b.order);
  return this.save();
};

module.exports = mongoose.model('Book', bookSchema);
