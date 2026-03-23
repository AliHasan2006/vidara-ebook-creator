# Vidara eBook Creator

🚀 **AI-Powered eBook Creation Platform** - Transform your ideas into published masterpieces with advanced AI assistance, professional editing tools, and seamless publishing.

## ✨ Features

### 🎨 **Luxury Minimalist Design**
- Deep Purple (#6D28D9) & Champagne Gold (#D4AF37) color scheme
- Space Grotesk & Inter typography
- Glassmorphism effects with Framer Motion animations
- Skeleton loaders for enhanced UX

### 🔐 **Enterprise Security**
- JWT-based authentication with HTTP-only cookies
- Role-Based Access Control (Author, Admin, Reader)
- Bcrypt password hashing
- Rate limiting and CORS protection

### 🧠 **AI Intelligence Engine**
- **Smart Wizard**: 2-step book outline generation
- **Contextual Drafter**: AI-powered chapter writing
- **AI Sidekick**: Text rewriting (summarize, expand, rephrase, simplify)
- Google Gemini integration

### ✍️ **Next-Gen Editorial Suite**
- **Triple-Pane Layout**: Chapter sidebar, Monaco editor, live preview
- **Drag-and-drop** chapter reordering
- **Status indicators**: Draft/AI Generated/Final
- **Real-time auto-save** with debouncing

### 📄 **Export & Publishing**
- Professional PDF export with TOC and page numbers
- DOCX export for manuscript editing
- Live preview links with password protection
- Custom cover pages

### 🏠 **Conversion Landing Page**
- Glassmorphism hero section
- Sample book showcase
- Analytics dashboard
- Premium cards and stats widgets

## 🛠 Tech Stack

### Backend (MERN)
- **Node.js** + **Express.js**
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Helmet.js** + **CORS** for security
- **Google Gemini AI** SDK
- **Puppeteer** for PDF generation
- **docx** library for Word export

### Frontend
- **React 18** with **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Hook Form** + **Zod** for validation
- **dnd-kit** for drag-and-drop
- **Monaco Editor** for code editing
- **Axios** for API calls

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB
- Google AI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vidara-ebook-creator
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
```

3. **Environment Setup**
```bash
# Backend environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Google AI API key

# Frontend environment
cd client
cp .env.example .env
# Edit .env with your API URL
```

4. **Start the application**
```bash
# From root directory - starts both backend and frontend
npm run dev

# Or start individually:
npm run server  # Backend on port 5000
npm run client  # Frontend on port 3000
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## 📁 Project Structure

```
vidara-ebook-creator/
├── server/                     # Backend application
│   ├── models/                # Mongoose models
│   │   ├── User.js           # User model with RBAC
│   │   └── Book.js           # Book and chapters model
│   ├── routes/               # API routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── books.js          # Book management
│   │   ├── ai.js             # AI integration
│   │   └── export.js         # PDF/DOCX export
│   ├── middleware/           # Custom middleware
│   │   └── auth.js           # JWT authentication
│   └── index.js              # Express server setup
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── common/       # UI components
│   │   │   ├── auth/         # Authentication forms
│   │   │   └── editor/       # Editor components
│   │   ├── context/          # React context
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   └── public/               # Static assets
├── package.json              # Root dependencies
└── README.md                # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Books
- `GET /api/books` - Get user's books
- `POST /api/books` - Create new book
- `GET /api/books/:id` - Get specific book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `POST /api/books/:id/chapters` - Add chapter
- `PUT /api/books/:id/chapters/:chapterId` - Update chapter
- `PUT /api/books/:id/chapters/reorder` - Reorder chapters

### AI Features
- `POST /api/ai/wizard` - Generate book outline
- `POST /api/ai/draft-chapter` - Generate chapter content
- `POST /api/ai/rewrite` - Rewrite text
- `POST /api/ai/suggest-titles` - Suggest book titles

### Export
- `POST /api/export/:id/pdf` - Export to PDF
- `POST /api/export/:id/docx` - Export to DOCX

## 🎯 Usage Guide

### 1. **Creating a Book**
1. Sign up/login to your account
2. Click "Create New Book" on dashboard
3. Use the AI Wizard to generate an outline
4. Review and customize the chapter structure

### 2. **Writing Chapters**
1. Select a chapter from the sidebar
2. Write in Markdown using the editor
3. Use AI assistance for content generation
4. Highlight text to use AI rewriting tools
5. Changes are auto-saved every 2 seconds

### 3. **AI Features**
- **Smart Wizard**: Generates comprehensive book outlines
- **Chapter Generation**: Creates content based on previous chapters
- **Text Rewriting**: Summarize, expand, rephrase, or simplify selected text
- **Title Suggestions**: Get AI-generated book title ideas

### 4. **Exporting**
1. Click "Export PDF" or "Export DOCX"
2. Choose formatting options
3. Download your professionally formatted book

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **HTTP-Only Cookies**: Prevent XSS attacks
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Zod schema validation
- **CORS Protection**: Cross-origin security
- **Helmet.js**: Security headers
- **RBAC**: Role-based access control

## 🎨 Design System

### Colors
- **Primary**: Deep Purple (#6D28D9)
- **Secondary**: Champagne Gold (#D4AF37)
- **Background**: Off-White (#F9FAFB)

### Typography
- **Headings**: Space Grotesk
- **Body**: Inter
- **Code**: Monaco/Consolas

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Forms**: React Hook Form with Zod validation
- **Loaders**: Skeleton loaders with shimmer effects
- **Notifications**: React Hot Toast

## 🚀 Performance Optimizations

- **Auto-save debouncing**: 2-second delay
- **Code splitting**: React.lazy loading
- **Image optimization**: Next-gen formats
- **Bundle analysis**: Webpack bundle analyzer
- **Caching**: HTTP caching headers
- **CDN ready**: Static asset optimization

## 📱 Responsive Design

- **Mobile-first** approach
- **Tailwind CSS** responsive utilities
- **Touch-friendly** interfaces
- **Adaptive layouts** for all screen sizes

## 🔧 Development

### Scripts
```bash
npm run dev          # Start both backend and frontend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm start           # Start production server
```

### Environment Variables
```bash
# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vidara-ebook-creator
JWT_SECRET=your-secret-key
GOOGLE_AI_API_KEY=your-google-ai-key

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Vidara eBook Creator** - Architect Your Legacy with AI-Powered Authorship ✨
