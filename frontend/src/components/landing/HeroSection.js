import React from 'react';
import { ArrowRightIcon, BookOpenIcon, SparklesIcon } from 'lucide-react';

/**
 * Marketing hero section for the public landing page
 * @param {*} param0
 * @returns
 */
const HeroSection = ({ onLogin, onSignup, onScrollToHowItWorks }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-slate-50 pb-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute right-0 top-32 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
      </div>

      <nav className="relative z-10 border-b border-indigo-100/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onSignup}
            className="flex items-center space-x-2 text-left"
          >
            <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-sm">
              <BookOpenIcon size={18} />
            </div>
            <span className="text-xl font-bold text-slate-900">FlashLearn</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onLogin}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onSignup}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full border border-indigo-100 bg-white px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm">
            <SparklesIcon size={14} className="mr-2" />
            FlashLearn AI helps you build better decks faster
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Turn your study notes into
            <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              flashcards in seconds
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Upload notes, paste lecture content, and generate polished flashcards
            with AI so you can spend less time formatting and more time learning.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onSignup}
              className="inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 sm:w-auto"
            >
              Start Learning Free
              <ArrowRightIcon size={18} className="ml-2" />
            </button>
            <button
              type="button"
              onClick={onScrollToHowItWorks}
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
            >
              See How It Works
            </button>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="rounded-3xl border border-indigo-100 bg-white p-3 shadow-2xl shadow-slate-200/70">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <div className="flex items-center border-b border-slate-200 bg-white px-4 py-3">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-rose-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  Biology 101 deck draft
                </div>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-3 md:p-8">
                <div className="space-y-4 md:col-span-1">
                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Source Notes
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 rounded bg-slate-200" />
                      <div className="h-3 w-5/6 rounded bg-slate-200" />
                      <div className="h-3 rounded bg-slate-200" />
                      <div className="h-3 w-4/6 rounded bg-slate-200" />
                    </div>
                  </div>
                  <div className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700">
                    <SparklesIcon size={14} className="mr-1.5" />
                    Generating 24 flashcards
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                  {[1, 2, 3].map((card) => (
                    <div
                      key={card}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Question
                        </span>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                          AI Draft
                        </span>
                      </div>
                      <div className="mt-3 h-4 w-3/4 rounded bg-slate-800/80" />
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Answer
                        </span>
                        <div className="mt-2 h-3 rounded bg-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
