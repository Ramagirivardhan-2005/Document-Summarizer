import React from 'react';
import { FileText, Shield, Zap, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              Document Summary Assistant
            </span>
            <span className="text-xs text-slate-400">| Powered by Google Gemini AI & OCR</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure & Private Processing</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant PDF & Image OCR</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Structured Summaries</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} DocuSummarize. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
