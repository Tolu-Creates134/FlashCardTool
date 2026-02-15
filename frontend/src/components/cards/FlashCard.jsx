import React from 'react'

/**
 * Single flashcard component
 * @param {*} param0 
 * @returns 
 */
const FlashCard = ({flashcard, index}) => {
  return (
    <div key={flashcard.id || index} className="border rounded-md p-4">
        <div key={flashcard.id || index} className="border rounded-md p-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">
                Question {index + 1}
            </p>
            <p className="text-gray-800 mb-3">{flashcard.question}</p>
            <p className="text-sm font-semibold text-gray-700 mb-1">
                Answer
            </p>
            <p className="text-gray-800">{flashcard.answer}</p>
        </div>
    </div>
  )
}

export default FlashCard