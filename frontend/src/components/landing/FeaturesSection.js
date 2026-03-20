import React from 'react';
import { FolderIcon, PlayIcon, TrendingUpIcon, ZapIcon } from 'lucide-react';

const features = [
  {
    title: 'AI Flashcard Generator',
    description:
      'Create draft flashcards from lecture notes, study guides, and documents without the manual copy-and-paste.',
    icon: ZapIcon,
    accent: 'bg-indigo-100 text-indigo-600',
  },
  {
    title: 'Practice Mode',
    description:
      'Review with a focused flashcard experience designed around active recall instead of passive reading.',
    icon: PlayIcon,
    accent: 'bg-violet-100 text-violet-600',
  },
  {
    title: 'Deck Organization',
    description:
      'Keep subjects tidy with categories and reusable decks that are easy to edit and revisit later.',
    icon: FolderIcon,
    accent: 'bg-sky-100 text-sky-600',
  },
  {
    title: 'Progress Tracking',
    description:
      'Track practice sessions and spot weak areas so you know what deserves another pass before the exam.',
    icon: TrendingUpIcon,
    accent: 'bg-emerald-100 text-emerald-600',
  },
];

/**
 * Product feature grid for the public landing page
 * @returns
 */
const FeaturesSection = () => {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Everything you need to study smarter
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            FlashLearn combines AI-powered deck creation with the study tools you already need.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.accent}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
