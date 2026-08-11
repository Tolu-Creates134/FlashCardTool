import React from 'react'
import { FolderIcon, Trash2 } from "lucide-react";
import DeckGrid from './DeckGrid';

/**
 * Handles grouping decks by category
 * @param {*} param0 
 * @returns 
 */
const CategorySection = ({ category, decks, categories, onCreateDeck, onSelectDeck, onDeleteCategory }) => {

  const deckCount = decks.length

  return (
    <div key={category.id} className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderIcon size={20} className="text-indigo-500" />
          <h2 className="text-xl font-semibold text-gray-800">{category.name}</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {deckCount} {deckCount === 1 ? 'deck' : 'decks'}
          </span>
          <button
            type="button"
            onClick={() => onDeleteCategory(category)}
            aria-label={`Delete category ${category.name}`}
            title="Delete category"
            className="rounded-lg p-2 text-red-400 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>

      </div>

      <div className="mt-4">
        <DeckGrid
          decks={decks}
          categories={categories}
          onSelectDeck={onSelectDeck}
          onCreateDeck={onCreateDeck}
          existingCategoryId={category.id}
        />
      </div>
    </div>
  )
}

export default CategorySection
