import React from 'react'
import { BookOpenIcon } from "lucide-react";

const DeckCard = ({ deck, categoryName, onSelect }) => {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer h-48 flex flex-col"
      onClick={() => onSelect(deck.id)}
    >
      <div className="flex items-center mb-3">
        <BookOpenIcon size={18} className="text-indigo-500 mr-2" />
        <h3 className="font-semibold text-lg text-gray-800">{deck.name}</h3>
      </div>

      <p className="text-gray-600 mb-4 text-sm flex-grow">{deck.description}</p>

      <div className="flex justify-between items-center mt-auto">
        <span className="text-xs text-gray-500">
          {deck.flashcards?.length || 0} cards
        </span>
        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
          {categoryName || "Uncategorized"}
        </span>
      </div>
    </div>
  );
};

export default DeckCard