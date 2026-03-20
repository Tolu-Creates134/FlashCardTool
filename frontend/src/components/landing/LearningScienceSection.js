import React from 'react';
import { BrainIcon, CheckIcon, ClockIcon } from 'lucide-react';

const principles = [
  {
    title: 'Active Recall',
    description:
      'Retrieving information from memory strengthens retention far more effectively than re-reading notes.',
    icon: BrainIcon,
    accent: 'text-indigo-300',
  },
  {
    title: 'Spaced Repetition',
    description:
      'Revisiting material at the right intervals helps move what you learn into long-term memory.',
    icon: ClockIcon,
    accent: 'text-violet-300',
  },
  {
    title: 'Testing Effect',
    description:
      'Practising with questions trains your brain to retrieve information under real exam conditions.',
    icon: CheckIcon,
    accent: 'text-emerald-300',
  },
];

/**
 * Learning science section for the public landing page
 * @returns
 */
const LearningScienceSection = () => {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-12 top-0 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Built on learning science</h2>
          <p className="mt-4 text-lg text-slate-300">
            FlashLearn is designed around proven techniques that help you remember more with less wasted effort.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {principles.map((principle) => {
            const Icon = principle.icon;

            return (
              <div
                key={principle.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
              >
                <Icon size={32} className={principle.accent} />
                <h3 className="mt-5 text-xl font-bold">{principle.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{principle.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LearningScienceSection;
