import React, { useEffect } from 'react'
import { FolderIcon } from "lucide-react";
import DeckGrid from './DeckGrid';

/**
 * Handles grouping decks by category
 * @param {*} param0 
 * @returns 
 */
const CategorySection = ({ category, decks, categories, onCreateDeck, onSelectDeck }) => {

  useEffect(() => {
  }, [])

  return (
    <div key={category.id} className="mb-8">
      <div>
        <FolderIcon size={20} className="text-indigo-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">{category.name}</h2>
      </div>
      <DeckGrid
        decks={decks.filter((deck) => deck.categoryId === category.id)}
        categories={categories}
        onSelectDeck={onSelectDeck}
        onCreateDeck={onCreateDeck}
      />
    </div>
  )
}

export default CategorySection