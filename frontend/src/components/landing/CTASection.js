import React from 'react';
import { ArrowRightIcon } from 'lucide-react';

/**
 * Final call-to-action section for the landing page
 * @param {*} param0
 * @returns
 */
const CTASection = ({ onSignup }) => {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-center shadow-2xl md:p-16">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-indigo-300/30 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl font-bold text-white md:text-5xl">
              Start learning smarter with FlashLearn
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100">
              Create your first AI-powered deck, review your cards, and turn class notes into study momentum.
            </p>
            <button
              type="button"
              onClick={onSignup}
              className="mt-10 inline-flex items-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-indigo-700 shadow-lg transition-colors hover:bg-indigo-50"
            >
              Start Learning Free
              <ArrowRightIcon size={18} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
