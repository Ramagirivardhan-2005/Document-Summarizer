import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  UploadCloud,
  Sparkles,
  Zap,
  ShieldCheck,
  FileCheck,
  Layers,
  ArrowRight,
  Download,
  Clock,
  Sliders,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-24 py-8 md:py-16">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-sm animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Next-Gen Document Intelligence Powered by Gemini AI</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Turn Long Documents Into{' '}
          <span className="gradient-text">Structured Insights</span> In Seconds
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Upload any PDF or scanned image. Our engine parses the text, extracts key concepts,
          and generates structured, actionable executive summaries with Google Gemini.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to={isAuthenticated ? '/upload' : '/register'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-white text-base font-semibold gradient-bg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Upload Document</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={isAuthenticated ? '/history' : '/login'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-slate-700 bg-white border border-slate-300 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
          >
            <span>{isAuthenticated ? 'View Past Summaries' : 'Sign In to Account'}</span>
          </Link>
        </div>

        {/* Supported formats badge */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Supported Formats:</span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-semibold text-slate-800 shadow-xs">
            📄 PDF (.pdf)
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-semibold text-slate-800 shadow-xs">
            🖼️ JPEG (.jpg, .jpeg)
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-semibold text-slate-800 shadow-xs">
            🖼️ PNG (.png)
          </span>
          <span className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 font-semibold text-purple-800 shadow-xs">
            ✍️ Handwritten Notes & Letters
          </span>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How It Works</h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            From raw upload to structured intelligence in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative card-hover">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-6 border border-blue-100">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Document</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Drag and drop your PDF report, whitepaper, invoice, or scanned image. We validate
              file types and integrity automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative card-hover">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-6 border border-indigo-100">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Text Extraction & OCR</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our backend extracts native PDF text or triggers Tesseract.js OCR for images,
              cleaning and normalizing every sentence.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative card-hover">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-lg mb-6 border border-violet-100">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Gemini AI Summary</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Google Gemini generates a structured overview, bulleted key points, main ideas,
              important topics, and conclusions based on your desired length.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4 bg-gradient-to-b from-slate-100/70 to-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Engineered for Precision & Clarity
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Every feature is crafted to save you time when dealing with heavy documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Length Flexibility</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Switch between Short (concise punchy overview), Medium (balanced context), and Long
              (in-depth executive breakdown) at any time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Zero Hallucination Prompting</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict system instructions ensure Gemini summarizes only what is physically in the
              document, preserving numbers, dates, and technical terms.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Instant PDF & Text Export</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Download clean, beautifully formatted PDF reports or plain text files ready to share
              with team members or clients.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100/70 text-violet-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Document History</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              All summarized documents and their insights are safely stored in your private history
              dashboard for quick review or re-generation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Fast OCR Pipeline</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tesseract.js integration recognizes scanned text, receipts, screenshots, and photos
              with high optical accuracy.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Isolated & Secure</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Protected with JWT authentication, bcrypt password hashing, and server-side secret
              isolation.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA banner */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="gradient-bg text-white p-10 sm:p-12 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Summarize Your Documents?</h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
            Upload your first document in seconds. No complex setup required.
          </p>
          <Link
            to={isAuthenticated ? '/upload' : '/register'}
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-md"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Get Started Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
