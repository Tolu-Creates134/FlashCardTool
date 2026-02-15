import React from 'react'
import { PlusIcon } from "lucide-react";
import DeckCard from '../../components/cards/DeckCard';

/**
 * Handles rendering a grid of decks
 * @param {*} param0 
 * @returns 
 */
const DeckGrid = ({decks, categories, onSelectDeck, onCreateDeck }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {decks.map((deck) => {
            const category = categories.find((c) => c.id === deck.categoryId)
            return(
                <DeckCard
                    key={deck.id}
                    deck={deck}
                    categoryName={category?.name}
                    onSelect={onSelectDeck}
                />
            )
        })}

        <button
            onClick={onCreateDeck}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg h-48 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
        >
            <PlusIcon size={32} className="text-indigo-500 mb-2"/>
            <span className="text-indigo-600 font-medium">Add Deck</span>
        </button>
    </div>
  )
}

export default DeckGrid