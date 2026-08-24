import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { documentService } from '../services/api';
import {
  FileText,
  Trash2,
  Eye,
  RotateCw,
  UploadCloud,
  Search,
  Clock,
  Layers,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  FileSearch,
} from 'lucide-react';

export const HistoryPage = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await documentService.getDocuments();
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError(err.message || 'Failed to load document history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document and its summary?')) {
      return;
    }

    setDeletingId(id);
    try {
      await documentService.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter & Search
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'pdf'
        ? doc.fileType?.toLowerCase() === 'pdf'
        : ['jpg', 'jpeg', 'png'].includes(doc.fileType?.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Document Vault</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Document History
          </h1>
          <p className="text-sm text-slate-500">
            Access, view, and manage all your past AI-analyzed documents.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-bg shadow-md shadow-blue-500/20 hover:opacity-95 transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Filter:</span>
          {['all', 'pdf', 'image'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterType === type
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading document history...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <button
            onClick={fetchDocuments}
            className="px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <FileSearch className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              {searchQuery ? 'No matching documents found' : 'No documents summarized yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search keywords or filters.'
                : 'Upload your first PDF or image document to generate actionable summaries.'}
            </p>
          </div>
          {!searchQuery && (
            <div className="pt-2">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white gradient-bg shadow-sm hover:opacity-95"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload First Document</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Document</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Summary Length</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDocuments.map((doc) => {
                  const isPdf = doc.fileType?.toLowerCase() === 'pdf';
                  const summaryLength = doc.summary?.summaryLength || 'medium';
                  const isDeleting = deletingId === doc._id;

                  return (
                    <tr
                      key={doc._id}
                      onClick={() => navigate(`/summary/${doc._id}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Document Name & Size */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isPdf
                                ? 'bg-red-50 text-red-600 border border-red-100'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}
                          >
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <p className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatFileSize(doc.fileSize)} • {doc.pageCount || 1}{' '}
                              {doc.pageCount === 1 ? 'page' : 'pages'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* File Type */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${
                            isPdf
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {doc.fileType}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Summary Length */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                          {summaryLength}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Summarized</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => navigate(`/summary/${doc._id}`)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Summary"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => navigate(`/summary/${doc._id}`)}
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Summarize Again / Change Length"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => handleDelete(doc._id, e)}
                            disabled={isDeleting}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Document"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
