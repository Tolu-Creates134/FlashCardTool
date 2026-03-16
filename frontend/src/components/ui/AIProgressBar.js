import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

/**
 * Reusable centered progress overlay for long-running AI operations
 * @param {*} param0
 * @returns
 */
const AIProgressBar = ({
  isVisible,
  progress = 0,
  message = 'Generating your flashcards...',
  isComplete = false,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/25 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-indigo-100 bg-white p-8 shadow-2xl shadow-slate-300/40">
        <div className="mb-5 flex items-center justify-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            {isComplete ? <CheckCircle2 size={28} /> : <Sparkles size={26} className="animate-pulse" />}
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-900">
            {isComplete ? 'Done' : 'Generating with AI'}
          </h3>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </div>

        <div className="mt-6">
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-500 transition-[width] duration-300 ease-out"
              style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{isComplete ? 'Finalizing deck draft' : 'Preparing review draft'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProgressBar;
