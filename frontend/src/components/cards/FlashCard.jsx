import React from 'react';
import { CircleHelp, MessageSquareQuote } from 'lucide-react';
import RichTextContent from '../ui/RichTextContent';

/**
 * Single flashcard component
 * @param {*} param0
 * @returns
 */
const FlashCard = ({ flashcard, index }) => {
  return (
    <div
      key={flashcard.id || index}
      className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/80'
    >
      <div className='border-b border-slate-200 bg-slate-200 px-5 py-3'>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-400'>
          Card {index + 1}
        </p>
      </div>

      <div className='px-5 py-5'>
        <section className='border-l-2 border-indigo-500 pl-4'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.2em] text-indigo-700'>
            <CircleHelp size={13} />
            Question
          </div>
          <RichTextContent
            html={flashcard.question}
            className='text-[15px] font-medium leading-7 text-slate-800'
          />
        </section>

        <div className='my-6 border-t border-slate-200' />

        <section className='border-l-2 border-slate-300 pl-4'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-600'>
            <MessageSquareQuote size={13} />
            Answer
          </div>
          <RichTextContent
            html={flashcard.answer}
            className='text-[15px] leading-7 text-slate-600'
          />
        </section>
      </div>
    </div>
  );
};

export default FlashCard;
