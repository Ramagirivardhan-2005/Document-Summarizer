import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  ArrowRight,
} from 'lucide-react';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

export const DocumentUploader = ({
  onFileUpload,
  isProcessing = false,
  uploadProgress = 0,
  summaryLength = 'medium',
  onSummaryLengthChange,
}) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (selectedFile) => {
    setValidationError('');

    if (!selectedFile) {
      return false;
    }

    // Check empty file
    if (selectedFile.size === 0) {
      setValidationError('The selected file is empty. Please upload a file with content.');
      return false;
    }

    // Check size
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(
        `File size (${formatFileSize(selectedFile.size)}) exceeds the maximum limit of ${MAX_FILE_SIZE_MB}MB.`
      );
      return false;
    }

    // Check extension and mime
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
    const isAllowedMime = ALLOWED_TYPES.includes(selectedFile.type);

    if (!isAllowedExt && !isAllowedMime) {
      setValidationError(
        'Unsupported file format. Please upload a PDF, JPG, JPEG, or PNG document.'
      );
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setValidationError('');
    } else {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setValidationError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!file) {
      setValidationError('Please select a document to upload.');
      return;
    }
    onFileUpload(file, summaryLength);
  };

  const isPdf = file?.name?.toLowerCase().endsWith('.pdf') || file?.type === 'application/pdf';

  return (
    <div className="w-full space-y-6">
      {/* Upload Zone Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 transition-all text-center ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
            : file
            ? 'border-emerald-300 bg-emerald-50/30'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/60 cursor-pointer'
        } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelect(e.target.files[0]);
            }
          }}
          disabled={isProcessing}
        />

        {!file ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">
                Drag and drop your document here, or{' '}
                <span className="text-blue-600 underline decoration-blue-300 underline-offset-2">
                  browse files
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PDF, JPG, JPEG, and PNG (Max {MAX_FILE_SIZE_MB}MB)
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                PDF
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                JPG / JPEG
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                PNG
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                ✍️ Handwritten & Scanned Notes
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm max-w-xl mx-auto">
              <div className="flex items-center gap-3.5 text-left overflow-hidden">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isPdf
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}
                >
                  {isPdf ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                </div>
                <div className="min-w-0 pr-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span className="uppercase font-medium text-slate-600">
                      {file.name.split('.').pop() || file.type}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                    </span>
                  </div>
                </div>
              </div>

              {!isProcessing && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Upload Progress Bar if uploading */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="max-w-xl mx-auto space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Uploading document...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Summary Options & Upload Button */}
      {file && !isProcessing && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Select Summary Length:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: 'short',
                  label: 'Short',
                  desc: 'Quick overview & key takeaways (~100 words)',
                },
                {
                  id: 'medium',
                  label: 'Medium',
                  desc: 'Balanced detailed summary & main topics (~250 words)',
                },
                {
                  id: 'long',
                  label: 'Long',
                  desc: 'Comprehensive deep dive & extensive points (~500 words)',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSummaryLengthChange(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    summaryLength === opt.id
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p
                    className={`text-sm font-bold ${
                      summaryLength === opt.id ? 'text-blue-700' : 'text-slate-800'
                    }`}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold gradient-bg shadow-md shadow-blue-500/20 hover:shadow-lg hover:opacity-95 transition-all"
            >
              <FileCheck className="w-5 h-5" />
              <span>Process & Summarize Document</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
