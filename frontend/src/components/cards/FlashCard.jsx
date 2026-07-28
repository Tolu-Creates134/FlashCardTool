import React from 'react';
import RichTextContent from '../ui/RichTextContent';

/**
 * Single flashcard component
 * @param {*} param0
 * @returns
 */
const FlashCard = ({ flashcard, index }) => {
  return (
    <div key={flashcard.id || index} className='border rounded-md p-4'>
      <div key={flashcard.id || index} className='border rounded-md p-4'>
        <p className='text-sm font-semibold text-gray-700 mb-1'>
          Question {index + 1}
        </p>
        <RichTextContent
          html={flashcard.question}
          className='text-gray-800 mb-3'
        />
        <p className='text-sm font-semibold text-gray-700 mb-1'>Answer</p>
        <RichTextContent 
          html={flashcard.answer} 
          className='text-gray-800' 
        />
      </div>
    </div>
  );
};

export default FlashCard;
