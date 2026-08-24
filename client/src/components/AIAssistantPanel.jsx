import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Copy,
  Check,
  Globe,
  GitFork,
  Lightbulb,
  FileText,
  Trash2,
  HelpCircle,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  'Telugu',
  'Hindi',
  'Tamil',
  'Kannada',
  'Marathi',
  'Bengali',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Arabic',
  'Chinese',
];

const PRESET_PROMPTS = [
  'Explain the methodology in simple English and create a flowchart.',
  'Extract all key statistics, numbers, and dates mentioned.',
  'What are the primary conclusions, findings, or takeaways?',
  'List all technical terms and define them in plain language.',
];

export const AIAssistantPanel = ({
  documentId,
  selectedText = '',
  currentPage = 1,
  pageRange = { start: 1, end: 1 },
  isRangeMode = false,
  onExecuteQuery, // async ({ actionType, scope, selectedText, pageNumber, startPage, endPage, prompt, summaryLength, targetLanguage })
  interactions = [],
  onDeleteInteraction,
  isProcessing = false,
}) => {
  const [activeTab, setActiveTab] = useState('custom'); // 'summarize' | 'explain' | 'translate' | 'custom'
  const [promptText, setPromptText] = useState('');
  const [summaryLength, setSummaryLength] = useState('short');
  const [targetLanguage, setTargetLanguage] = useState('Telugu');
  const [copiedId, setCopiedId] = useState(null);
  const [flowchartRequested, setFlowchartRequested] = useState(false);

  // Active scope string
  const currentScope = selectedText
    ? 'selection'
    : isRangeMode
    ? 'page_range'
    : 'page';

  const scopeLabel = selectedText
    ? `Selected Text (${selectedText.length} chars)`
    : isRangeMode
    ? `Pages ${pageRange.start}–${pageRange.end}`
    : `Page ${currentPage}`;

  const handleSubmit = (actionTypeOverride, customOptions = {}) => {
    const actionToRun = actionTypeOverride || activeTab;

    let payload = {
      actionType: actionToRun,
      scope: customOptions.scope || currentScope,
      selectedText: customOptions.selectedText !== undefined ? customOptions.selectedText : selectedText,
      pageNumber: currentPage,
      startPage: pageRange.start,
      endPage: pageRange.end,
      summaryLength,
      targetLanguage,
      prompt: promptText,
      ...customOptions,
    };

    if (actionToRun === 'explain' && flowchartRequested) {
      payload.actionType = 'flowchart';
    }

    onExecuteQuery(payload);
    if (actionToRun === 'custom') {
      setPromptText('');
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[750px] overflow-hidden">
      {/* Panel Header & Scope Indicator */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Document AI Assistant</h3>
              <p className="text-xs text-slate-500">Contextual answers & translations</p>
            </div>
          </div>

          {/* Active Context Scope Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="max-w-[150px] truncate">{scopeLabel}</span>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'custom', label: 'Ask / Chat', icon: Sparkles },
            { id: 'summarize', label: 'Summarize', icon: FileText },
            { id: 'explain', label: 'Explain', icon: Lightbulb },
            { id: 'translate', label: 'Translate', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Controls based on selected tab */}
      <div className="p-4 border-b border-slate-100 bg-white space-y-3">
        {/* SUMMARIZE TAB */}
        {activeTab === 'summarize' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Summary Length:</span>
              <div className="flex items-center gap-1.5">
                {['short', 'medium', 'long'].map((len) => (
                  <button
                    key={len}
                    onClick={() => setSummaryLength(len)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                      summaryLength === len
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleSubmit('summarize')}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-white text-xs font-bold gradient-bg hover:opacity-95 disabled:opacity-50 shadow-xs"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>
                Summarize {selectedText ? 'Selected Snippet' : scopeLabel} ({summaryLength})
              </span>
            </button>
          </div>
        )}

        {/* EXPLAIN TAB */}
        {activeTab === 'explain' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={flowchartRequested}
                  onChange={(e) => setFlowchartRequested(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold">Include Mermaid Flowchart / Diagram</span>
              </label>
            </div>
            <button
              onClick={() => handleSubmit('explain')}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-white text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-xs"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>
                Explain {selectedText ? 'Selection' : scopeLabel} in Plain English
              </span>
            </button>
          </div>
        )}

        {/* TRANSLATE TAB */}
        {activeTab === 'translate' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700">Target Language:</span>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleSubmit('translate')}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-white text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-xs"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
              <span>
                Translate {selectedText ? 'Selection' : scopeLabel} to {targetLanguage}
              </span>
            </button>
          </div>
        )}

        {/* CUSTOM ASK / CHAT TAB */}
        {activeTab === 'custom' && (
          <div className="space-y-2.5">
            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && promptText.trim()) {
                    e.preventDefault();
                    handleSubmit('custom');
                  }
                }}
                rows={2}
                placeholder={`Ask anything about ${scopeLabel}... (e.g. "Explain methodology and create flowchart")`}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
              />
              <button
                onClick={() => handleSubmit('custom')}
                disabled={isProcessing || !promptText.trim()}
                className="absolute right-2 bottom-2.5 p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 transition-colors"
                title="Send query"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Quick preset prompt pills */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPromptText(preset);
                  }}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-left truncate max-w-[200px]"
                  title={preset}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interaction History / Responses Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {interactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <Sparkles className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No AI queries yet</p>
            <p className="text-[11px] max-w-xs leading-relaxed text-slate-400">
              Select any text in the reader or choose an action tab above to generate targeted
              summaries, plain-English explanations, flowcharts, and translations.
            </p>
          </div>
        ) : (
          interactions.map((item) => {
            const isCopied = copiedId === item._id;
            return (
              <div
                key={item._id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3 animate-fadeIn"
              >
                {/* Query Header */}
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>{item.query}</span>
                    {item.targetLanguage && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                        {item.targetLanguage}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item._id, item.response)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title="Copy response"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {onDeleteInteraction && (
                      <button
                        onClick={() => onDeleteInteraction(item._id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scope Snippet if selection */}
                {item.scopeDetails?.selectedTextSnippet && (
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 italic">
                    <span className="font-semibold text-slate-700 not-italic">Context: </span>"
                    {item.scopeDetails.selectedTextSnippet}..."
                  </div>
                )}

                {/* Formatted Response */}
                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line space-y-2">
                  {item.response}
                </div>

                <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AIAssistantPanel;
