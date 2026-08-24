import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  Sparkles,
  Layers,
  FileText,
  Copy,
  Check,
  Globe,
  Lightbulb,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';

export const DocumentReader = ({
  document,
  currentPage = 1,
  onPageChange,
  pageRange = { start: 1, end: 1 },
  onPageRangeChange,
  isRangeMode = false,
  onRangeModeToggle,
  onSelectionAction, // (actionType, { selectedText, summaryLength, targetLanguage, prompt })
  selectedText = '',
  onTextSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [floatingMenuPos, setFloatingMenuPos] = useState(null);
  const [copiedPage, setCopiedPage] = useState(false);
  const containerRef = useRef(null);

  const pages = document?.pages || [];
  const totalPages = document?.pageCount || (pages.length > 0 ? pages.length : 1);

  // Active page object or text
  const activePageObj = pages.find((p) => p.pageNumber === currentPage);
  const activePageText = activePageObj?.text || document?.extractedText || 'No text extracted on this page.';

  // If in range mode, aggregate text
  const rangePages = pages.filter(
    (p) => p.pageNumber >= pageRange.start && p.pageNumber <= pageRange.end
  );

  // Selection detection
  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString()?.trim();

    if (text && text.length > 3) {
      onTextSelect(text);

      // Calculate position for floating quick action toolbar
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        if (containerRect) {
          setFloatingMenuPos({
            top: Math.max(10, rect.top - containerRect.top - 46),
            left: Math.max(10, Math.min(containerRect.width - 260, rect.left - containerRect.left)),
          });
        }
      }
    } else {
      // If clicked elsewhere without selecting
      if (!text) {
        setFloatingMenuPos(null);
      }
    }
  };

  const handleCopyPageText = () => {
    const textToCopy = isRangeMode
      ? rangePages.map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n')
      : activePageText;

    navigator.clipboard.writeText(textToCopy);
    setCopiedPage(true);
    setTimeout(() => setCopiedPage(false), 2000);
  };

  // Highlight search keywords
  const renderHighlightedContent = (rawText) => {
    if (!searchQuery.trim()) return rawText;

    const parts = rawText.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 text-amber-950 font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[750px] overflow-hidden"
    >
      {/* Top Reader Controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>Document Reader</span>
              <span className="text-xs font-normal text-slate-500">
                ({totalPages} {totalPages === 1 ? 'page' : 'pages'})
              </span>
            </h3>
          </div>
        </div>

        {/* Search within document */}
        <div className="relative w-48 sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search text..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Page Nav & Range Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRangeModeToggle}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              isRangeMode
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            title="Switch between single page view and page range view"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isRangeMode ? 'Range Mode' : 'Single Page'}</span>
          </button>

          {!isRangeMode ? (
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-800 px-1.5">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1">
              <span>From:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={pageRange.start}
                onChange={(e) =>
                  onPageRangeChange({
                    ...pageRange,
                    start: Math.max(1, Math.min(Number(e.target.value), pageRange.end)),
                  })
                }
                className="w-10 border border-slate-200 rounded px-1 py-0.5 text-center font-bold"
              />
              <span>To:</span>
              <input
                type="number"
                min={pageRange.start}
                max={totalPages}
                value={pageRange.end}
                onChange={(e) =>
                  onPageRangeChange({
                    ...pageRange,
                    end: Math.min(totalPages, Math.max(Number(e.target.value), pageRange.start)),
                  })
                }
                className="w-10 border border-slate-200 rounded px-1 py-0.5 text-center font-bold"
              />
            </div>
          )}
        </div>
      </div>

      {/* Selected Text Notification Bar */}
      {selectedText && (
        <div className="bg-blue-50/90 border-b border-blue-200 px-4 py-2 flex items-center justify-between text-xs text-blue-900 animate-fadeIn">
          <div className="flex items-center gap-2 truncate pr-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold shrink-0">Selected ({selectedText.length} chars):</span>
            <span className="truncate italic text-blue-800">"{selectedText}"</span>
          </div>
          <button
            onClick={() => onTextSelect('')}
            className="text-blue-600 hover:text-blue-900 p-1 font-semibold"
            title="Clear Selection"
          >
            Clear
          </button>
        </div>
      )}

      {/* Floating Selection Quick Actions Toolbar */}
      {floatingMenuPos && selectedText && (
        <div
          style={{ top: `${floatingMenuPos.top}px`, left: `${floatingMenuPos.left}px` }}
          className="absolute z-30 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-xl px-2 py-1.5 flex items-center gap-1 border border-slate-700 animate-fadeIn"
        >
          <button
            onClick={() =>
              onSelectionAction('summarize', {
                selectedText,
                summaryLength: 'short',
                scope: 'selection',
              })
            }
            className="px-2.5 py-1 text-xs font-semibold hover:bg-blue-600 rounded-lg flex items-center gap-1 transition-colors"
            title="Summarize selected text into 2-3 sentences"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Summarize Short</span>
          </button>

          <button
            onClick={() =>
              onSelectionAction('explain', {
                selectedText,
                scope: 'selection',
              })
            }
            className="px-2.5 py-1 text-xs font-semibold hover:bg-indigo-600 rounded-lg flex items-center gap-1 transition-colors"
            title="Explain in simple English"
          >
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Explain</span>
          </button>

          <button
            onClick={() =>
              onSelectionAction('translate', {
                selectedText,
                scope: 'selection',
                targetLanguage: 'Telugu',
              })
            }
            className="px-2.5 py-1 text-xs font-semibold hover:bg-emerald-600 rounded-lg flex items-center gap-1 transition-colors"
            title="Translate to Telugu"
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>Translate</span>
          </button>
        </div>
      )}

      {/* Main Document Content Viewer */}
      <div
        onMouseUp={handleMouseUp}
        className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 select-text font-serif leading-relaxed text-slate-800 text-sm sm:text-base selection:bg-blue-200 selection:text-blue-900"
      >
        {!isRangeMode ? (
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 text-xs font-sans text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleCopyPageText}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
                title="Copy Page Content"
              >
                {copiedPage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <div className="whitespace-pre-line">
              {renderHighlightedContent(activePageText)}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-sans text-indigo-600 font-semibold">
              <span>
                Viewing Pages {pageRange.start} to {pageRange.end}
              </span>
              <button
                onClick={handleCopyPageText}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
              >
                {copiedPage ? 'Copied All' : 'Copy All Text'}
              </button>
            </div>
            {rangePages.map((p) => (
              <div key={p.pageNumber} className="border-b border-slate-100 pb-6 last:border-b-0">
                <div className="text-xs font-sans font-bold text-slate-400 mb-2">
                  PAGE {p.pageNumber}
                </div>
                <div className="whitespace-pre-line">
                  {renderHighlightedContent(p.text)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reader Footer Hint */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>💡 Select any paragraph to trigger instant AI actions</span>
        <span className="text-slate-400">{document?.fileName}</span>
      </div>
    </div>
  );
};

export default DocumentReader;
