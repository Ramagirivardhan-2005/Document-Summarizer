import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { documentService, summaryService } from '../services/api';
import ProcessingState from '../components/ProcessingState';
import DocumentReader from '../components/DocumentReader';
import AIAssistantPanel from '../components/AIAssistantPanel';
import {
  FileText,
  Copy,
  Check,
  Download,
  RotateCw,
  UploadCloud,
  FileCheck,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  Lightbulb,
  ListOrdered,
  Tag,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  LayoutDashboard,
} from 'lucide-react';
import jsPDF from 'jspdf';

export const SummaryResultPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [document, setDocument] = useState(location.state?.document || null);
  const [summary, setSummary] = useState(location.state?.summary || null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(!location.state?.summary);
  const [error, setError] = useState('');

  // Active view: 'summary' | 'studio'
  const [activeView, setActiveView] = useState('studio'); // Default to Interactive Studio

  // Reader state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageRange, setPageRange] = useState({ start: 1, end: 1 });
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // AI Query state
  const [isQuerying, setIsQuerying] = useState(false);

  // Regeneration state
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedLength, setSelectedLength] = useState(
    location.state?.summary?.summaryLength || 'medium'
  );

  // Copy state
  const [copied, setCopied] = useState(false);

  const fetchDocumentData = async () => {
    setLoading(true);
    setError('');
    try {
      const docRes = await documentService.getDocumentById(documentId);
      setDocument(docRes.data.document);
      setInteractions(docRes.data.interactions || []);

      if (docRes.data.summary) {
        setSummary(docRes.data.summary);
        setSelectedLength(docRes.data.summary.summaryLength || 'medium');
      } else {
        const sumRes = await summaryService.generateSummary(documentId, 'medium');
        setSummary(sumRes.data.summary);
      }
    } catch (err) {
      console.error('Failed to load document/summary:', err);
      setError(err.message || 'Failed to retrieve document details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentData();
  }, [documentId]);

  // Handle Interactive AI Query
  const handleExecuteAIQuery = async (queryPayload) => {
    setIsQuerying(true);
    try {
      const res = await documentService.sendAIQuery(documentId, queryPayload);
      setInteractions((prev) => [...prev, res.data.interaction]);
      setSelectedText(''); // reset selection after action
    } catch (err) {
      alert(`AI Query Failed: ${err.message}`);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleDeleteInteraction = async (interactionId) => {
    try {
      await documentService.deleteInteraction(documentId, interactionId);
      setInteractions((prev) => prev.filter((item) => item._id !== interactionId));
    } catch (err) {
      console.error('Failed to delete interaction:', err);
    }
  };

  const handleRegenerate = async (newLength) => {
    const lengthToUse = newLength || selectedLength;
    setIsRegenerating(true);
    setError('');

    try {
      const res = await summaryService.regenerateSummary(documentId, lengthToUse);
      setSummary(res.data.summary);
      setSelectedLength(lengthToUse);
    } catch (err) {
      console.error('Regeneration failed:', err);
      setError(err.message || 'Failed to regenerate summary.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format summary as clean readable text
  const getFormattedPlainText = () => {
    if (!summary || !document) return '';

    return `DOCUMENT SUMMARY REPORT
==================================================
Document: ${document.fileName}
File Type: ${document.fileType?.toUpperCase()} | Size: ${formatFileSize(document.fileSize)} | Pages: ${document.pageCount || 1}
Generated: ${new Date(summary.createdAt).toLocaleString()}
Summary Length: ${summary.summaryLength?.toUpperCase()}
==================================================

TITLE: ${summary.title}

OVERVIEW:
${summary.overview}

MAIN SUMMARY:
${summary.summary}

KEY POINTS:
${(summary.keyPoints || []).map((kp, idx) => `${idx + 1}. ${kp}`).join('\n')}

MAIN IDEAS:
${(summary.mainIdeas || []).map((mi) => `• ${mi}`).join('\n')}

IMPORTANT TOPICS:
${(summary.importantTopics || []).map((it) => `• ${it}`).join('\n')}

CONCLUSION:
${summary.conclusion}
`;
  };

  const handleCopySummary = async () => {
    try {
      const text = getFormattedPlainText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadTxt = () => {
    const text = getFormattedPlainText();
    const element = window.document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${document?.fileName || 'document'}-summary.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  const handleDownloadPdf = () => {
    if (!summary || !document) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text('Document Summary Assistant', margin, y);
    y += 8;

    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(summary.title || document.fileName, maxLineWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 6 + 2;

    // Metadata Bar
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const metaText = `File: ${document.fileName}  |  Type: ${document.fileType?.toUpperCase()}  |  Size: ${formatFileSize(
      document.fileSize
    )}  |  Pages: ${document.pageCount || 1}  |  Length: ${summary.summaryLength?.toUpperCase()}`;
    doc.text(metaText, margin, y);
    y += 4;

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    const addSectionHeading = (heading) => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235);
      doc.text(heading.toUpperCase(), margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
    };

    if (summary.overview) {
      addSectionHeading('1. Executive Overview');
      const overviewLines = doc.splitTextToSize(summary.overview, maxLineWidth);
      checkPageBreak(overviewLines.length * 5);
      doc.text(overviewLines, margin, y);
      y += overviewLines.length * 5 + 6;
    }

    if (summary.summary) {
      addSectionHeading('2. Main Summary');
      const summaryLines = doc.splitTextToSize(summary.summary, maxLineWidth);
      checkPageBreak(summaryLines.length * 5);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 5 + 6;
    }

    if (summary.keyPoints && summary.keyPoints.length > 0) {
      addSectionHeading('3. Key Points');
      summary.keyPoints.forEach((point, idx) => {
        const pointLines = doc.splitTextToSize(`${idx + 1}.  ${point}`, maxLineWidth - 4);
        checkPageBreak(pointLines.length * 5 + 2);
        doc.text(pointLines, margin + 2, y);
        y += pointLines.length * 5 + 2;
      });
      y += 4;
    }

    if (summary.mainIdeas && summary.mainIdeas.length > 0) {
      addSectionHeading('4. Core Ideas');
      summary.mainIdeas.forEach((idea) => {
        const ideaLines = doc.splitTextToSize(`•   ${idea}`, maxLineWidth - 4);
        checkPageBreak(ideaLines.length * 5 + 2);
        doc.text(ideaLines, margin + 2, y);
        y += ideaLines.length * 5 + 2;
      });
      y += 4;
    }

    if (summary.importantTopics && summary.importantTopics.length > 0) {
      addSectionHeading('5. Important Topics Covered');
      const topicsText = summary.importantTopics.join('  •  ');
      const topicLines = doc.splitTextToSize(topicsText, maxLineWidth);
      checkPageBreak(topicLines.length * 5);
      doc.text(topicLines, margin, y);
      y += topicLines.length * 5 + 6;
    }

    if (summary.conclusion) {
      addSectionHeading('6. Conclusion & Takeaways');
      const conclusionLines = doc.splitTextToSize(summary.conclusion, maxLineWidth);
      checkPageBreak(conclusionLines.length * 5);
      doc.text(conclusionLines, margin, y);
      y += conclusionLines.length * 5 + 6;
    }

    doc.save(`${document.fileName}-summary.pdf`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ProcessingState
          stage="generating"
          fileName={document?.fileName || 'Document'}
          fileType={document?.fileType || 'pdf'}
        />
      </div>
    );
  }

  if (isRegenerating) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ProcessingState
          stage="generating"
          fileName={document?.fileName || 'Document'}
          fileType={document?.fileType || 'pdf'}
          isRegenerating={true}
        />
      </div>
    );
  }

  if (error || !summary || !document) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Summary Not Available</h2>
          <p className="text-sm text-slate-600">
            {error || 'Unable to find or load the document.'}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </Link>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
          >
            <span>Back to History</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/history" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>History</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 max-w-[200px] sm:max-w-xs truncate">
            {document.fileName}
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setActiveView('studio')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeView === 'studio'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Interactive Studio (Read & Ask)</span>
            </button>

            <button
              onClick={() => setActiveView('summary')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeView === 'summary'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Executive Overview</span>
            </button>
          </div>

          <Link
            to="/upload"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white gradient-bg shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New</span>
          </Link>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE STUDIO (SPLIT-VIEW WORKSPACE) */}
      {activeView === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Document Reader (7 cols) */}
          <div className="lg:col-span-7">
            <DocumentReader
              document={document}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              pageRange={pageRange}
              onPageRangeChange={setPageRange}
              isRangeMode={isRangeMode}
              onRangeModeToggle={() => setIsRangeMode(!isRangeMode)}
              selectedText={selectedText}
              onTextSelect={setSelectedText}
              onSelectionAction={(actionType, options) => {
                handleExecuteAIQuery({
                  actionType,
                  scope: options.scope || 'selection',
                  selectedText: options.selectedText || selectedText,
                  pageNumber: currentPage,
                  startPage: pageRange.start,
                  endPage: pageRange.end,
                  summaryLength: options.summaryLength || 'short',
                  targetLanguage: options.targetLanguage || 'Telugu',
                });
              }}
            />
          </div>

          {/* Right Column: AI Assistant Panel (5 cols) */}
          <div className="lg:col-span-5">
            <AIAssistantPanel
              documentId={documentId}
              selectedText={selectedText}
              currentPage={currentPage}
              pageRange={pageRange}
              isRangeMode={isRangeMode}
              onExecuteQuery={handleExecuteAIQuery}
              interactions={interactions}
              onDeleteInteraction={handleDeleteInteraction}
              isProcessing={isQuerying}
            />
          </div>
        </div>
      )}

      {/* VIEW 2: EXECUTIVE SUMMARY VIEW */}
      {activeView === 'summary' && (
        <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
          {/* Metadata & Actions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Document Information
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 break-all">{document.fileName}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>
                      <strong className="text-slate-700">Type:</strong> {document.fileType?.toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-slate-700">Size:</strong> {formatFileSize(document.fileSize)}
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-slate-700">Pages:</strong> {document.pageCount || 1}
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-slate-700">Date:</strong> {new Date(summary.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <span>.TXT</span>
                </button>

                {/* Regenerate Length Switcher */}
                <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                  {['short', 'medium', 'long'].map((len) => (
                    <button
                      key={len}
                      onClick={() => handleRegenerate(len)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        selectedLength === len
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                  <button
                    onClick={() => handleRegenerate(selectedLength)}
                    className="p-1 text-slate-500 hover:text-blue-600"
                    title="Regenerate"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Summary Content Cards */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Full Document Summary</span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
              {summary.title || document.fileName}
            </h1>

            {summary.overview && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-950 text-sm leading-relaxed">
                <span className="font-bold text-blue-900 block mb-1">Overview:</span>
                {summary.overview}
              </div>
            )}

            <div className="pt-2 text-slate-700 text-sm leading-relaxed whitespace-pre-line space-y-4">
              <span className="font-bold text-slate-900 block text-sm">Detailed Summary:</span>
              {summary.summary}
            </div>
          </div>

          {/* Key Points and Main Ideas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {summary.keyPoints && summary.keyPoints.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
                  <ListOrdered className="w-4 h-4" />
                  <span>Key Points</span>
                </div>
                <ul className="space-y-3">
                  {summary.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.mainIdeas && summary.mainIdeas.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>Main Ideas</span>
                </div>
                <ul className="space-y-3">
                  {summary.mainIdeas.map((idea, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />
                      <span className="leading-snug">{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Important Topics */}
          {summary.importantTopics && summary.importantTopics.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-violet-600 text-xs font-bold uppercase tracking-wider">
                <Tag className="w-4 h-4" />
                <span>Important Topics & Themes</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {summary.importantTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 text-violet-800 border border-violet-200 shadow-2xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conclusion */}
          {summary.conclusion && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <FileCheck className="w-4 h-4" />
                <span>Conclusion & Key Takeaways</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{summary.conclusion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryResultPage;
