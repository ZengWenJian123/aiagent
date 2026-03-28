# Orbital Agent Hub

<div align="center">

**A Unified AI Agent Chat Web Application**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.2-green?logo=prisma)](https://www.prisma.io)

[🇨🇳 中文版本](README.md)

</div>

---

## 🌟 Preview

### Home Page

![Home Page](./screenshots/home.png)

*Modern dark theme design showcasing core features*

### Authentication Page

![Authentication Page](./screenshots/auth.png)

*Clean user registration and login interface*

### Chat Workspace

![Chat Workspace](./screenshots/chat.png)

*Three-column layout: Session Management | Chat Area | Configuration Center*

---

## 📖 Introduction

Orbital Agent Hub is a web application designed for general-purpose AI Agent scenarios, providing an integrated console from model integration to knowledge retrieval.

**Key Features:**
- 🔌 Unified management of OpenAI / Bailian / DeepSeek / OpenAI-compatible model interfaces
- 📝 Account system, session archiving, context control, file upload, and chat export
- 🧠 Lightweight RAG knowledge base built into standalone application, perfect for quick local Agent console setup
- 🎨 Modern dark theme UI with responsive design

---

## 🚀 Quick Start

### Requirements

- Node.js 18+ 
- npm / yarn / pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/ZengWenJian123/aiagent.git
cd aiagent

# Install dependencies
npm install

# Configure environment variables (copy .env file and modify)
cp .env.example .env

# Initialize database
npx prisma db push

# Start development server
npm run dev
```

### Access Application

Open browser and visit:
```
http://localhost:3000
```

---

## 📁 Project Structure

```
aiagent/
├── prisma/
│   ├── schema.prisma      # Database Schema
│   └── dev.db             # SQLite Database
├── public/                # Static Assets
├── screenshots/           # Screenshots
├── src/
│   ├── app/
│   │   ├── api/           # API Routes
│   │   ├── auth/          # Auth Pages
│   │   ├── chat/          # Chat Pages
│   │   ├── layout.tsx     # Root Layout
│   │   └── page.tsx       # Home Page
│   ├── components/
│   │   ├── auth/          # Auth Components
│   │   ├── chat/          # Chat Components
│   │   └── ui.tsx         # Base UI Components
│   └── lib/
│       ├── auth.ts        # Auth Logic
│       ├── providers.ts   # Model Providers
│       ├── rag.ts         # RAG Retrieval
│       ├── vector.ts      # Vector Embedding
│       ├── documents.ts   # Document Parsing
│       ├── schemas.ts     # Zod Validation
│       └── prisma.ts      # Database Connection
├── .env                   # Environment Variables
├── package.json           # Project Config
└── tsconfig.json          # TypeScript Config
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend Framework | Next.js 16.2.1, React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | SQLite + Prisma ORM |
| Authentication | JWT + bcryptjs |
| Validation | Zod |
| AI Integration | OpenAI API Compatible |

---

## 📋 Features

### 1. User Authentication
- User Registration / Login
- JWT Session Management
- Cookie-based Authentication

### 2. Model Configuration Center
- Multi-vendor Support:
  - OpenAI
  - Aliyun Bailian
  - DeepSeek
  - OpenAI Compatible
- Multiple model configs per user
- Default model setting
- Vision model support (image input)

### 3. Chat Workspace
- Multi-session Management
- Streaming Response
- Context Control
- System Prompt Configuration
- Message Persistence

### 4. Knowledge Base RAG System
- Document Upload: PDF, DOCX, TXT, Markdown
- Text Chunking
- Local Vector Embedding (128 dimensions)
- Similarity Search
- Citation Display

### 5. Attachment System
- Image Upload: PNG, JPG, JPEG
- Multimodal Model Support

### 6. Export Features
- Export as Markdown
- Export as JSON

---

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `AUTH_SECRET` | JWT secret key | `your-secret-key` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

---

## 📸 Screenshots Description

### Home Page Design
- Dark gradient background
- Feature cards display
- Quick navigation buttons

### Chat Interface
- Left: Session list + Knowledge base management
- Center: Chat conversation area
- Right: Model configuration center

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

## 📄 License

MIT License

---

<div align="center">

**Orbital Agent Hub**

*Build a truly practical frontend workstation for your multi-model chat application*

</div>