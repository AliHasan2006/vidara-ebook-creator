const express = require('express');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const puppeteer = require('puppeteer');
const Book = require('../models/Book');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Export book as PDF
router.post('/:id/pdf', authenticate, async (req, res) => {
  try {
    const book = await Book.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    }).populate('author', 'username profile.firstName profile.lastName');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Generate HTML for PDF
    const html = generatePDFHTML(book);

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set content and wait for it to load
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
          ${book.title}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `
    });

    await browser.close();

    // Update user stats
    req.user.stats.booksExported += 1;
    await req.user.save();

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ message: 'Server error while exporting PDF' });
  }
});

// Export book as DOCX
router.post('/:id/docx', authenticate, async (req, res) => {
  try {
    const book = await Book.findOne({ 
      _id: req.params.id, 
      author: req.user._id 
    }).populate('author', 'username profile.firstName profile.lastName');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
  }

    // Create DOCX document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title page
          new Paragraph({
            children: [
              new TextRun({
                text: book.title,
                bold: true,
                size: 32
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          
          // Author
          new Paragraph({
            children: [
              new TextRun({
                text: `By ${book.author.profile?.firstName || book.author.username}`,
                size: 24
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 }
          }),

          // Subtitle (if exists)
          ...(book.subtitle ? [new Paragraph({
            children: [
              new TextRun({
                text: book.subtitle,
                italics: true,
                size: 20
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          })] : []),

          // Description (if exists)
          ...(book.description ? [new Paragraph({
            children: [
              new TextRun({
                text: book.description,
                size: 22
              })
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 800 }
          })] : []),

          // Page break before chapters
          new Paragraph({
            children: [],
            pageBreakBefore: true
          }),

          // Table of Contents
          new Paragraph({
            children: [
              new TextRun({
                text: "Table of Contents",
                bold: true,
                size: 28
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 400 }
          }),

          // Chapter list for TOC
          ...book.chapters.map((chapter, index) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: `Chapter ${index + 1}: ${chapter.title}`
                })
              ],
              spacing: { after: 200 }
            })
          ),

          // Page break before content
          new Paragraph({
            children: [],
            pageBreakBefore: true
          }),

          // Chapters
          ...book.chapters.flatMap((chapter, index) => [
            // Chapter title
            new Paragraph({
              children: [
                new TextRun({
                  text: `Chapter ${index + 1}: ${chapter.title}`,
                  bold: true,
                  size: 24
                })
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 400 }
            }),

            // Chapter content (convert markdown to paragraphs)
            ...parseMarkdownToParagraphs(chapter.content)
          ])
        ]
      }]
    });

    // Generate DOCX buffer
    const buffer = await Packer.toBuffer(doc);

    // Update user stats
    req.user.stats.booksExported += 1;
    await req.user.save();

    // Set headers for DOCX download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, '_')}.docx"`);

    res.send(buffer);
  } catch (error) {
    console.error('DOCX export error:', error);
    res.status(500).json({ message: 'Server error while exporting DOCX' });
  }
});

// Helper function to generate HTML for PDF
function generatePDFHTML(book) {
  const authorName = book.author.profile?.firstName || book.author.username;
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${book.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        body {
          font-family: 'Inter', serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20mm;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          color: #6D28D9;
          margin-top: 2em;
          margin-bottom: 1em;
        }
        
        h1 {
          font-size: 28pt;
          text-align: center;
          color: #333;
          margin-bottom: 2em;
        }
        
        h2 {
          font-size: 20pt;
          border-bottom: 2px solid #6D28D9;
          padding-bottom: 0.5em;
        }
        
        .title-page {
          text-align: center;
          margin-bottom: 4em;
        }
        
        .author {
          font-size: 16pt;
          font-style: italic;
          margin-bottom: 3em;
        }
        
        .subtitle {
          font-size: 18pt;
          color: #666;
          margin-bottom: 2em;
        }
        
        .description {
          font-size: 14pt;
          text-align: justify;
          margin: 0 auto;
          max-width: 80%;
          line-height: 1.8;
        }
        
        .toc {
          margin-bottom: 3em;
        }
        
        .toc h2 {
          text-align: center;
          border-bottom: none;
        }
        
        .toc ul {
          list-style: none;
          padding: 0;
        }
        
        .toc li {
          margin-bottom: 0.5em;
          padding-left: 2em;
        }
        
        .chapter {
          page-break-before: always;
        }
        
        .chapter:first-of-type {
          page-break-before: auto;
        }
        
        p {
          margin-bottom: 1em;
          text-align: justify;
        }
        
        blockquote {
          border-left: 4px solid #D4AF37;
          margin: 1.5em 0;
          padding: 0.5em 1.5em;
          background-color: #f9f9f9;
          font-style: italic;
        }
        
        code {
          background-color: #f4f4f4;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }
        
        pre {
          background-color: #f4f4f4;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
        }
        
        ul, ol {
          margin-left: 2em;
          margin-bottom: 1em;
        }
        
        table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 1em;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 0.5em;
          text-align: left;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        
        @page {
          margin: 20mm;
        }
        
        @page :first {
          margin-top: 40mm;
        }
      </style>
    </head>
    <body>
      <!-- Title Page -->
      <div class="title-page">
        <h1>${book.title}</h1>
        <div class="author">By ${authorName}</div>
        ${book.subtitle ? `<div class="subtitle">${book.subtitle}</div>` : ''}
        ${book.description ? `<div class="description">${book.description}</div>` : ''}
      </div>
      
      <!-- Table of Contents -->
      <div class="toc">
        <h2>Table of Contents</h2>
        <ul>
          ${book.chapters.map((chapter, index) => 
            `<li>Chapter ${index + 1}: ${chapter.title}</li>`
          ).join('')}
        </ul>
      </div>
      
      <!-- Chapters -->
      ${book.chapters.map((chapter, index) => `
        <div class="chapter">
          <h2>Chapter ${index + 1}: ${chapter.title}</h2>
          ${parseMarkdownToHTML(chapter.content)}
        </div>
      `).join('')}
    </body>
    </html>
  `;

  return html;
}

// Helper function to parse markdown to HTML
function parseMarkdownToHTML(markdown) {
  if (!markdown) return '';
  
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

// Helper function to parse markdown to DOCX paragraphs
function parseMarkdownToParagraphs(markdown) {
  if (!markdown) return [];
  
  const lines = markdown.split('\n');
  const paragraphs = [];
  let currentParagraph = '';
  let inCodeBlock = false;
  let inList = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (currentParagraph.trim()) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: currentParagraph.trim() })]
        }));
        currentParagraph = '';
      }
      continue;
    }

    if (inCodeBlock) {
      if (currentParagraph) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: currentParagraph, font: "Courier New" })]
        }));
        currentParagraph = '';
      }
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line, font: "Courier New" })]
      }));
      continue;
    }

    if (line.trim() === '') {
      if (currentParagraph.trim()) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: currentParagraph.trim() })]
        }));
        currentParagraph = '';
      }
      continue;
    }

    if (line.startsWith('# ')) {
      if (currentParagraph.trim()) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: currentParagraph.trim() })]
        }));
      }
      paragraphs.push(new Paragraph({
        children: [new TextRun({ 
          text: line.substring(2).trim(), 
          bold: true, 
          size: 24 
        })],
        heading: HeadingLevel.HEADING_2
      }));
      currentParagraph = '';
    } else if (line.startsWith('## ')) {
      if (currentParagraph.trim()) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: currentParagraph.trim() })]
        }));
      }
      paragraphs.push(new Paragraph({
        children: [new TextRun({ 
          text: line.substring(3).trim(), 
          bold: true, 
          size: 20 
        })],
        heading: HeadingLevel.HEADING_3
      }));
      currentParagraph = '';
    } else if (line.startsWith('* ')) {
      if (currentParagraph.trim()) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: currentParagraph.trim() })]
        }));
        currentParagraph = '';
      }
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: `• ${line.substring(2).trim() }` })]
      }));
    } else {
      currentParagraph += (currentParagraph ? ' ' : '') + line;
    }
  }

  if (currentParagraph.trim()) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: currentParagraph.trim() })]
    }));
  }

  return paragraphs;
}

module.exports = router;
