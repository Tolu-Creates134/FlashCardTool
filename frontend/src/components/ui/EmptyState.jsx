import React from 'react'
import { BookOpenIcon, PlusIcon } from "lucide-react";

/**
 * Empty state component for when deck does not exist
 * @param {*} param0 
 * @returns 
 */
const EmptyState = ({ onCreateDeck }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
        <BookOpenIcon size={64} className="text-indigo-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
            No flashcard decks yet
        </h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">
            Create your first deck to start learning with AI-generated flashcards.
        </p>
        <button
            onClick={onCreateDeck}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
            <PlusIcon size={18} className="mr-2" />
            Create Your First Deck
        </button>
    </div>
  )
}

export default EmptyState