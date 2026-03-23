const express = require('express');
const z = require('zod');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Book = require('../models/Book');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Initialize Google AI
const ai = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Validation schemas
const wizardSchema = z.object({
  title: z.string().min(1),
  genre: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  language: z.string().default('English'),
  estimatedChapters: z.number().min(1).max(50).default(10),
  keywords: z.array(z.string()).optional()
});

const draftChapterSchema = z.object({
  bookId: z.string(),
  chapterTitle: z.string().min(1),
  chapterNumber: z.number().min(1),
  previousChapters: z.array(z.object({
    title: z.string(),
    content: z.string()
  })).optional(),
  additionalInstructions: z.string().optional()
});

const rewriteTextSchema = z.object({
  text: z.string().min(10),
  instruction: z.enum(['summarize', 'expand', 'rephrase', 'simplify']),
  context: z.string().optional()
});

// Smart Wizard - Generate chapter outline
router.post('/wizard', authenticate, async (req, res) => {
  try {
    const validatedData = wizardSchema.parse(req.body);
    
    const prompt = `As an expert book outline creator, generate a comprehensive chapter outline for a book with the following details:

Title: ${validatedData.title}
Genre: ${validatedData.genre || 'Not specified'}
Target Audience: ${validatedData.targetAudience || 'General audience'}
Tone: ${validatedData.tone || 'Professional and engaging'}
Language: ${validatedData.language}
Estimated Chapters: ${validatedData.estimatedChapters}
Keywords: ${validatedData.keywords?.join(', ') || 'None'}

Please create a structured JSON response with:
1. A compelling book description
2. Chapter titles with brief descriptions
3. Suggested word count per chapter
4. Key themes and topics to cover

Format your response as valid JSON:
{
  "description": "Compelling book description",
  "chapters": [
    {
      "title": "Chapter title",
      "description": "Brief description of what this chapter covers",
      "estimatedWords": 2000,
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "totalEstimatedWords": 20000,
  "themes": ["Theme 1", "Theme 2"]
}`;

    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the AI response as JSON
    let outline;
    try {
      // Clean up the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        outline = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // If parsing fails, create a basic structure
      outline = {
        description: `An engaging book about ${validatedData.title}`,
        chapters: Array.from({ length: validatedData.estimatedChapters }, (_, i) => ({
          title: `Chapter ${i + 1}`,
          description: `Content for chapter ${i + 1}`,
          estimatedWords: 2000,
          keyPoints: [`Key point ${i + 1}.1`, `Key point ${i + 1}.2`]
        })),
        totalEstimatedWords: validatedData.estimatedChapters * 2000,
        themes: ['Primary theme', 'Secondary theme']
      };
    }

    res.json({
      message: 'Chapter outline generated successfully',
      outline
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    console.error('AI Wizard error:', error);
    res.status(500).json({ message: 'Server error while generating outline' });
  }
});

// Contextual Drafter - Draft chapter content
router.post('/draft-chapter', authenticate, async (req, res) => {
  try {
    const validatedData = draftChapterSchema.parse(req.body);
    
    // Verify book ownership
    const book = await Book.findOne({ 
      _id: validatedData.bookId, 
      author: req.user._id 
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    let contextPrompt = '';
    if (validatedData.previousChapters && validatedData.previousChapters.length > 0) {
      contextPrompt = `\n\nPrevious chapters for context:\n${validatedData.previousChapters.map((ch, i) => 
        `Chapter ${i + 1}: ${ch.title}\n${ch.content.substring(0, 500)}...`
      ).join('\n\n')}`;
    }

    const prompt = `As an expert content writer, draft chapter ${validatedData.chapterNumber} titled "${validatedData.chapterTitle}" for a book.

Book details:
- Title: ${book.title}
- Genre: ${book.genre || 'Not specified'}
- Target Audience: ${book.metadata?.targetAudience || 'General audience'}
- Tone: ${book.metadata?.tone || 'Professional and engaging'}
- Language: ${book.metadata?.language || 'English'}${contextPrompt}

Additional instructions: ${validatedData.additionalInstructions || 'Write engaging, well-structured content that flows naturally.'}

Please write the chapter content in Markdown format with:
- Clear headings and subheadings
- Well-structured paragraphs
- Engaging introduction and conclusion
- Appropriate length for a book chapter (1500-3000 words)

Focus on creating valuable, readable content that maintains consistency with the book's overall style and tone.`;

    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    res.json({
      message: 'Chapter drafted successfully',
      content,
      wordCount: content.split(/\s+/).filter(word => word.length > 0).length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    console.error('Draft chapter error:', error);
    res.status(500).json({ message: 'Server error while drafting chapter' });
  }
});

// AI Sidekick - Rewrite/summarize text
router.post('/rewrite', authenticate, async (req, res) => {
  try {
    const validatedData = rewriteTextSchema.parse(req.body);
    
    let prompt = '';
    switch (validatedData.instruction) {
      case 'summarize':
        prompt = `Summarize the following text in a clear, concise way while maintaining the key points:\n\n${validatedData.text}`;
        break;
      case 'expand':
        prompt = `Expand on the following text with more detail, examples, and depth while maintaining the original meaning:\n\n${validatedData.text}`;
        break;
      case 'rephrase':
        prompt = `Rephrase the following text to improve clarity, flow, and engagement while preserving the original meaning:\n\n${validatedData.text}`;
        break;
      case 'simplify':
        prompt = `Simplify the following text to make it more accessible and easier to understand:\n\n${validatedData.text}`;
        break;
    }

    if (validatedData.context) {
      prompt += `\n\nContext: ${validatedData.context}`;
    }

    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rewrittenText = response.text();

    res.json({
      message: 'Text rewritten successfully',
      originalText: validatedData.text,
      rewrittenText,
      instruction: validatedData.instruction
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
    }
    console.error('Rewrite text error:', error);
    res.status(500).json({ message: 'Server error while rewriting text' });
  }
});

// Generate book title suggestions
router.post('/suggest-titles', authenticate, async (req, res) => {
  try {
    const { description, genre, targetAudience, keywords } = req.body;
    
    const prompt = `As an expert book marketer, generate 10 compelling book titles based on:

Description: ${description || 'Not provided'}
Genre: ${genre || 'Not specified'}
Target Audience: ${targetAudience || 'General audience'}
Keywords: ${keywords?.join(', ') || 'None'}

Provide titles that are:
- Catchy and memorable
- Relevant to the content
- Appropriate for the target audience
- Market-friendly

Return as a JSON array of strings: ["Title 1", "Title 2", ...]`;

    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let titles;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        titles = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback to simple text parsing
      titles = text.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/[""]/g, ''))
        .slice(0, 10);
    }

    res.json({
      message: 'Title suggestions generated',
      titles
    });
  } catch (error) {
    console.error('Suggest titles error:', error);
    res.status(500).json({ message: 'Server error while generating titles' });
  }
});

module.exports = router;
