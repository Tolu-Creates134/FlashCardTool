import React from 'react';
import { PlayIcon, SparklesIcon, UploadIcon } from 'lucide-react';

const steps = [
  {
    number: '1',
    title: 'Add your material',
    description:
      'Paste notes or bring in documents and slides from the classes you need to master.',
    accent: 'bg-indigo-100 text-indigo-600',
    content: (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
        <UploadIcon size={30} className="mb-3 text-slate-400" />
        <span className="text-sm font-medium text-slate-500">Drop notes or PDF here</span>
      </div>
    ),
  },
  {
    number: '2',
    title: 'Review AI drafts',
    description:
      'FlashLearn extracts the key ideas and formats them into concise question and answer pairs.',
    accent: 'bg-violet-100 text-violet-600',
    content: (
      <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10" />
        <div className="relative rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center text-sm font-medium text-slate-700">
            <SparklesIcon size={16} className="mr-2 text-indigo-600" />
            Extracting key concepts...
          </div>
        </div>
      </div>
    ),
  },
  {
    number: '3',
    title: 'Practice with purpose',
    description:
      'Use active recall and spaced repetition to focus on what you need to remember most.',
    accent: 'bg-emerald-100 text-emerald-600',
    content: (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-6">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <span className="text-sm font-medium text-slate-800">
            What is the powerhouse of the cell?
          </span>
        </div>
        <button
          type="button"
          className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          <PlayIcon size={14} className="mr-1.5" />
          Flip Card
        </button>
      </div>
    ),
  },
];

/**
 * Three-step explainer section for the landing page
 * @param {*} props
 * @param {*} ref
 * @returns
 */
const HowItWorksSection = React.forwardRef((props, ref) => {
  return (
    <section ref={ref} className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            How FlashLearn works
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From source material to active recall in three simple steps.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${step.accent}`}>
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-slate-600">{step.description}</p>
              <div className="mt-6">{step.content}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default HowItWorksSection;
