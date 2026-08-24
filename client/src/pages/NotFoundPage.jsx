import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner border border-blue-100">
        <FileQuestion className="w-10 h-10" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-extrabold text-slate-900">404 - Page Not Found</h1>
        <p className="text-sm text-slate-500">
          The page you are looking for might have been moved, removed, or is temporarily
          unavailable.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold gradient-bg shadow-md shadow-blue-500/20 hover:opacity-95 transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
