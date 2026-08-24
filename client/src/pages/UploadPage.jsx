import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService, summaryService } from '../services/api';
import DocumentUploader from '../components/DocumentUploader';
import ProcessingState from '../components/ProcessingState';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export const UploadPage = () => {
  const navigate = useNavigate();

  const [summaryLength, setSummaryLength] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('uploading');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = async (file, chosenLength) => {
    setErrorMessage('');
    setCurrentFile(file);
    setIsProcessing(true);
    setProcessingStage('uploading');
    setUploadProgress(0);

    try {
      // 1. Upload & Extract Text
      const uploadRes = await documentService.uploadDocument(file, (percent) => {
        setUploadProgress(percent);
        if (percent >= 100) {
          setProcessingStage('extracting');
        }
      });

      const uploadedDoc = uploadRes.data.document;

      // 2. Analyzing & Preparing for Gemini
      setProcessingStage('analyzing');
      await new Promise((resolve) => setTimeout(resolve, 800)); // smooth transition

      // 3. Gemini AI Generation
      setProcessingStage('generating');
      const summaryRes = await summaryService.generateSummary(
        uploadedDoc._id,
        chosenLength || summaryLength
      );

      // 4. Completed -> Navigate to Result page
      setProcessingStage('completed');
      navigate(`/summary/${uploadedDoc._id}`, {
        state: {
          document: uploadedDoc,
          summary: summaryRes.data.summary,
        },
      });
    } catch (error) {
      console.error('Upload / Summarize failed:', error);
      setIsProcessing(false);
      setErrorMessage(
        error.message || 'An error occurred while processing your document. Please try again.'
      );
    }
  };

  const handleReset = () => {
    setIsProcessing(false);
    setErrorMessage('');
    setCurrentFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Extraction & Summarization</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload & Summarize Document
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Upload a PDF or image file. Our AI pipeline will extract the text and generate a
          structured summary with key takeaways.
        </p>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800 space-y-3 animate-fadeIn max-w-xl mx-auto">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-900">Processing Failed</h4>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Upload / Processing Card */}
      {!isProcessing ? (
        <div className="max-w-2xl mx-auto">
          <DocumentUploader
            onFileUpload={handleFileUpload}
            isProcessing={isProcessing}
            uploadProgress={uploadProgress}
            summaryLength={summaryLength}
            onSummaryLengthChange={setSummaryLength}
          />
        </div>
      ) : (
        <ProcessingState
          stage={processingStage}
          fileName={currentFile?.name}
          fileType={currentFile?.name?.split('.').pop() || 'pdf'}
        />
      )}
    </div>
  );
};

export default UploadPage;
