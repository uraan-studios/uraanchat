# UraanChat - Modern AI Chat Platform

*Modern AI chat application with multi-model support, file uploads, and a beautiful, responsive interface*

## 🌟 Application Showcase

- **Main Chat Interface:** Clean, modern chat interface with model selection and real-time streaming.
- **Multi-Model AI Chat:** Compare responses from multiple AI models side-by-side.
- **Model Selection:** Browse and select from a variety of AI models with provider logos and capabilities.
- **File Attachments:** Upload and analyze images and documents with supported models.
- **Settings & API Key Management:** Manage your API keys and preferences securely.
- **Chat History & Sidebar:** Organized chat history with conversation management.
- **Authentication:** Secure authentication with modern providers.

> **Live Demo:** _Coming Soon_

A modern, feature-rich AI chat application inspired by the best in the industry. UraanChat showcases advanced chat capabilities with multi-model support, file attachments, and a beautiful, responsive interface.

## 🏆 Project Highlights

- **Multi-Model AI Chat:** Chat with and compare responses from multiple AI models (Gemini, OpenAI, Claude, Grok, and more)
- **File Attachments:** Upload and analyze images and documents
- **User Authentication:** Secure login and session management
- **Chat History:** Persistent, searchable chat storage
- **Modern UI:** Built with Radix UI, Tailwind CSS, and Lucide icons
- **Prisma ORM:** MySQL database support with robust schema
- **API Routes:** Extensible API endpoints for chat, uploads, and authentication
- **Dark Mode:** Theme switching with `next-themes`
- **TypeScript:** Fully typed codebase for safety and maintainability

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, Radix UI
- **Authentication:** Custom (Better Auth UI, extensible)
- **Database:** Prisma ORM (MySQL)
- **AI Integration:** OpenRouter, Gemini, OpenAI, Claude, Grok
- **Animations:** Framer Motion (optional)
- **Icons:** Lucide React
- **Markdown:** React Markdown with syntax highlighting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/uraanchat.git
   cd uraanchat
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your database and API keys.
4. **Set up the database:**
   ```bash
   npx prisma migrate dev
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
6. **Open your browser:**
   - Visit [http://localhost:3000](http://localhost:3000)

## 🧪 Testing Instructions

1. **Register/Login:** Use the authentication system to create an account.
2. **Add Your API Key:** Enter your OpenRouter or other provider API key in settings.
3. **Start Chatting:** Explore all features, including multi-model chat, file uploads, and chat history.

## 🎯 Key Features Deep Dive

### Multi-Model Chat
- Select and chat with multiple AI models simultaneously
- Compare responses side-by-side for deeper insights

### Intelligent File Processing
- **Image Support:** JPEG, PNG, GIF, WebP (up to 32MB depending on model)
- **Document Support:** PDF and more for supported models
- **Smart Validation:** Only allows uploads for models that support the file type

### Advanced Chat Management
- **Auto-generated Titles:** Conversations get intelligent titles based on content
- **Persistent History:** All conversations saved and synced
- **Resumable Streams:** Continue interrupted conversations seamlessly
- **Search & Organization:** Find past conversations quickly

### Performance & UX
- **Real-time Streaming:** See responses as they're generated
- **Optimistic Updates:** Instant UI feedback
- **Keyboard Shortcuts:** Efficient navigation
- **Loading States:** Clear feedback during all operations

## 🔧 Architecture Highlights

### Frontend
- **Component-based Design:** Modular, reusable React components
- **Context API & Custom Hooks:** Centralized state management
- **TypeScript:** Full type safety

### Backend
- **API Routes:** RESTful endpoints for all operations
- **Database Schema:** Optimized MySQL schema for chat data
- **Authentication:** Secure, extensible authentication
- **File Storage:** Efficient file upload and storage system

### AI Integration
- **OpenRouter Integration:** Unified API for multiple AI providers
- **Streaming Support:** Real-time response streaming
- **Error Handling:** Robust error handling and fallbacks
- **Rate Limiting:** Built-in protection against API abuse

## 🔒 Security & Privacy
- **Secure Authentication:** Industry-standard authentication
- **API Key Protection:** User API keys encrypted and stored securely
- **Data Privacy:** User conversations and data properly protected
- **HTTPS Only:** All communications encrypted in transit
- **Input Validation:** Comprehensive input sanitization

## 🤖 Supported AI Models (Examples)
- **Google Gemini** (2.0 Flash, 2.5 Pro, etc.)
- **OpenAI GPT-4o, GPT-4.1, o3-mini, o4-mini**
- **Anthropic Claude** (Opus, Sonnet, 3.5, etc.)
- **Meta Llama** (3.3, 4, etc.)
- **DeepSeek, Grok, and more**

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Theo Browne** for inspiring the modern chat clone movement
- **OpenRouter** for unified AI model access
- **Vercel** for hosting and deployment
- **Prisma** for database ORM
- **All open source contributors**

---

**Built with ❤️**
