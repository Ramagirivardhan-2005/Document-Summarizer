# Document Summary Assistant (DocuSummarize)

An interactive, fullstack AI-powered document intelligence studio and summarization web application built with **React**, **Tailwind CSS**, **Node.js/Express**, **MongoDB Atlas**, and **Google Gemini AI**, with native **page-by-page PDF parsing** and **Tesseract.js OCR**.

---

## 200-Word Project Approach

The **Document Summary Assistant** delivers an interactive document intelligence studio. Users upload documents via a drag-and-drop interface supporting PDFs and images (JPG, JPEG, PNG). The Express backend validates file integrity, file type, and enforces a 10MB limit. 

For PDFs, the server uses `pdf-parse` with custom renderers to extract text page-by-page. For image files, `tesseract.js` performs optical character recognition (OCR). The extracted text is sanitized and normalized.

The frontend features a split-screen studio: an interactive Document Reader on the left with page navigation, page range selectors, in-document search, and text highlighting; and an AI Assistant on the right. When users highlight text or pick pages, Gemini (`gemini-2.5-flash`) executes context-aware actions including short paragraph summaries, plain-English explanations with Mermaid flowcharts, multi-language translations (e.g. Telugu, Hindi, Spanish), and open-ended Q&A. 

MongoDB Atlas persists relational records for `User` → `Document` → `Summary` and `Interaction` history. The application is deployed with the React frontend on **Vercel** and Express API on **Render**, keeping API keys strictly backend-isolated.

---

## Core Workflow: Upload → Read → Select → Ask AI

```
[Upload PDF/Image] ──▶ [Interactive Reader] ──▶ [Select Page / Paragraph] ──▶ [Ask AI / Translate / Flowchart]
        │                       │                                                      │
        ▼                       ▼                                                      ▼
• Multi-format ingestion • Page navigation & search                   • 2-3 sentence summaries
• Page-by-page parsing   • Custom page ranges (e.g. Pages 10-15)      • Telugu & multi-language translation
• Scanned OCR extraction • In-text paragraph highlighting             • Simple English & Mermaid Flowcharts
```

---

## Key Features

- **Interactive Split-Screen Studio**:
  - **Left Pane (Document Reader)**: Page-by-page navigation (`Page 12 of 30`), single-page vs. multi-page range view (`Pages 10–15`), in-document search with keyword highlighting, and text selection listener.
  - **Right Pane (AI Assistant)**: Context-aware tabs for Summarization, Plain-English Explanations with Flowcharts, Multi-Language Translations, and Custom Prompt Q&A.
- **Floating Context Toolbar**:
  - Highlighting any paragraph immediately offers instant action shortcuts: **Summarize Short**, **Explain**, and **Translate to Telugu**.
- **Multi-Language Translation**:
  - Translate selected paragraphs or entire pages into Telugu, Hindi, Tamil, Kannada, Marathi, Spanish, French, German, Japanese, and more.
- **Methodology Explanations & Flowcharts**:
  - Type requests like *"Explain the methodology in simple English and create a flowchart."* and receive structured explanations with Mermaid.js diagrams.
- **Executive Summary Dashboard**:
  - One-click toggle to view the full document executive summary (Overview, Key Points, Main Ideas, Important Topics, Conclusion).
  - Download as a formatted PDF report or plain text (`.txt`).
- **User Document Vault & History**:
  - Scoped to authenticated users with JWT and bcrypt password protection.
  - Search past documents, view previous interactions, and delete records.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Axios, React Router v6, Lucide React, jsPDF |
| **Backend** | Node.js (ES Modules), Express.js, Multer, Helmet, CORS, Morgan |
| **Database** | MongoDB Atlas / Local MongoDB, Mongoose ODM |
| **AI / LLM** | Google Gemini API (`gemini-2.5-flash` / `@google/generative-ai`) |
| **Document OCR / Parsing** | `pdf-parse` (Page-by-page PDF parser), `tesseract.js` (Image OCR) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Hosting** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## Quick Start Guide

### 1. Backend:
```bash
cd server
cp .env.example .env
# Set your GEMINI_API_KEY and MONGODB_URI
npm start
```

### 2. Frontend:
```bash
cd client
npm run dev
```

Open **`http://localhost:5173`** in your browser.
