import React from 'react';
import { BookOpenIcon } from 'lucide-react';

/**
 * Footer section for the public landing page
 * @returns
 */
const FooterSection = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center space-x-2">
            <BookOpenIcon size={20} className="text-indigo-600" />
            <span className="text-lg font-bold text-slate-900">FlashLearn</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-slate-500">
            <span>AI Flashcards</span>
            <span>Practice Mode</span>
            <span>Progress Tracking</span>
            <span>Active Recall</span>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} FlashLearn. Your AI-powered study companion.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
