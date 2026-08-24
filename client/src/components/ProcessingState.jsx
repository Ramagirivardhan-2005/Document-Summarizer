import React from 'react';
import {
  UploadCloud,
  FileSearch,
  Cpu,
  Sparkles,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const ProcessingState = ({
  stage = 'uploading', // 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'completed'
  fileName = '',
  fileType = 'pdf',
  isRegenerating = false,
}) => {
  const isImage = ['jpg', 'jpeg', 'png'].includes(fileType.toLowerCase());

  const stages = [
    {
      id: 'uploading',
      title: 'Uploading File',
      desc: `Transferring ${fileName || 'document'} securely`,
      icon: UploadCloud,
    },
    {
      id: 'extracting',
      title: isImage ? 'Running Tesseract OCR' : 'Extracting PDF Content',
      desc: isImage
        ? 'Recognizing optical characters from image...'
        : 'Parsing text and page structure...',
      icon: FileSearch,
    },
    {
      id: 'analyzing',
      title: 'Analyzing Structure',
      desc: 'Cleaning text and identifying core themes...',
      icon: Cpu,
    },
    {
      id: 'generating',
      title: 'Gemini AI Summarization',
      desc: 'Generating executive overview and key insights...',
      icon: Sparkles,
    },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === stage);

  return (
    <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xl max-w-xl mx-auto text-center space-y-8 animate-fadeIn">
      {/* Dynamic Animated Icon Banner */}
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
          {stage === 'generating' ? (
            <Sparkles className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '4s' }} />
          ) : stage === 'extracting' ? (
            <FileSearch className="w-10 h-10 text-white animate-bounce" />
          ) : (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-900">
          {isRegenerating ? 'Regenerating AI Summary' : 'Processing Document'}
        </h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto truncate">
          {fileName ? `Working on: ${fileName}` : 'Please wait while we analyze your content'}
        </p>
      </div>

      {/* Stepped Progress Workflow */}
      <div className="space-y-3.5 text-left max-w-md mx-auto">
        {stages.map((st, index) => {
          const isDone = currentStageIndex > index;
          const isCurrent = currentStageIndex === index || (stage === 'completed' && index === 3);
          const isPending = currentStageIndex < index;
          const Icon = st.icon;

          return (
            <div
              key={st.id}
              className={`flex items-start gap-3.5 p-3 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-blue-50/80 border border-blue-200'
                  : isDone
                  ? 'bg-slate-50/60 border border-slate-100 opacity-90'
                  : 'opacity-40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isDone
                    ? 'bg-emerald-100 text-emerald-600'
                    : isCurrent
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold ${
                    isCurrent ? 'text-blue-900' : isDone ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {st.title}
                </p>
                <p className="text-xs text-slate-500 truncate">{st.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <p className="text-xs text-slate-400">
          This usually takes 5 - 15 seconds depending on document length.
        </p>
      </div>
    </div>
  );
};

export default ProcessingState;
