const express = require('express');
const z = require('zod');
const Book = require('../models/Book');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const createBookSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().optional(),
  description: z.string().max(1000).optional(),
  genre: z.enum(['fiction', 'non-fiction', 'biography', 'self-help', 'technical', 'business', 'other']).optional(),
  metadata: z.object({
    targetAudience: z.string().optional(),
    tone: z.string().optional(),
    language: z.string().optional(),
    estimatedLength: z.number().optional(),
    keywords: z.array(z.string()).optional()
  }).optional()
});

const chapterSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  status: z.enum(['draft', 'ai-generated', 'final']).optional()
});

// Get all books for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find({ author: req.user._id })
      .populate('author', 'username email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments({ author: req.user._id });

    res.json({
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error while fetching books' });
  }
});

// Get a specific book
router.get('/:id', authenticate, async (req, res) => {
  try {
    const book = await Book.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    }).populate('author', 'username email');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ book });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Server error while fetching book' });
  }
});

// Create a new book
router.post('/', authenticate, async (req, res) => {
  try {
    const validatedData = createBookSchema.parse(req.body);
    
    const book = new Book({
      ...validatedData,
      author: req.user._id
    });

    await book.save();

    // Update user stats
    req.user.stats.booksCreated += 1;
    await req.user.save();

    res.status(201).json({
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    console.error('Create book error:', error);
    res.status(500).json({ message: 'Server error while creating book' });
  }
});

// Update a book
router.put('/:id', authenticate, async (req, res) => {
  try {
    const book = await Book.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const allowedUpdates = ['title', 'subtitle', 'description', 'genre', 'metadata', 'cover', 'status', 'settings'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    Object.assign(book, updates);
    await book.save();

    res.json({
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Server error while updating book' });
  }
});

// Delete a book
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const book = await Book.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await Book.findByIdAndDelete(req.params.id);

    // Update user stats
    if (req.user.stats.booksCreated > 0) {
      req.user.stats.booksCreated -= 1;
      await req.user.save();
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error while deleting book' });
  }
});

// Add chapter to book
router.post('/:id/chapters', authenticate, async (req, res) => {
  try {
    const validatedData = chapterSchema.parse(req.body);
    
    const book = await Book.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.addChapter(validatedData);

    res.status(201).json({
      message: 'Chapter added successfully',
      book
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    console.error('Add chapter error:', error);
    res.status(500).json({ message: 'Server error while adding chapter' });
  }
});

// Update chapter
router.put('/:id/chapters/:chapterId', authenticate, async (req, res) => {
  try {
    const validatedData = chapterSchema.parse(req.body);
    
    const book = await Book.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.updateChapter(req.params.chapterId, validatedData);

    // Update user word count
    req.user.stats.wordsWritten = book.stats.totalWords;
    await req.user.save();

    res.json({
      message: 'Chapter updated successfully',
      book
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    console.error('Update chapter error:', error);
    res.status(500).json({ message: 'Server error while updating chapter' });
  }
});

// Reorder chapters
router.put('/:id/chapters/reorder', authenticate, async (req, res) => {
  try {
    const { newOrder } = req.body;
    
    if (!Array.isArray(newOrder)) {
      return res.status(400).json({ message: 'newOrder must be an array' });
    }

    const book = await Book.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.reorderChapters(newOrder);

    res.json({
      message: 'Chapters reordered successfully',
      book
    });
  } catch (error) {
    console.error('Reorder chapters error:', error);
    res.status(500).json({ message: 'Server error while reordering chapters' });
  }
});

// Auto-save book
router.post('/:id/autosave', authenticate, async (req, res) => {
  try {
    const book = await Book.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.lastAutoSave = new Date();
    await book.save();

    res.json({ 
      message: 'Auto-save successful',
      timestamp: book.lastAutoSave
    });
  } catch (error) {
    console.error('Auto-save error:', error);
    res.status(500).json({ message: 'Server error during auto-save' });
  }
});

// Get public book preview
router.get('/:id/preview', async (req, res) => {
  try {
    const book = await Book.findOne({ 
      _id: req.params.id,
      'settings.publicPreview': true
    }).populate('author', 'username profile.firstName profile.lastName');

    if (!book) {
      return res.status(404).json({ message: 'Book not found or preview not available' });
    }

    // Check password if required
    if (book.settings.previewPassword) {
      const { password } = req.query;
      if (password !== book.settings.previewPassword) {
        return res.status(401).json({ message: 'Invalid preview password' });
      }
    }

    res.json({ book });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ message: 'Server error while fetching preview' });
  }
});

module.exports = router;
